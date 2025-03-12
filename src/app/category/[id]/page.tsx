"use client";

import React, { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import StoryCard from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useUser } from "@/components/UserProvider";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const categoryId = params.id as string;

  const [category, setCategory] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategoryAndStories = async () => {
      try {
        setLoading(true);

        // Kategori bilgilerini getir
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", categoryId)
          .single();

        if (categoryError) throw new Error("Kategori bulunamadı");
        setCategory(categoryData);

        // Kategoriye ait hikayeleri getir
        const { data: storiesData, error: storiesError } = await supabase
          .from("stories")
          .select("*")
          .eq("category_id", categoryId);

        if (storiesError) throw storiesError;

        // Kullanıcı giriş yapmışsa, favori ve yer işareti durumlarını kontrol et
        if (user && storiesData.length > 0) {
          const { data: userStories, error: userStoriesError } = await supabase
            .from("user_stories")
            .select("story_id, is_favorite, is_bookmarked")
            .eq("user_id", user.id)
            .in(
              "story_id",
              storiesData.map((story) => story.id),
            );

          if (!userStoriesError && userStories) {
            // Kullanıcı hikaye ilişkilerini bir map'e dönüştür
            const userStoryMap = {};
            userStories.forEach((us) => {
              userStoryMap[us.story_id] = {
                isFavorite: us.is_favorite,
                isBookmarked: us.is_bookmarked,
              };
            });

            // Hikayelere favori ve yer işareti bilgilerini ekle
            const storiesWithUserData = storiesData.map((story) => ({
              id: story.id,
              title: story.title,
              description: story.description,
              coverImage: story.cover_image,
              category: story.category,
              isFavorite: userStoryMap[story.id]?.isFavorite || false,
              isBookmarked: userStoryMap[story.id]?.isBookmarked || false,
            }));

            setStories(storiesWithUserData);
          } else {
            // Kullanıcı hikaye ilişkileri getirilemezse, varsayılan değerlerle devam et
            setStories(
              storiesData.map((story) => ({
                id: story.id,
                title: story.title,
                description: story.description,
                coverImage: story.cover_image,
                category: story.category,
                isFavorite: false,
                isBookmarked: false,
              })),
            );
          }
        } else {
          // Kullanıcı giriş yapmamışsa, varsayılan değerlerle devam et
          setStories(
            storiesData.map((story) => ({
              id: story.id,
              title: story.title,
              description: story.description,
              coverImage: story.cover_image,
              category: story.category,
              isFavorite: false,
              isBookmarked: false,
            })),
          );
        }
      } catch (err) {
        console.error("Kategori ve hikaye getirme hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndStories();
  }, [categoryId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Yükleniyor...</p>
        </main>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => router.push("/categories")}
          >
            <ChevronLeft size={16} className="mr-1" /> Kategorilere Dön
          </Button>
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground mb-2">
              {error || "Kategori bulunamadı."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push("/categories")}
        >
          <ChevronLeft size={16} className="mr-1" /> Kategorilere Dön
        </Button>

        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground mb-6">{category.description}</p>

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground mb-2">
              Bu kategoride henüz hikaye bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stories.map((story) => (
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
  );
}
