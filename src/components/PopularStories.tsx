"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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
                    isFavorite={story.isFavorite}
                    isBookmarked={story.isBookmarked}
                    onClick={() => console.log(`Navigate to story ${story.id}`)}
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
