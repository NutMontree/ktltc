"use server";

import clientPromise from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { signOut } from "@/lib/auth";

export async function incrementVisitor() {
  try {
    // 1. อ่าน Cookie
    const cookieStore = await cookies();
    const hasVisited = cookieStore.get("has_visited_ktl");

    // 2. ถ้าเคยเข้าแล้ว (มี Cookie) -> ให้จบการทำงาน (ไม่นับซ้ำ)
    if (hasVisited) {
      return;
    }

    // 3. ถ้ายังไม่เคยเข้า -> อัปเดต DB
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db
      .collection("site_stats")
      .findOneAndUpdate(
        { _id: "visitor_count" as any },
        { $inc: { count: 1 } },
        { upsert: true },
      );

    // 4. สร้าง Cookie ใหม่ (หัวใจสำคัญ: Value ต้องเป็นภาษาอังกฤษเท่านั้น!)
    cookieStore.set("has_visited_ktl", "true", {
      maxAge: 60 * 60 * 24, // 1 วัน
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // 5. อัปเดตหน้าเว็บ
    revalidatePath("/");
    console.log("✅ New Visitor count +1");
  } catch (error) {
    console.error("❌ Error incrementing visitor:", error);
  }
}

export async function logoutAction() {
  // เรียกใช้ NextAuth signOut ฝั่งเซิร์ฟเวอร์เพื่อล้าง Cookie อย่างหมดจด
  // รวมถึง Cookie ที่ถูกแบ่งย่อย (Chunked) ซึ่ง Client signOut มักจะมีปัญหา
  await signOut({ redirectTo: "/login" });
}

export async function logoutOtherDevicesAction() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).sessionId) {
    throw new Error("Unauthorized");
  }

  const { ObjectId } = await import("mongodb");
  const client = await clientPromise;
  const db = client.db("ktltc_db");
  const userId = session.user.id;
  const currentSessionId = (session.user as any).sessionId;

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        logoutAllBefore: Date.now(),
        exemptSessionId: currentSessionId,
      },
    }
  );

  return { success: true };
}
