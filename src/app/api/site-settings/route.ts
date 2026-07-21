import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

/**
 * GET /api/site-settings?key=global_effect
 * 
 * Public endpoint สำหรับดึงค่า site_settings เฉพาะบาง key ที่อนุญาต
 * ใช้โดย GlobalEffectRenderer เพื่อ self-fetch แทนการ query DB ใน Root Layout
 * (ลด TTFB ของทุกหน้า)
 */

// อนุญาตให้ดึงได้เฉพาะ key เหล่านี้ (ป้องกันการเข้าถึงข้อมูลที่ไม่ควรเปิดเผย)
const ALLOWED_PUBLIC_KEYS = ["global_effect", "marquee_text_1", "marquee_text_2"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key || !ALLOWED_PUBLIC_KEYS.includes(key)) {
      return NextResponse.json(
        { error: "Invalid or unauthorized key" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const setting = await db.collection("site_settings").findOne({ key });

    if (!setting) {
      return NextResponse.json({ key, value: null });
    }

    return NextResponse.json(
      { key: setting.key, value: setting.value },
      {
        headers: {
          // Cache 60 วินาที + stale-while-revalidate เพื่อลดภาระ DB
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET Public Site Setting Error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}
