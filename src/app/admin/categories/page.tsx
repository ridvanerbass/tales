"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  Download,
  CheckSquare,
} from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import AuthCheck from "@/components/AuthCheck";

export default function AdminCategories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    age_group: "hepsi",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ageGroups = [
    { value: "hepsi", label: "Tüm Yaş Grupları" },
    { value: "3-6", label: "3-6 Yaş" },
    { value: "6-9", label: "6-9 Yaş" },
    { value: "9-12", label: "9-12 Yaş" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Select all checkbox logic
    if (selectAll) {
      setSelectedCategories(categories.map((cat) => cat.id));
    } else if (selectedCategories.length === categories.length) {
      setSelectAll(true);
    }
  }, [selectAll, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
      setSelectedCategories([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Kategorileri getirme hatası:", error);
      setError("Kategoriler yüklenirken bir hata oluştu.");
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      age_group: "hepsi",
    });
  };

  const handleAddCategory = async () => {
    try {
      setError("");
      setSuccess("");

      if (!formData.name) {
        setError("Kategori adı gereklidir.");
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([formData])
        .select();

      if (error) throw error;

      fetchCategories();
      setIsAddDialogOpen(false);
      resetForm();
      setSuccess("Kategori başarıyla eklendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Kategori ekleme hatası:", error);
      setError("Kategori eklenirken bir hata oluştu.");
    }
  };

  const handleEditCategory = async () => {
    try {
      setError("");
      setSuccess("");

      if (!formData.name) {
        setError("Kategori adı gereklidir.");
        return;
      }

      const { error } = await supabase
        .from("categories")
        .update(formData)
        .eq("id", currentCategory.id);

      if (error) throw error;

      fetchCategories();
      setIsEditDialogOpen(false);
      resetForm();
      setSuccess("Kategori başarıyla güncellendi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Kategori güncelleme hatası:", error);
      setError("Kategori güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", currentCategory.id);

      if (error) throw error;

      fetchCategories();
      setIsDeleteDialogOpen(false);
      setSuccess("Kategori başarıyla silindi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Kategori silme hatası:", error);
      setError("Kategori silinirken bir hata oluştu.");
    }
  };

  const handleBulkImport = async () => {
    try {
      setError("");
      setSuccess("");

      if (!bulkData) {
        setError("Veri giriniz.");
        return;
      }

      // Parse JSON data
      let categoriesData;
      try {
        categoriesData = JSON.parse(bulkData);
      } catch (e) {
        setError("Geçersiz JSON formatı.");
        return;
      }

      // Validate structure
      if (!Array.isArray(categoriesData)) {
        setError("Geçersiz veri yapısı. Dizi olmalıdır.");
        return;
      }

      // Insert categories
      const { error } = await supabase
        .from("categories")
        .upsert(categoriesData, { onConflict: "name" });

      if (error) throw error;

      fetchCategories();
      setIsBulkDialogOpen(false);
      setBulkData("");
      setSuccess("Kategoriler başarıyla içe aktarıldı.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Toplu içe aktarma hatası:", error);
      setError("Kategoriler içe aktarılırken bir hata oluştu.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      setError("");
      setSuccess("");

      if (selectedCategories.length === 0) {
        setError("Silinecek kategori seçilmedi.");
        return;
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .in("id", selectedCategories);

      if (error) throw error;

      fetchCategories();
      setIsBulkDeleteDialogOpen(false);
      setSuccess(`${selectedCategories.length} kategori başarıyla silindi.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Toplu silme hatası:", error);
      setError("Kategoriler silinirken bir hata oluştu.");
    }
  };

  const handleBulkExport = () => {
    try {
      if (!categories.length) {
        setError("Dışa aktarılacak kategori bulunamadı.");
        return;
      }

      // Create export data
      const exportData = categories.map(
        ({ id, name, description, image, age_group }) => ({
          id,
          name,
          description,
          image,
          age_group,
        }),
      );

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileName = `categories_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();

      setSuccess("Kategoriler başarıyla dışa aktarıldı.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      setError("Kategoriler dışa aktarılırken bir hata oluştu.");
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        const newSelected = prev.filter((item) => item !== id);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, id];
        if (newSelected.length === categories.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedCategories(categories.map((cat) => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const openEditDialog = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      age_group: category.age_group || "hepsi",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && categories.length === 0) {
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
          <AdminHeader title="Kategoriler" />

          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Kategoriler</h1>
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
                      <DialogTitle>Toplu Kategori İçe Aktar</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                          placeholder='[{"name": "Klasik Masallar", "description": "Nesillerdir anlatılan sevilen klasik masallar", "image": "https://example.com/image.jpg", "age_group": "hepsi"}]'
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          JSON formatında kategori dizisi girin.
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
                  disabled={!categories.length}
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
                      <span>Yeni Kategori</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Kategori Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Kategori Adı
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="description"
                          className="text-sm font-medium"
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

                      <div className="space-y-2">
                        <label htmlFor="image" className="text-sm font-medium">
                          Resim URL
                        </label>
                        <Input
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://images.unsplash.com/photo-xxx"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="age_group"
                          className="text-sm font-medium"
                        >
                          Yaş Grubu
                        </label>
                        <Select
                          value={formData.age_group}
                          onValueChange={(value) =>
                            handleSelectChange("age_group", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Yaş grubu seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups.map((group) => (
                              <SelectItem key={group.value} value={group.value}>
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Button onClick={handleAddCategory}>Ekle</Button>
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
              <div className="w-full">
                <Input
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAllChange}
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  Tümünü Seç
                </label>
              </div>
              {selectedCategories.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>{selectedCategories.length} Kategoriyi Sil</span>
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Kategori Adı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Yaş Grubu</TableHead>
                      <TableHead>Hikaye Sayısı</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() =>
                                handleSelectCategory(category.id)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description}
                          </TableCell>
                          <TableCell>
                            {ageGroups.find(
                              (g) => g.value === category.age_group,
                            )?.label || "Tüm Yaş Grupları"}
                          </TableCell>
                          <TableCell>{category.count || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(category)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => openDeleteDialog(category)}
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
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchTerm
                            ? "Arama kriterlerine uygun kategori bulunamadı."
                            : "Henüz kategori bulunmuyor."}
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
                  <DialogTitle>Kategori Düzenle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Kategori Adı
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="edit-description"
                      className="text-sm font-medium"
                    >
                      Açıklama
                    </label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-image" className="text-sm font-medium">
                      Resim URL
                    </label>
                    <Input
                      id="edit-image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="edit-age_group"
                      className="text-sm font-medium"
                    >
                      Yaş Grubu
                    </label>
                    <Select
                      value={formData.age_group}
                      onValueChange={(value) =>
                        handleSelectChange("age_group", value)
                      }
                    >
                      <SelectTrigger id="edit-age_group">
                        <SelectValue placeholder="Yaş grubu seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Button onClick={handleEditCategory}>Kaydet</Button>
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
                  <DialogTitle>Kategori Sil</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Bu kategoriyi silmek istediğinizden emin misiniz?</p>
                  <p className="font-medium mt-2">{currentCategory?.name}</p>
                  <p className="text-sm text-destructive mt-2">
                    Not: Bu kategoriye ait hikayeler kategorisiz kalacaktır.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">İptal</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteCategory}>
                    Sil
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog
              open={isBulkDeleteDialogOpen}
              onOpenChange={setIsBulkDeleteDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Toplu Kategori Sil</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    {selectedCategories.length} kategoriyi silmek istediğinizden
                    emin misiniz?
                  </p>
                  <p className="text-sm text-destructive mt-2">
                    Not: Bu kategorilere ait hikayeler kategorisiz kalacaktır.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">İptal</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    {selectedCategories.length} Kategoriyi Sil
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
