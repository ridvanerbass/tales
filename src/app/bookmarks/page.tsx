"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import StoryCard from "@/components/StoryCard";
import { Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useUser } from "@/components/UserProvider";
import RequireAuth from "@/components/RequireAuth";

export default function BookmarksPage() {
  const { user } = useUser();
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedStories = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_stories")
          .select("*, stories(*)")
          .eq("user_id", user.id)
          .eq("is_bookmarked", true);

        if (error) throw error;

        const formattedStories = data.map((item) => ({
          id: item.stories.id,
          title: item.stories.title,
          description: item.stories.description,
          coverImage: item.stories.cover_image,
          category: item.stories.category,
          isFavorite: item.is_favorite,
          isBookmarked: item.is_bookmarked,
        }));

        setBookmarkedStories(formattedStories);
      } catch (error) {
        console.error("Yer işaretli hikayeleri getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedStories();
  }, [user]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="text-blue-500 fill-current" size={24} />
            <h1 className="text-3xl font-bold">Yer İşaretlerim</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p>Yükleniyor...</p>
            </div>
          ) : bookmarkedStories.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground mb-2">
                Henüz yer işareti eklediğiniz masal bulunmuyor.
              </p>
              <p className="text-sm text-muted-foreground">
                Daha sonra okumak istediğiniz masalları yer işaretlerine eklemek
                için yer işareti simgesine tıklayın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bookmarkedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  title={story.title}
                  description={story.description}
                  coverImage={story.coverImage}
                  category={story.category}
                  isFavorite={story.isFavorite}
                  isBookmarked={story.isBookmarked}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
