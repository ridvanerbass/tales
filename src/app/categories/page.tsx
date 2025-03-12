"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase-client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hepsi");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Kategorileri getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === "hepsi") return true;
    return cat.age_group === activeTab || cat.age_group === "hepsi";
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kategoriler</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="hepsi">Tüm Yaş Grupları</TabsTrigger>
            <TabsTrigger value="3-6">3-6 Yaş</TabsTrigger>
            <TabsTrigger value="6-9">6-9 Yaş</TabsTrigger>
            <TabsTrigger value="9-12">9-12 Yaş</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p>Yükleniyor...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  Bu yaş grubunda kategori bulunamadı.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Link
                    href={`/category/${category.id}`}
                    key={category.id}
                    className="block h-full"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300 bg-card rounded-xl border-0 shadow">
                      <div className="relative w-full aspect-square">
                        <Image
                          src={
                            category.image ||
                            "https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=300&q=80"
                          }
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-medium text-lg">
                            {category.name}
                          </h3>
                          {category.count > 0 && (
                            <span className="text-white/80 text-xs">
                              {category.count} masal
                            </span>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <CardDescription className="text-sm">
                          {category.description || ""}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
