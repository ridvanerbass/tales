"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import AuthCheck from "@/components/AuthCheck";

export default function AdminLanguages() {
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    is_active: true,
    is_default: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error("Dilleri getirme hatası:", error);
      setError("Diller yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (name, checked) => {
    setFormData({ ...formData, [name]: checked });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      is_active: true,
      is_default: false,
    });
  };

  const handleAddLanguage = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate form
      if (!formData.code || !formData.name) {
        setError("Dil kodu ve adı gereklidir.");
        return;
      }

      // If setting as default, update all other languages
      if (formData.is_default) {
        const { error: updateError } = await supabase
          .from("languages")
          .update({ is_default: false })
          .neq("code", formData.code);

        if (updateError) throw updateError;
      }

      // Add new language
      const { data, error } = await supabase
        .from("languages")
        .insert([formData])
        .select();

      if (error) throw error;

      fetchLanguages();
      setIsAddDialogOpen(false);
      resetForm();
      setSuccess("Dil başarıyla eklendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Dil ekleme hatası:", error);
      setError("Dil eklenirken bir hata oluştu.");
    }
  };

  const handleEditLanguage = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate form
      if (!formData.code || !formData.name) {
        setError("Dil kodu ve adı gereklidir.");
        return;
      }

      // If setting as default, update all other languages
      if (formData.is_default) {
        const { error: updateError } = await supabase
          .from("languages")
          .update({ is_default: false })
          .neq("code", formData.code);

        if (updateError) throw updateError;
      }

      // Update language
      const { error } = await supabase
        .from("languages")
        .update({
          name: formData.name,
          is_active: formData.is_active,
          is_default: formData.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("code", formData.code);

      if (error) throw error;

      fetchLanguages();
      setIsEditDialogOpen(false);
      resetForm();
      setSuccess("Dil başarıyla güncellendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Dil güncelleme hatası:", error);
      setError("Dil güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteLanguage = async () => {
    try {
      setError("");
      setSuccess("");

      // Check if language is default
      if (currentLanguage.is_default) {
        setError("Varsayılan dil silinemez.");
        return;
      }

      // Delete language
      const { error } = await supabase
        .from("languages")
        .delete()
        .eq("code", currentLanguage.code);

      if (error) throw error;

      fetchLanguages();
      setIsDeleteDialogOpen(false);
      setSuccess("Dil başarıyla silindi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Dil silme hatası:", error);
      setError("Dil silinirken bir hata oluştu.");
    }
  };

  const openEditDialog = (language) => {
    setCurrentLanguage(language);
    setFormData({
      code: language.code,
      name: language.name,
      is_active: language.is_active,
      is_default: language.is_default,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (language) => {
    setCurrentLanguage(language);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AuthCheck adminOnly={true}>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />

        <div className="flex-1">
          <AdminHeader title="Dil Yönetimi" />

          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Dil Yönetimi</h1>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Yeni Dil Ekle</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Dil Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="code" className="text-sm font-medium">
                        Dil Kodu (ISO)
                      </label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="tr, en, de, fr"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Dil Adı
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Türkçe, English, Deutsch"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="is_active"
                        className="text-sm font-medium"
                      >
                        Aktif
                      </label>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("is_active", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="is_default"
                        className="text-sm font-medium"
                      >
                        Varsayılan Dil
                      </label>
                      <Switch
                        id="is_default"
                        checked={formData.is_default}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("is_default", checked)
                        }
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">İptal</Button>
                    </DialogClose>
                    <Button onClick={handleAddLanguage}>Ekle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {success && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {error && !isAddDialogOpen && !isEditDialogOpen && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dil Kodu</TableHead>
                      <TableHead>Dil Adı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Varsayılan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : languages.length > 0 ? (
                      languages.map((language) => (
                        <TableRow key={language.code}>
                          <TableCell className="font-medium">
                            {language.code}
                          </TableCell>
                          <TableCell>{language.name}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${language.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}
                            >
                              {language.is_active ? "Aktif" : "Pasif"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {language.is_default ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Varsayılan
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(language)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => openDeleteDialog(language)}
                                disabled={language.is_default}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Henüz dil bulunmuyor.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dil Düzenle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-code" className="text-sm font-medium">
                      Dil Kodu (ISO)
                    </label>
                    <Input
                      id="edit-code"
                      name="code"
                      value={formData.code}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dil kodu değiştirilemez
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Dil Adı
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-is_active"
                      className="text-sm font-medium"
                    >
                      Aktif
                    </label>
                    <Switch
                      id="edit-is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("is_active", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-is_default"
                      className="text-sm font-medium"
                    >
                      Varsayılan Dil
                    </label>
                    <Switch
                      id="edit-is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("is_default", checked)
                      }
                      disabled={formData.is_default}
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">İptal</Button>
                  </DialogClose>
                  <Button onClick={handleEditLanguage}>Kaydet</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dil Sil</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Bu dili silmek istediğinizden emin misiniz?</p>
                  <p className="font-medium mt-2">
                    {currentLanguage?.code} - {currentLanguage?.name}
                  </p>
                  <p className="text-sm text-destructive mt-2">
                    Not: Bu dile ait tüm çeviriler de silinecektir.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">İptal</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteLanguage}>
                    Sil
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}
