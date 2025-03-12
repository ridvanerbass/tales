"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./UserProvider";
import { toggleFavorite, toggleBookmark } from "@/lib/user-actions";
import { trackLike, trackBookmark } from "@/lib/track-activity";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import StoryCard from "./StoryCard";

interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  isFavorite: boolean;
  isBookmarked: boolean;
}

interface PopularStoriesProps {
  stories?: Story[];
  title?: string;
  description?: string;
}

const PopularStories = ({
  stories = [],
  title = "Popüler Masallar",
  description = "En çok okunan ve sevilen masallar",
}: PopularStoriesProps) => {
  const router = useRouter();
  const { user } = useUser();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [storyStates, setStoryStates] = useState<{
    [key: string]: { isFavorite: boolean; isBookmarked: boolean };
  }>(
    stories.reduce(
      (acc, story) => ({
        ...acc,
        [story.id]: {
          isFavorite: story.isFavorite,
          isBookmarked: story.isBookmarked,
        },
      }),
      {},
    ),
  );

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

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
    <section className="py-8 bg-background w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {stories.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              Henüz popüler hikaye bulunmuyor.
            </p>
          </div>
        ) : (
          <div
            className="w-full overflow-x-auto whitespace-nowrap pb-4"
            ref={scrollContainerRef}
          >
            <div className="flex space-x-4 pb-4">
              {stories.map((story) => (
                <div key={story.id} className="shrink-0 w-[180px] h-full">
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
                    compact={true}
                  />
                </div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="w-full h-1 bg-muted mt-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-1/3 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularStories;
