"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import StoryCard from "@/components/StoryCard";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useUser } from "@/components/UserProvider";

// Statik hikaye verileri kaldırıldı

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user } = useUser();
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const searchStories = async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("stories")
          .select("*")
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`,
          );

        if (error) throw error;

        // Format the results
        const formattedResults = data.map((story) => ({
          id: story.id,
          title: story.title,
          description: story.description,
          coverImage: story.cover_image,
          category: story.category,
          isFavorite: false,
          isBookmarked: false,
        }));

        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Hikaye arama hatası:", error);
        setSearchResults([]);
      }
    };

    searchStories();
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Search size={24} />
          <h1 className="text-3xl font-bold">Arama Sonuçları</h1>
        </div>

        {query ? (
          <p className="text-muted-foreground mb-6">
            <span className="font-medium">"{query}"</span> için{" "}
            {searchResults.length} sonuç bulundu
          </p>
        ) : (
          <p className="text-muted-foreground mb-6">
            Lütfen arama yapmak için bir kelime girin
          </p>
        )}

        {searchResults.length === 0 && query ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground mb-2">
              Aramanızla eşleşen masal bulunamadı.
            </p>
            <p className="text-sm text-muted-foreground">
              Farklı anahtar kelimeler deneyebilir veya kategorilere göz
              atabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((story) => (
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
