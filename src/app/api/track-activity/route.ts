import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { userId, activityType, value } = requestData;
    let storyId = requestData.storyId;

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 },
      );
    }

    // Kullanıcı aktivitesini kaydet
    try {
      // Geçici çözüm: story-1 formatındaki ID'leri UUID formatına dönüştür
      if (
        storyId &&
        typeof storyId === "string" &&
        storyId.startsWith("story-")
      ) {
        // Geçici UUID oluştur
        storyId = `00000000-0000-0000-0000-${storyId.replace("story-", "").padStart(12, "0")}`;
      }

      // Önce tabloyu kontrol et
      try {
        const { data: tablesData } = await supabase
          .from("user_activities")
          .select("*")
          .limit(1);

        const { data, error } = await supabase
          .from("user_activities")
          .insert({
            user_id: userId || null,
            story_id: storyId,
            activity_type: activityType,
            value: value || 1,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("Error inserting activity:", error);
          throw error;
        }

        return NextResponse.json({
          success: true,
          id: data?.[0]?.id || "unknown",
        });
      } catch (insertError) {
        console.error("Error with database operations:", insertError);
        // Return success anyway to prevent blocking the user experience
        return NextResponse.json({ success: true, simulated: true });
      }
    } catch (error) {
      console.error("Error tracking activity:", error);
      return NextResponse.json(
        { error: "Failed to track activity" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in track-activity API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
