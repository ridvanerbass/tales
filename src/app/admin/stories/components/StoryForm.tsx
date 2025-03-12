"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HtmlEditor } from "@/components/ui/html-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StoryFormProps {
  storyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StoryForm = ({ storyId, onSuccess, onCancel }: StoryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    cover_image: "",
    category_id: "",
    audio_url: "",
    video_url: "",
  });

  useEffect(() => {
    fetchCategories();
    if (storyId) {
      fetchStory(storyId);
    }
  }, [storyId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Kategorileri getirme hatası:", error);
      setError("Kategoriler yüklenirken bir hata oluştu.");
    }
  };

  const fetchStory = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          category_id: data.category_id || "",
          audio_url: data.audio_url || "",
          video_url: data.video_url || "",
        });
      }
    } catch (error) {
      console.error("Hikaye getirme hatası:", error);
      setError("Hikaye yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.title) {
        throw new Error("Başlık alanı zorunludur.");
      }

      const storyData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        cover_image: formData.cover_image,
        category_id: formData.category_id || null,
        audio_url: formData.audio_url,
        video_url: formData.video_url,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (storyId) {
        // Güncelleme işlemi
        result = await supabase
          .from("stories")
          .update(storyData)
          .eq("id", storyId);
      } else {
        // Yeni hikaye ekleme
        storyData["created_at"] = new Date().toISOString();
        result = await supabase.from("stories").insert([storyData]);
      }

      if (result.error) throw result.error;

      setSuccess(
        storyId ? "Hikaye başarıyla güncellendi." : "Hikaye başarıyla eklendi.",
      );

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Form verilerini sıfırla
        if (!storyId) {
          setFormData({
            title: "",
            description: "",
            content: "",
            cover_image: "",
            category_id: "",
            audio_url: "",
            video_url: "",
          });
        }
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Hikaye kaydetme hatası:", error);
      setError(error.message || "Hikaye kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Başlık <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Açıklama
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium mb-1"
            >
              Kategori
            </label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                handleSelectChange("category_id", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kategorisiz</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="cover_image"
              className="block text-sm font-medium mb-1"
            >
              Kapak Resmi URL
            </label>
            <Input
              id="cover_image"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label
              htmlFor="audio_url"
              className="block text-sm font-medium mb-1"
            >
              Ses Dosyası URL
            </label>
            <Input
              id="audio_url"
              name="audio_url"
              value={formData.audio_url}
              onChange={handleInputChange}
              placeholder="https://example.com/audio.mp3"
            />
          </div>

          <div>
            <label
              htmlFor="video_url"
              className="block text-sm font-medium mb-1"
            >
              Video URL
            </label>
            <Input
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://example.com/video.mp4"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            İçerik
          </label>
          <HtmlEditor
            value={formData.content}
            onChange={handleContentChange}
            minHeight="400px"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : storyId ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
};

export default StoryForm;
