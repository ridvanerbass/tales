"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
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

const RecentlyRead = ({
  stories = [],

  className,
}: RecentlyReadProps) => {
  return (
    <section className={cn("w-full py-8 bg-background", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Son Okuduklarınız</h2>
          <Button variant="ghost" className="text-sm flex items-center gap-1">
            Tümünü Gör <ArrowRight size={16} />
          </Button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              Henüz hiç hikaye okumadınız.
            </p>
            <Button className="mt-4">Hikayeleri Keşfedin</Button>
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
                    coverImage={story.coverImage}
                    category={story.category}
                    isFavorite={story.isFavorite}
                    isBookmarked={story.isBookmarked}
                    onClick={() =>
                      console.log(`Continue reading ${story.title}`)
                    }
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
