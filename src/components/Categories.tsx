import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription } from "./ui/card";

interface CategoryProps {
  categories?: {
    id: string;
    name: string;
    description: string;
    image: string;
    count?: number;
  }[];
}

const Categories = ({ categories = [] }: CategoryProps) => {
  return (
    <section className="w-full py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Kategoriler</h2>
          {categories.length > 0 && (
            <Link
              href="/categories"
              className="text-sm text-primary hover:underline"
            >
              Tümünü Gör
            </Link>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            style={{ maxWidth: "1440px", margin: "0 auto" }}
          >
            {categories.map((category) => (
              <Link
                href={`/category/${category.id}`}
                key={category.id}
                className="block h-full w-full"
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
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-white font-medium text-sm">
                        {category.name}
                      </h3>
                      {category.count && (
                        <span className="text-white/80 text-xs">
                          {category.count} masal
                        </span>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <CardDescription className="text-xs line-clamp-2">
                      {category.description || ""}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
