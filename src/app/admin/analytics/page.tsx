"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Users, Globe, Clock, MousePointer } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

import AuthCheck from "@/components/AuthCheck";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visitors");
  const [visitors, setVisitors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    averageSessionTime: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Generate cache key based on date range
      const cacheKey = `analytics:${dateRange.start}:${dateRange.end}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        // Use cached data if available
        const parsedData = JSON.parse(cachedData);
        setVisitors(parsedData.visitors || []);
        setActivities(parsedData.activities || []);
      } else {
        // Ziyaretçi verilerini getir
        const { data: visitorsData, error: visitorsError } = await supabase
          .from("visitors")
          .select("*")
          .gte("visit_time", `${dateRange.start}T00:00:00`)
          .lte("visit_time", `${dateRange.end}T23:59:59`)
          .order("visit_time", { ascending: false });

        if (visitorsError) throw visitorsError;
        setVisitors(visitorsData || []);

        // Aktivite verilerini getir
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("user_activities")
          .select("*, stories(title)")
          .gte("created_at", `${dateRange.start}T00:00:00`)
          .lte("created_at", `${dateRange.end}T23:59:59`)
          .order("created_at", { ascending: false });

        if (activitiesError) throw activitiesError;
        setActivities(activitiesData || []);

        // Cache the results
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              visitors: visitorsData || [],
              activities: activitiesData || [],
            }),
          );
        } catch (storageError) {
          console.log("SessionStorage error:", storageError);
        }
      }

      // İstatistikleri hesapla
      const uniqueIPs = new Set(visitorsData?.map((v) => v.ip_address) || []);

      // Ortalama oturum süresini hesapla
      let avgSessionTime = 0;
      if (visitorsData && visitorsData.length > 0) {
        // IP adreslerine göre ziyaretleri grupla
        const sessionsByIP = {};
        visitorsData.forEach((visit) => {
          if (!sessionsByIP[visit.ip_address]) {
            sessionsByIP[visit.ip_address] = [];
          }
          sessionsByIP[visit.ip_address].push(new Date(visit.visit_time));
        });

        // Her IP için oturum sürelerini hesapla
        let totalSessionTime = 0;
        let sessionCount = 0;

        Object.values(sessionsByIP).forEach((sessions: Date[]) => {
          // Ziyaretleri zamana göre sırala
          sessions.sort((a, b) => a.getTime() - b.getTime());

          // Oturumları belirle (30 dakikadan fazla boşluk varsa yeni oturum)
          let currentSessionStart = sessions[0];
          let lastVisit = sessions[0];

          for (let i = 1; i < sessions.length; i++) {
            const currentVisit = sessions[i];
            const timeDiff =
              (currentVisit.getTime() - lastVisit.getTime()) / 1000; // saniye cinsinden

            if (timeDiff > 1800) {
              // 30 dakika = 1800 saniye
              // Önceki oturumu sonlandır ve süresini hesapla
              const sessionDuration =
                (lastVisit.getTime() - currentSessionStart.getTime()) / 1000;
              if (sessionDuration > 0) {
                totalSessionTime += sessionDuration;
                sessionCount++;
              }
              // Yeni oturum başlat
              currentSessionStart = currentVisit;
            }

            lastVisit = currentVisit;
          }

          // Son oturumu da ekle
          const lastSessionDuration =
            (lastVisit.getTime() - currentSessionStart.getTime()) / 1000;
          if (lastSessionDuration > 0) {
            totalSessionTime += lastSessionDuration;
            sessionCount++;
          }
        });

        // Ortalama oturum süresini hesapla (saniye cinsinden)
        avgSessionTime =
          sessionCount > 0 ? Math.round(totalSessionTime / sessionCount) : 0;
      }

      setStats({
        totalVisitors: visitorsData?.length || 0,
        uniqueVisitors: uniqueIPs.size,
        totalPageViews: visitorsData?.filter((v) => v.page_visited).length || 0,
        averageSessionTime: avgSessionTime,
      });
    } catch (error) {
      console.error("Analytics verilerini getirme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.ip_address?.toLowerCase().includes(searchLower) ||
      visitor.user_agent?.toLowerCase().includes(searchLower) ||
      visitor.language?.toLowerCase().includes(searchLower) ||
      visitor.page_visited?.toLowerCase().includes(searchLower) ||
      visitor.referrer?.toLowerCase().includes(searchLower)
    );
  });

  const filteredActivities = activities.filter((activity) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.activity_type?.toLowerCase().includes(searchLower) ||
      activity.stories?.title?.toLowerCase().includes(searchLower) ||
      activity.user_id?.toLowerCase().includes(searchLower)
    );
  });

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case "view":
        return "Görüntüleme";
      case "like":
        return "Beğeni";
      case "bookmark":
        return "Yer İşareti";
      case "listen":
        return "Dinleme";
      default:
        return type;
    }
  };

  if (loading && visitors.length === 0 && activities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <AuthCheck adminOnly={true}>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />

        <div className="flex-1">
          <AdminHeader title="Analitik" />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Site Analitiği</h1>
              <p className="text-muted-foreground">
                Ziyaretçi ve kullanıcı aktivite istatistikleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Toplam Ziyaretçi
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.totalVisitors}
                    </h3>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-75" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tekil Ziyaretçi
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.uniqueVisitors}
                    </h3>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-75" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sayfa Görüntüleme
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.totalPageViews}
                    </h3>
                  </div>
                  <Eye className="h-8 w-8 text-primary opacity-75" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ort. Oturum Süresi
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.averageSessionTime
                        ? `${Math.floor(stats.averageSessionTime / 60)}:${String(Math.floor(stats.averageSessionTime % 60)).padStart(2, "0")}`
                        : "00:00"}
                    </h3>
                  </div>
                  <Clock className="h-8 w-8 text-primary opacity-75" />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-auto"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-auto"
                  />
                  <Button onClick={fetchAnalytics}>Filtrele</Button>
                </div>
              </div>
              <div>
                <Input
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="visitors">Ziyaretçiler</TabsTrigger>
                <TabsTrigger value="activities">
                  Kullanıcı Aktiviteleri
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visitors">
                <Card>
                  <CardHeader>
                    <CardTitle>Ziyaretçi Kayıtları</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IP Adresi</TableHead>
                            <TableHead>Tarayıcı</TableHead>
                            <TableHead>Dil</TableHead>
                            <TableHead>Sayfa</TableHead>
                            <TableHead>Referrer</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVisitors.length > 0 ? (
                            filteredVisitors.map((visitor) => (
                              <TableRow key={visitor.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{visitor.ip_address}</span>
                                    {visitor.country && (
                                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full">
                                        {visitor.country}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {visitor.user_agent}
                                </TableCell>
                                <TableCell>{visitor.language}</TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                  {visitor.page_visited}
                                </TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                  {visitor.referrer || "-"}
                                </TableCell>
                                <TableCell>
                                  {new Date(visitor.visit_time).toLocaleString(
                                    "tr-TR",
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                {loading
                                  ? "Yükleniyor..."
                                  : "Ziyaretçi kaydı bulunamadı."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle>Kullanıcı Aktiviteleri</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kullanıcı ID</TableHead>
                            <TableHead>Hikaye</TableHead>
                            <TableHead>Aktivite Tipi</TableHead>
                            <TableHead>Değer</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredActivities.length > 0 ? (
                            filteredActivities.map((activity) => (
                              <TableRow key={activity.id}>
                                <TableCell>
                                  {activity.user_id || "Anonim"}
                                </TableCell>
                                <TableCell>
                                  {activity.stories?.title ||
                                    activity.story_id ||
                                    "-"}
                                </TableCell>
                                <TableCell>
                                  {getActivityTypeLabel(activity.activity_type)}
                                </TableCell>
                                <TableCell>{activity.value}</TableCell>
                                <TableCell>
                                  {new Date(activity.created_at).toLocaleString(
                                    "tr-TR",
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                {loading
                                  ? "Yükleniyor..."
                                  : "Aktivite kaydı bulunamadı."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}
