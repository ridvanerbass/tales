import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const { ip, userAgent, language, referrer, page, country } =
      await request.json();

    // Ziyaretçi bilgilerini kaydet
    try {
      // Visitors tablosunun varlığını kontrol et
      const { data: tablesData } = await supabase
        .from("visitors")
        .select("*")
        .limit(1);

      // Tablo yoksa veya hata varsa, sessizce devam et
      const { data, error } = await supabase
        .from("visitors")
        .insert({
          ip_address: ip || "127.0.0.1",
          user_agent: userAgent || "Unknown",
          language: language || "tr",
          referrer: referrer || "",
          page_visited: page || "/",
          country: country || "Unknown",
          visit_time: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      return NextResponse.json({ success: true, id: data[0].id });
    } catch (error) {
      console.error("Error tracking visitor:", error);
      return NextResponse.json(
        { error: "Failed to track visitor" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in track-visitor API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
