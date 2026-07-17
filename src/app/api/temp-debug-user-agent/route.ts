import { NextResponse, NextRequest, userAgent } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. จำลองการอ่าน body stream (ซึ่งทำให้ request stream ถูกใช้งานไปแล้ว)
    const body = await req.json();
    
    // 2. เรียกใช้ userAgent(req) ตามโค้ดต้นฉบับที่มีปัญหา
    // ซึ่งภายใต้ Next.js จะพยายามเข้าถึง Header และอาจกระทบกับ Stream ภายในของ Node
    const { device, os, browser } = userAgent(req);
    
    return NextResponse.json({ success: true, device, os, browser });
  } catch (error: any) {
    console.error("🔥 Debug Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
