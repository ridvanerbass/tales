"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import AuthCheck from "@/components/AuthCheck";

export default function AdminTranslations() {
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    language_code: "",
    key: "",
    value: "",
  });
  const [bulkData, setBulkData] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchTranslations(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;
      setLanguages(data || []);

      // Set default language
      if (data && data.length > 0) {
        const defaultLang = data.find((lang) => lang.is_default);
        if (defaultLang) {
          setSelectedLanguage(defaultLang.code);
          setFormData({ ...formData, language_code: defaultLang.code });
        } else {
          setSelectedLanguage(data[0].code);
          setFormData({ ...formData, language_code: data[0].code });
        }
      }
    } catch (error) {
      console.error("Dilleri getirme hatası:", error);
      setError("Diller yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async (langCode) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("translations")
        .select("*")
        .eq("language_code", langCode)
        .order("key");

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error("Çevirileri getirme hatası:", error);
      setError("Çeviriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      language_code: selectedLanguage,
      key: "",
      value: "",
    });
  };

  const handleAddTranslation = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate form
      if (!formData.language_code || !formData.key || !formData.value) {
        setError("Tüm alanları doldurunuz.");
        return;
      }

      // Add new translation
      const { data, error } = await supabase
        .from("translations")
        .insert([formData])
        .select();

      if (error) throw error;

      fetchTranslations(selectedLanguage);
      setIsAddDialogOpen(false);
      resetForm();
      setSuccess("Çeviri başarıyla eklendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Çeviri ekleme hatası:", error);
      setError("Çeviri eklenirken bir hata oluştu.");
    }
  };

  const handleEditTranslation = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate form
      if (!formData.language_code || !formData.key || !formData.value) {
        setError("Tüm alanları doldurunuz.");
        return;
      }

      // Update translation
      const { error } = await supabase
        .from("translations")
        .update({
          value: formData.value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentTranslation.id);

      if (error) throw error;

      fetchTranslations(selectedLanguage);
      setIsEditDialogOpen(false);
      resetForm();
      setSuccess("Çeviri başarıyla güncellendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Çeviri güncelleme hatası:", error);
      setError("Çeviri güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteTranslation = async () => {
    try {
      setError("");
      setSuccess("");

      // Delete translation
      const { error } = await supabase
        .from("translations")
        .delete()
        .eq("id", currentTranslation.id);

      if (error) throw error;

      fetchTranslations(selectedLanguage);
      setIsDeleteDialogOpen(false);
      setSuccess("Çeviri başarıyla silindi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Çeviri silme hatası:", error);
      setError("Çeviri silinirken bir hata oluştu.");
    }
  };

  const handleBulkImport = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate
      if (!selectedLanguage || !bulkData) {
        setError("Dil seçin ve veri girin.");
        return;
      }

      // Parse JSON data
      let translationsData;
      try {
        translationsData = JSON.parse(bulkData);
      } catch (e) {
        setError("Geçersiz JSON formatı.");
        return;
      }

      // Validate structure
      if (
        !Array.isArray(translationsData) &&
        typeof translationsData !== "object"
      ) {
        setError("Geçersiz veri yapısı. Dizi veya nesne olmalıdır.");
        return;
      }

      // Convert to array if object
      const translationsArray = Array.isArray(translationsData)
        ? translationsData
        : Object.entries(translationsData).map(([key, value]) => ({
            language_code: selectedLanguage,
            key,
            value,
          }));

      // Insert translations
      const { error } = await supabase.from("translations").upsert(
        translationsArray.map((item) => ({
          language_code: selectedLanguage,
          key: item.key,
          value: item.value,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "language_code,key" },
      );

      if (error) throw error;

      fetchTranslations(selectedLanguage);
      setIsBulkDialogOpen(false);
      setBulkData("");
      setSuccess("Çeviriler başarıyla içe aktarıldı.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Toplu içe aktarma hatası:", error);
      setError("Çeviriler içe aktarılırken bir hata oluştu.");
    }
  };

  const handleBulkExport = () => {
    try {
      if (!translations.length) {
        setError("Dışa aktarılacak çeviri bulunamadı.");
        return;
      }

      // Create export object
      const exportData = {};
      translations.forEach((translation) => {
        exportData[translation.key] = translation.value;
      });

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileName = `translations_${selectedLanguage}_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      setError("Çeviriler dışa aktarılırken bir hata oluştu.");
    }
  };

  const openEditDialog = (translation) => {
    setCurrentTranslation(translation);
    setFormData({
      language_code: translation.language_code,
      key: translation.key,
      value: translation.value,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (translation) => {
    setCurrentTranslation(translation);
    setIsDeleteDialogOpen(true);
  };

  const filteredTranslations = translations.filter((translation) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      translation.key.toLowerCase().includes(searchLower) ||
      translation.value.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AuthCheck adminOnly={true}>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />

        <div className="flex-1">
          <AdminHeader title="Çeviri Yönetimi" />

          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Çeviri Yönetimi</h1>
              <div className="flex gap-2">
                <Dialog
                  open={isBulkDialogOpen}
                  onOpenChange={setIsBulkDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      <span>Toplu İçe Aktar</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Toplu Çeviri İçe Aktar</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="bulk-language"
                          className="text-sm font-medium"
                        >
                          Dil
                        </label>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                        >
                          <SelectTrigger id="bulk-language">
                            <SelectValue placeholder="Dil seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem
                                key={language.code}
                                value={language.code}
                              >
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="bulk-data"
                          className="text-sm font-medium"
                        >
                          JSON Verisi
                        </label>
                        <Textarea
                          id="bulk-data"
                          value={bulkData}
                          onChange={(e) => setBulkData(e.target.value)}
                          placeholder='{"app.name": "Masal Dünyası", "app.description": "Çocuklar için interaktif masal okuma uygulaması"}'
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          JSON formatında anahtar-değer çiftleri girin.
                        </p>
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
                      <Button onClick={handleBulkImport}>İçe Aktar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleBulkExport}
                  disabled={!translations.length}
                >
                  <Download size={16} />
                  <span>Dışa Aktar</span>
                </Button>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus size={16} />
                      <span>Yeni Çeviri</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Çeviri Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="language_code"
                          className="text-sm font-medium"
                        >
                          Dil
                        </label>
                        <Select
                          value={formData.language_code}
                          onValueChange={(value) =>
                            setFormData({ ...formData, language_code: value })
                          }
                        >
                          <SelectTrigger id="language_code">
                            <SelectValue placeholder="Dil seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem
                                key={language.code}
                                value={language.code}
                              >
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="key" className="text-sm font-medium">
                          Anahtar
                        </label>
                        <Input
                          id="key"
                          name="key"
                          value={formData.key}
                          onChange={handleInputChange}
                          placeholder="app.name, home.title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="value" className="text-sm font-medium">
                          Değer
                        </label>
                        <Textarea
                          id="value"
                          name="value"
                          value={formData.value}
                          onChange={handleInputChange}
                          placeholder="Çeviri metni"
                          rows={3}
                          required
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
                      <Button onClick={handleAddTranslation}>Ekle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {success && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {error &&
              !isAddDialogOpen &&
              !isEditDialogOpen &&
              !isBulkDialogOpen && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <label
                  htmlFor="language-select"
                  className="text-sm font-medium"
                >
                  Dil Seçin
                </label>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger id="language-select" className="mt-2">
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                        {language.is_default && " (Varsayılan)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-2/3">
                <label htmlFor="search" className="text-sm font-medium">
                  Ara
                </label>
                <Input
                  id="search"
                  placeholder="Anahtar veya değer ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Anahtar</TableHead>
                      <TableHead>Değer</TableHead>
                      <TableHead className="w-[100px]">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : filteredTranslations.length > 0 ? (
                      filteredTranslations.map((translation) => (
                        <TableRow key={translation.id}>
                          <TableCell className="font-mono text-sm">
                            {translation.key}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {translation.value}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(translation)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => openDeleteDialog(translation)}
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
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchTerm
                            ? "Arama kriterlerine uygun çeviri bulunamadı."
                            : "Bu dil için henüz çeviri bulunmuyor."}
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
                  <DialogTitle>Çeviri Düzenle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-language_code"
                      className="text-sm font-medium"
                    >
                      Dil
                    </label>
                    <Input
                      id="edit-language_code"
                      value={formData.language_code}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-key" className="text-sm font-medium">
                      Anahtar
                    </label>
                    <Input
                      id="edit-key"
                      value={formData.key}
                      disabled
                      className="bg-muted/50 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-value" className="text-sm font-medium">
                      Değer
                    </label>
                    <Textarea
                      id="edit-value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      rows={3}
                      required
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
                  <Button onClick={handleEditTranslation}>Kaydet</Button>
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
                  <DialogTitle>Çeviri Sil</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Bu çeviriyi silmek istediğinizden emin misiniz?</p>
                  <p className="font-mono text-sm mt-2">
                    {currentTranslation?.key}
                  </p>
                  <p className="mt-2">{currentTranslation?.value}</p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">İptal</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteTranslation}
                  >
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
