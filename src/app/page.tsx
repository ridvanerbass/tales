"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import Header from "@/components/Header";
import PopularStories from "@/components/PopularStories";
import Categories from "@/components/Categories";
import RecentlyRead from "@/components/RecentlyRead";
import { useUser } from "@/components/UserProvider";

export default function Home() {
  const { user } = useUser();
  const [popularStories, setPopularStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentlyRead, setRecentlyRead] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Popüler hikayeleri getir
        const { data: storiesData, error: storiesError } = await supabase
          .from("stories")
          .select("*")
          .order("views", { ascending: false })
          .limit(10);

        if (storiesError) throw storiesError;

        // Kategorileri getir
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;

        setPopularStories(storiesData || []);
        setCategories(categoriesData || []);

        // Kullanıcı giriş yapmışsa son okunan hikayeleri getir
        if (user) {
          const { data: userStoriesData } = await supabase
            .from("user_stories")
            .select("*, stories(*)")
            .eq("user_id", user.id)
            .order("last_read_at", { ascending: false })
            .limit(4);

          if (userStoriesData) {
            const formattedStories = userStoriesData.map((item) => ({
              ...item.stories,
              lastReadAt: formatTimeAgo(new Date(item.last_read_at)),
              progress: item.progress || 0,
              isFavorite: item.is_favorite,
              isBookmarked: item.is_bookmarked,
            }));
            setRecentlyRead(formattedStories);
          }
        }
      } catch (err) {
        console.error("Veri getirme hatası:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Zaman formatını "x saat önce", "dün" gibi formatlara dönüştürür
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 30) {
      return new Date(date).toLocaleDateString();
    } else if (diffInDays > 1) {
      return `${diffInDays} gün önce`;
    } else if (diffInDays === 1) {
      return "Dün";
    } else if (diffInHours >= 1) {
      return `${diffInHours} saat önce`;
    } else if (diffInMinutes >= 1) {
      return `${diffInMinutes} dakika önce`;
    } else {
      return "Az önce";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center justify-between">
        <div className="w-full">
          {loading ? (
            <div className="container mx-auto px-4 py-12 text-center">
              <p>Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="container mx-auto px-4 py-12 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <>
              <PopularStories stories={popularStories} />
              <Categories categories={categories} />
              {user && <RecentlyRead stories={recentlyRead} />}
            </>
          )}
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2023 Masal Dünyası. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Hakkımızda
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Gizlilik Politikası
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Kullanım Şartları
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                İletişim
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
