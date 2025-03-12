"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, Bookmark, Play, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface StoryStatsProps {
  storyId: string;
}

const StoryStats = ({ storyId }: StoryStatsProps) => {
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    bookmarks: 0,
    listens: 0,
    readTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // UUID formatına dönüştür
        const uuidStoryId = storyId.startsWith("story-")
          ? `00000000-0000-0000-0000-${storyId.replace("story-", "").padStart(12, "0")}`
          : storyId;

        // Hikaye istatistiklerini getir
        const { data, error } = await supabase
          .from("stories")
          .select("views, likes, bookmarks, listens, read_time")
          .eq("id", uuidStoryId)
          .single();

        if (error) throw error;

        setStats({
          views: data?.views || 0,
          likes: data?.likes || 0,
          bookmarks: data?.bookmarks || 0,
          listens: data?.listens || 0,
          readTime: data?.read_time || 0,
        });
      } catch (error) {
        console.error("İstatistik getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storyId]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">İstatistikler</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Yükleniyor...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg">
              <Eye className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-medium">{stats.views}</span>
              <span className="text-xs text-muted-foreground">
                Görüntülenme
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg">
              <Heart className="h-5 w-5 text-red-500 mb-1" />
              <span className="text-lg font-medium">{stats.likes}</span>
              <span className="text-xs text-muted-foreground">Beğeni</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg">
              <Bookmark className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-lg font-medium">{stats.bookmarks}</span>
              <span className="text-xs text-muted-foreground">Yer İşareti</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg">
              <Play className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-lg font-medium">{stats.listens}</span>
              <span className="text-xs text-muted-foreground">Dinleme</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-500 mb-1" />
              <span className="text-lg font-medium">{stats.readTime} dk</span>
              <span className="text-xs text-muted-foreground">
                Okuma Süresi
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryStats;
