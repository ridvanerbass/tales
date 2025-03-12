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
        // Check sessionStorage cache first
        const cachedStories = sessionStorage.getItem("popularStories");
        const cachedCategories = sessionStorage.getItem("categories");
        const cacheTimestamp = parseInt(
          sessionStorage.getItem("cacheTimestamp") || "0",
        );
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        let storiesData, categoriesData;

        // Use cached data if available and not expired
        if (
          cachedStories &&
          cachedCategories &&
          now - cacheTimestamp < cacheExpiry
        ) {
          storiesData = JSON.parse(cachedStories);
          categoriesData = JSON.parse(cachedCategories);
        } else {
          // Popüler hikayeleri getir
          const { data: fetchedStories, error: storiesError } = await supabase
            .from("stories")
            .select("*")
            .order("views", { ascending: false })
            .limit(10);

          if (storiesError) throw storiesError;

          // Kategorileri getir
          const { data: fetchedCategories, error: categoriesError } =
            await supabase.from("categories").select("*").order("name");

          if (categoriesError) throw categoriesError;

          storiesData = fetchedStories || [];
          categoriesData = fetchedCategories || [];

          // Cache the results
          try {
            sessionStorage.setItem(
              "popularStories",
              JSON.stringify(storiesData),
            );
            sessionStorage.setItem(
              "categories",
              JSON.stringify(categoriesData),
            );
            sessionStorage.setItem("cacheTimestamp", now.toString());
          } catch (storageError) {
            console.log("SessionStorage error:", storageError);
          }
        }

        setPopularStories(storiesData);
        setCategories(categoriesData);

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
            <div className="flex gap-4 mb-4 md:mb-0">
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
          <div className="flex justify-center gap-4 mt-4">
            <a
              href="https://facebook.com/masaldunyasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a
              href="https://twitter.com/masaldunyasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a
              href="https://instagram.com/masaldunyasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-youtube"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                <path d="m10 15 5-3-5-3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
