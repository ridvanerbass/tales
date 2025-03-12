"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "./UserProvider";
import { Heart, Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { t } from "@/lib/i18n";

interface StoryCardProps {
  id?: string;
  title?: string;
  description?: string;
  coverImage?: string;
  category?: string;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
  onBookmarkToggle?: () => void;
  compact?: boolean;
}

const StoryCard = ({
  id = "story-1",
  title = "Kırmızı Başlıklı Kız",
  description = "Büyükannesini ziyarete giden küçük bir kızın orman macerasını anlatan klasik bir masal.",
  coverImage = "",
  category = "Klasik Masallar",
  isFavorite = false,
  isBookmarked = false,
  onClick = () => {},
  onFavoriteToggle,
  onBookmarkToggle,
  compact = false,
}: StoryCardProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [isHovering, setIsHovering] = useState(false);
  const defaultImage =
    "https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=300&q=80";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle();
    } else {
      // Fallback to default behavior if no custom handler provided
      if (!user) {
        router.push("/login");
        return;
      }
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle();
    } else {
      // Fallback to default behavior if no custom handler provided
      if (!user) {
        router.push("/login");
        return;
      }
    }
  };

  return (
    <Card
      className="w-full h-full overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg bg-card rounded-xl border-0 shadow"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/story/${id}`}>
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={coverImage || defaultImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full bg-background/80 ${isFavorite ? "text-red-500" : "text-gray-500"} ${isHovering ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full bg-background/80 ${isBookmarked ? "text-blue-500" : "text-gray-500"} ${isHovering ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              onClick={handleBookmarkClick}
              aria-label={
                isBookmarked
                  ? "Yer işaretlerinden çıkar"
                  : "Yer işaretlerine ekle"
              }
            >
              <Bookmark
                size={16}
                className={isBookmarked ? "fill-current" : ""}
              />
            </Button>
          </div>
        </div>
      </Link>
      <CardHeader className="p-3 pb-2">
        <div className="text-xs text-muted-foreground mb-1">{category}</div>
        <CardTitle className="text-base truncate">{title}</CardTitle>
      </CardHeader>
      {!compact && (
        <CardContent className="p-3 pt-0 flex-grow">
          <CardDescription className="text-xs line-clamp-2">
            {description}
          </CardDescription>
        </CardContent>
      )}
      <CardFooter className="p-3 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-sm"
          onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
          }}
        >
          {t("story.readButton")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
