"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import Image from "next/image";
import {
  Heart,
  Bookmark,
  Share2,
  Volume2,
  Play,
  Book,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  AlertCircle,
  Pause,
} from "lucide-react";
import { t } from "@/lib/i18n";
import {
  trackView,
  trackLike,
  trackBookmark,
  trackListen,
} from "@/lib/track-activity";
import {
  toggleFavorite,
  toggleBookmark,
  checkUserStoryStatus,
} from "@/lib/user-actions";
import { trackVisitor } from "@/lib/track-visitor";
import StoryStats from "./components/StoryStats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase-client";

// Statik hikaye verileri kaldırıldı

export default function StoryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const storyId = params.id as string;
  // UUID formatına dönüştür
  const uuidStoryId = storyId.startsWith("story-")
    ? `00000000-0000-0000-0000-${storyId.replace("story-", "").padStart(12, "0")}`
    : storyId;

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("read");
  const [fontSize, setFontSize] = useState(16);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );

  // Fetch story data from database
  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        // Get story from database
        const { data, error } = await supabase
          .from("stories")
          .select("*")
          .eq("id", uuidStoryId)
          .single();

        if (error) {
          throw new Error("Story not found");
        } else {
          setStoryData(data);
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Hikaye yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId, uuidStoryId]);

  useEffect(() => {
    // Sayfa görüntülendiğinde ziyaretçi bilgilerini kaydet
    trackVisitor();

    // Hikaye görüntüleme sayısını artır
    trackView(user?.id || null, uuidStoryId);

    // Kullanıcı giriş yapmışsa, hikaye durumunu kontrol et
    const checkStatus = async () => {
      if (user) {
        try {
          const { isFavorite: isFav, isBookmarked: isBook } =
            await checkUserStoryStatus(user.id, storyId);
          setIsFavorite(isFav);
          setIsBookmarked(isBook);
        } catch (error) {
          console.error("Hikaye durumu kontrol hatası:", error);
        }
      }
    };

    checkStatus();
  }, [storyId, user, uuidStoryId]);

  // Initialize audio player
  useEffect(() => {
    if (storyData?.audioUrl && activeTab === "listen") {
      const audio = new Audio(storyData.audioUrl);
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        setAudioCurrentTime(audio.currentTime);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });
      setAudioElement(audio);

      return () => {
        audio.pause();
        audio.src = "";
        audio.removeEventListener("loadedmetadata", () => {});
        audio.removeEventListener("timeupdate", () => {});
        audio.removeEventListener("ended", () => {});
      };
    }
  }, [storyData, activeTab]);

  // Handle play/pause
  useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, audioElement]);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!user && !isPlaying) {
      router.push("/login");
      return;
    }
    const newValue = !isPlaying;
    setIsPlaying(newValue);
    if (newValue) {
      trackListen(user?.id || null, uuidStoryId);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Yükleniyor...</p>
        </main>
      </div>
    );
  }

  // If error and no story data, show error
  if (error && !storyData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Ana Sayfaya Dön
          </Button>
        </main>
      </div>
    );
  }

  // If no story data, show not found
  if (!storyData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Hikaye bulunamadı.</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Ana Sayfaya Dön
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar with story image and actions */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="sticky top-24">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg mb-4">
                <Image
                  src={storyData.coverImage}
                  alt={storyData.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex justify-between mb-4">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="icon"
                  className={
                    isFavorite ? "text-white bg-red-500 hover:bg-red-600" : ""
                  }
                  onClick={async () => {
                    if (!user) {
                      router.push("/login");
                      return;
                    }
                    setIsLoading(true);
                    const newValue = !isFavorite;
                    setIsFavorite(newValue);

                    // Favorilere ekle/çıkar
                    await toggleFavorite(user.id, storyId, newValue);

                    // Aktiviteyi takip et
                    trackLike(user.id, uuidStoryId, newValue ? 1 : 0);
                    setIsLoading(false);
                  }}
                >
                  <Heart
                    className={isFavorite ? "fill-current" : ""}
                    size={18}
                  />
                </Button>

                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="icon"
                  className={
                    isBookmarked
                      ? "text-white bg-blue-500 hover:bg-blue-600"
                      : ""
                  }
                  onClick={async () => {
                    if (!user) {
                      router.push("/login");
                      return;
                    }
                    setIsLoading(true);
                    const newValue = !isBookmarked;
                    setIsBookmarked(newValue);

                    // Yer işaretlerine ekle/çıkar
                    await toggleBookmark(user.id, storyId, newValue);

                    // Aktiviteyi takip et
                    trackBookmark(user.id, uuidStoryId, newValue ? 1 : 0);
                    setIsLoading(false);
                  }}
                >
                  <Bookmark
                    className={isBookmarked ? "fill-current" : ""}
                    size={18}
                  />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 size={18} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Facebook size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-sky-500 hover:text-sky-600"
                      >
                        <Twitter size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        <Instagram size={18} />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Card className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{t("story.category")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {storyData.category}
                  </p>
                </CardContent>
              </Card>

              {/* Import and use the StoryStats component */}
              <div className="mb-4">
                <StoryStats storyId={storyId} />
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">
                    {t("story.relatedStories")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    İlgili hikaye bulunamadı.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main content area */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={() => window.history.back()}
              >
                <ChevronLeft size={16} className="mr-1" />{" "}
                {t("story.backButton")}
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {storyData.title}
              </h1>
              <p className="text-muted-foreground">{storyData.description}</p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="read" className="flex items-center gap-1">
                    <Book size={16} /> {t("story.readTab")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="listen"
                    className="flex items-center gap-1"
                    disabled={!storyData.audioUrl}
                  >
                    <Volume2 size={16} /> {t("story.listenTab")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="watch"
                    className="flex items-center gap-1"
                    disabled={!storyData.videoUrl}
                  >
                    <Play size={16} /> {t("story.watchTab")}
                  </TabsTrigger>
                </TabsList>

                {activeTab === "read" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t("story.fontSize")}:
                    </span>
                    <Slider
                      defaultValue={[fontSize]}
                      max={24}
                      min={12}
                      step={1}
                      className="w-24"
                      onValueChange={handleFontSizeChange}
                    />
                  </div>
                )}
              </div>

              <TabsContent value="read" className="mt-4">
                {storyData.content ? (
                  <div
                    className="prose dark:prose-invert max-w-none"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: storyData.content }}
                  />
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Bu hikaye için içerik bulunmuyor.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="listen" className="mt-4">
                {storyData.audioUrl ? (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 shadow-lg">
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden shadow-lg">
                        <Image
                          src={storyData.coverImage}
                          alt={storyData.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">
                        {storyData.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        {storyData.category}
                      </p>

                      <div className="flex items-center gap-4 mb-6">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-10 w-10"
                          disabled
                        >
                          <ChevronLeft size={18} />
                        </Button>

                        <Button
                          size="lg"
                          className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? (
                            <Pause size={24} />
                          ) : (
                            <Play size={24} className="ml-1" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-10 w-10"
                          disabled
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>{formatTime(audioCurrentTime)}</span>
                        <span>
                          {audioDuration ? formatTime(audioDuration) : "0:00"}
                        </span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{
                            width: audioDuration
                              ? `${(audioCurrentTime / audioDuration) * 100}%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10"
                      >
                        <Volume2 size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-10 w-10 ${isFavorite ? "bg-red-100 dark:bg-red-900/30" : ""}`}
                        onClick={async () => {
                          if (!user) {
                            router.push("/login");
                            return;
                          }
                          setIsLoading(true);
                          const newValue = !isFavorite;
                          setIsFavorite(newValue);

                          // Favorilere ekle/çıkar
                          await toggleFavorite(user.id, storyId, newValue);

                          // Aktiviteyi takip et
                          trackLike(user.id, uuidStoryId, newValue ? 1 : 0);
                          setIsLoading(false);
                        }}
                      >
                        <Heart
                          size={18}
                          className={
                            isFavorite ? "fill-current text-red-500" : ""
                          }
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-10 w-10 ${isBookmarked ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}
                        onClick={async () => {
                          if (!user) {
                            router.push("/login");
                            return;
                          }
                          setIsLoading(true);
                          const newValue = !isBookmarked;
                          setIsBookmarked(newValue);

                          // Yer işaretlerine ekle/çıkar
                          await toggleBookmark(user.id, storyId, newValue);

                          // Aktiviteyi takip et
                          trackBookmark(user.id, uuidStoryId, newValue ? 1 : 0);
                          setIsLoading(false);
                        }}
                      >
                        <Bookmark
                          size={18}
                          className={
                            isBookmarked ? "fill-current text-blue-500" : ""
                          }
                        />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Bu hikaye için ses dosyası bulunmuyor.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="watch" className="mt-4">
                {storyData.videoUrl ? (
                  <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg overflow-hidden shadow-md">
                    <div className="aspect-video relative">
                      {/* Video player */}
                      <video
                        ref={(el) => setVideoElement(el)}
                        src={storyData.videoUrl}
                        poster={storyData.coverImage}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Bu hikaye için video bulunmuyor.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled
              >
                <ChevronLeft size={16} className="mr-1" />{" "}
                {t("story.previousStory")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled
              >
                {t("story.nextStory")}{" "}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
