"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useUser();
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { email, password } = formData;
      if (!email || !password) {
        throw new Error("E-posta ve şifre gereklidir");
      }

      const { user, error: signInError } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      if (user) {
        console.log("Login successful, redirecting to home");
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      let errorMessage = "Giriş yapılırken bir hata oluştu";

      if (error.message === "Invalid login credentials") {
        errorMessage = "Geçersiz e-posta veya şifre";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { email, password, name } = formData;
      if (!email || !password || !name) {
        throw new Error("Tüm alanları doldurunuz");
      }

      const { user, error: signUpError } = await signUp(email, password, name);

      if (signUpError) {
        throw signUpError;
      }

      if (user) {
        // Kayıt başarılı, ana sayfaya yönlendir
        console.log("Registration successful, redirecting to home");
        router.refresh();
        router.push("/");
      } else {
        // Kullanıcı oluşturuldu ama bir sorun var
        setError(
          "Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen giriş yapın.",
        );
        setActiveTab("login");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      let errorMessage = "Kayıt olurken bir hata oluştu";

      if (error.message === "User already registered") {
        errorMessage = "Bu e-posta adresi zaten kayıtlı";
      } else if (error.message?.includes("password")) {
        errorMessage = "Şifre en az 6 karakter olmalıdır";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-12 w-12 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=300&q=80"
                alt="Logo"
                width={48}
                height={48}
                className="object-cover rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Masal Dünyası</CardTitle>
          <CardDescription>
            Çocuklar için interaktif masal okuma uygulaması
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-posta
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium">
                      Şifre
                    </label>
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline"
                    >
                      Şifremi Unuttum
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Ad Soyad
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ad Soyad"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-email"
                    className="text-sm font-medium"
                  >
                    E-posta
                  </label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-password"
                    className="text-sm font-medium"
                  >
                    Şifre
                  </label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Şifreniz en az 6 karakter olmalıdır
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Giriş yaparak veya kayıt olarak{" "}
            <a href="#" className="text-primary hover:underline">
              Kullanım Şartları
            </a>{" "}
            ve{" "}
            <a href="#" className="text-primary hover:underline">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursunuz.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
