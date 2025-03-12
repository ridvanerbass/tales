import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { User } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Oturum değişikliklerini dinle
      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Giriş yapılıyor:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth giriş hatası:", error);
        throw error;
      }

      console.log("Auth giriş başarılı:", data.user);

      try {
        // Kullanıcı rolünü kontrol et
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (userError) {
          console.log("Kullanıcı bulunamadı, ekleniyor:", data.user.id);
          // Kullanıcı bulunamadıysa, users tablosuna ekle
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split("@")[0],
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Kullanıcı ekleme hatası:", insertError);
          }
          return { user: data.user, role: "user", error: null };
        }

        console.log("Kullanıcı rolü:", userData?.role);
        return { user: data.user, role: userData?.role || "user", error: null };
      } catch (userError) {
        console.error("Kullanıcı bilgisi getirme hatası:", userError);
        // Hata olsa bile kullanıcı girişini tamamla
        return { user: data.user, role: "user", error: null };
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      return { user: null, role: null, error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("Kayıt yapılıyor:", email);
      // Kullanıcıyı auth sistemine kaydet - email onayı olmadan
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Auth kayıt hatası:", error);
        throw error;
      }

      console.log("Auth kayıt başarılı:", data.user);

      // Kullanıcı profili oluştur
      if (data.user) {
        try {
          // Kullanıcı tablosuna doğrudan eklemeyi dene
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            name,
            role: "user", // Varsayılan olarak normal kullanıcı
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Kullanıcı ekleme hatası:", insertError);
          } else {
            console.log("Kullanıcı başarıyla eklendi");
          }
        } catch (profileError) {
          console.error("Profil oluşturma hatası:", profileError);
          // Profil oluşturma hatası olsa bile kullanıcı kaydını tamamla
        }
      }

      // Kullanıcıyı otomatik olarak giriş yaptır
      if (data.user) {
        // Otomatik giriş yap
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Otomatik giriş hatası:", signInError);
        } else {
          console.log("Otomatik giriş başarılı");
          // Kullanıcı bilgilerini güncelle
          setUser(data.user);
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Kayıt hatası:", error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Çıkış hatası:", error);
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
