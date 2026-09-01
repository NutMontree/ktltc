import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing URL" }, { status: 400 });
    }

    // ดึง URL และตาม Redirect (302) ไปจนถึงปลายทาง
    const response = await fetch(url, { redirect: "follow" });
    const finalUrl = response.url;

    // รูปแบบที่ 1: @lat,lng (Google Maps ปกติ)
    let match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return NextResponse.json({ success: true, lat: match[1], lng: match[2] });
    }

    // รูปแบบที่ 2: !3dLat!4dLng (Google Maps หมุดแชร์)
    match = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) {
      return NextResponse.json({ success: true, lat: match[1], lng: match[2] });
    }

    // รูปแบบที่ 3: ?q=lat,lng
    match = finalUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return NextResponse.json({ success: true, lat: match[1], lng: match[2] });
    }

    // รูปแบบที่ 4: ll=lat,lng
    match = finalUrl.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return NextResponse.json({ success: true, lat: match[1], lng: match[2] });
    }

    return NextResponse.json({ success: false, error: "ไม่พบพิกัดในลิงก์ที่ระบุ กรุณาตรวจสอบลิงก์อีกครั้ง" });
  } catch (error) {
    console.error("GPS Extraction Error:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงพิกัด" }, { status: 500 });
  }
}
