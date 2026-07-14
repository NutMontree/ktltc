import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // ✅ ลบ Cookie ที่ชื่อ "token" (Custom cookie ที่ตั้งตอน Login)
    cookieStore.delete("token");

    // ✅ ลบ NextAuth session cookies ทั้งหมด (ตัวการหลักที่ทำให้ยัง login อยู่)
    // NextAuth v5 (Auth.js) ใช้ชื่อ cookie ว่า "authjs.session-token"
    // NextAuth v4 ใช้ชื่อ "next-auth.session-token" (สำหรับ HTTP) และ "__Secure-next-auth.session-token" (สำหรับ HTTPS)
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");

    // ลบ CSRF token ด้วย
    cookieStore.delete("authjs.csrf-token");
    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("authjs.callback-url");
    cookieStore.delete("next-auth.callback-url");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
