"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./UserProvider";
import { toggleFavorite, toggleBookmark } from "@/lib/user-actions";
import { trackLike, trackBookmark } from "@/lib/track-activity";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import StoryCard from "./StoryCard";
import { cn } from "../lib/utils";

interface RecentlyReadProps {
  stories?: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    category: string;
    lastReadAt: string;
    progress: number;
    isFavorite?: boolean;
    isBookmarked?: boolean;
  }[];
  className?: string;
}

const RecentlyRead = ({ stories = [], className }: RecentlyReadProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [storyStates, setStoryStates] = useState<{
    [key: string]: { isFavorite: boolean; isBookmarked: boolean };
  }>(
    stories.reduce(
      (acc, story) => ({
        ...acc,
        [story.id]: {
          isFavorite: story.isFavorite || false,
          isBookmarked: story.isBookmarked || false,
        },
      }),
      {},
    ),
  );

  const handleFavoriteToggle = async (storyId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const currentState = storyStates[storyId]?.isFavorite || false;
    const newValue = !currentState;

    // Optimistic UI update
    setStoryStates((prev) => ({
      ...prev,
      [storyId]: { ...prev[storyId], isFavorite: newValue },
    }));

    // Show toast
    toast({
      description: newValue
        ? "Hikaye favorilere eklendi"
        : "Hikaye favorilerden çıkarıldı",
      duration: 2000,
    });

    try {
      // Update in database
      await toggleFavorite(user.id, storyId, newValue);

      // Track activity
      const uuidStoryId = storyId.startsWith("story-")
        ? `00000000-0000-0000-0000-${storyId.replace("story-", "").padStart(12, "0")}`
        : storyId;
      await trackLike(user.id, uuidStoryId, newValue ? 1 : 0);
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
      // Revert on error
      setStoryStates((prev) => ({
        ...prev,
        [storyId]: { ...prev[storyId], isFavorite: currentState },
      }));
      toast({
        variant: "destructive",
        description: "İşlem sırasında bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleBookmarkToggle = async (storyId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const currentState = storyStates[storyId]?.isBookmarked || false;
    const newValue = !currentState;

    // Optimistic UI update
    setStoryStates((prev) => ({
      ...prev,
      [storyId]: { ...prev[storyId], isBookmarked: newValue },
    }));

    // Show toast
    toast({
      description: newValue
        ? "Hikaye yer işaretlerine eklendi"
        : "Hikaye yer işaretlerinden çıkarıldı",
      duration: 2000,
    });

    try {
      // Update in database
      await toggleBookmark(user.id, storyId, newValue);

      // Track activity
      const uuidStoryId = storyId.startsWith("story-")
        ? `00000000-0000-0000-0000-${storyId.replace("story-", "").padStart(12, "0")}`
        : storyId;
      await trackBookmark(user.id, uuidStoryId, newValue ? 1 : 0);
    } catch (error) {
      console.error("Yer işareti işlemi hatası:", error);
      // Revert on error
      setStoryStates((prev) => ({
        ...prev,
        [storyId]: { ...prev[storyId], isBookmarked: currentState },
      }));
      toast({
        variant: "destructive",
        description: "İşlem sırasında bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <section className={cn("w-full py-8 bg-background", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Son Okuduklarınız</h2>
          <Button
            variant="ghost"
            className="text-sm flex items-center gap-1"
            onClick={() => router.push("/bookmarks")}
          >
            Tümünü Gör <ArrowRight size={16} />
          </Button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              Henüz hiç hikaye okumadınız.
            </p>
            <Button className="mt-4" onClick={() => router.push("/categories")}>
              Hikayeleri Keşfedin
            </Button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            style={{ maxWidth: "1440px", margin: "0 auto" }}
          >
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col w-full h-full">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>{story.lastReadAt}</span>
                </div>

                <div className="flex-1">
                  <StoryCard
                    id={story.id}
                    title={story.title}
                    description={story.description}
                    coverImage={
                      story.coverImage ||
                      "https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=300&q=80"
                    }
                    category={story.category}
                    isFavorite={storyStates[story.id]?.isFavorite || false}
                    isBookmarked={storyStates[story.id]?.isBookmarked || false}
                    onFavoriteToggle={() => handleFavoriteToggle(story.id)}
                    onBookmarkToggle={() => handleBookmarkToggle(story.id)}
                    onClick={() => router.push(`/story/${story.id}`)}
                  />
                </div>

                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${story.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Devam Et</span>
                    <span>{story.progress}% Tamamlandı</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentlyRead;
