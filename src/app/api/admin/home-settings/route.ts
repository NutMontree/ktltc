import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * ฟังก์ชันช่วยบันทึก Log (Internal helper)
 */
async function createLog(
  db: any,
  action: string,
  details: string,
  req: Request,
  session: any, // ส่ง session เข้ามาเลยเพื่อลดการเรียกซ้ำ
) {
  try {
    await db.collection("logs").insertOne({
      userName: session?.user?.name || "Unknown Admin",
      userEmail: session?.user?.email || "N/A", // เก็บ Email ไว้ด้วยเผื่อชื่อซ้ำ
      action,
      details,
      module: "HOME_SETTINGS",
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "N/A",
    });
  } catch (error) {
    console.error("Critical: Failed to create audit log:", error);
  }
}

// GET: ดึงข้อมูลทั้งหมด
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Self-healing database check: ensure "performance" component exists
    const hasPerformance = await db.collection("home_settings").findOne({ componentId: "performance" });
    if (!hasPerformance) {
      await db.collection("home_settings").insertOne({
        componentId: "performance",
        label: "เผยแพร่ผลงานวิจัย/วิชาการ",
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const components = await db.collection("home_settings").find().toArray();

    // Predefined visual order for /dashboard/manage-home list
    const COMPONENT_ORDER: Record<string, number> = {
      welcome: 1,
      scroll_velocity: 2,
      background_effect: 3, // Places background_effect on Row 2 Column 1
      performance: 4, // Places performance directly below scroll_velocity in Column 2 (Right)
      press_release: 5,
      newsletter: 6,
      announcement: 7,
      facebook_feed: 8,
      youtube_feed: 9,
      calendar: 10,
    };

    const sortedComponents = components.sort((a: any, b: any) => {
      const orderA = COMPONENT_ORDER[a.componentId?.toLowerCase()] ?? 99;
      const orderB = COMPONENT_ORDER[b.componentId?.toLowerCase()] ?? 99;
      return orderA - orderB;
    });

    const siteSettings = await db.collection("site_settings").find().toArray();
    return NextResponse.json({ components: sortedComponents, siteSettings });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// PATCH: อัปเดตข้อมูล พร้อมบันทึก Log
export async function PATCH(req: Request) {
  try {
    // 1. ตรวจสอบสิทธิ์ (Security First)
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, componentId, isVisible, key, value, label } =
      await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 2. แยกจัดการตามประเภท
    if (type === "COMPONENT_VISIBILITY") {
      await db
        .collection("home_settings")
        .updateOne(
          { componentId },
          { $set: { isVisible, updatedAt: new Date() } },
          { upsert: true },
        );

      const statusText = isVisible ? "เปิดการแสดงผล" : "ปิดการแสดงผล";
      await createLog(
        db,
        "UPDATE_VISIBILITY",
        `${statusText}ส่วนประกอบ: ${label || componentId}`,
        req,
        session,
      );
    } else if (type === "SITE_SETTING") {
      // ดึงค่าเก่ามาเปรียบเทียบใน Log (Optional แต่อยากแนะนำ)
      const oldData = await db.collection("site_settings").findOne({ key });

      await db
        .collection("site_settings")
        .updateOne(
          { key },
          { $set: { value, updatedAt: new Date() } },
          { upsert: true },
        );

      await createLog(
        db,
        "UPDATE_SITE_SETTING",
        `แก้ไข ${label || key} จาก "${oldData?.value || ""}" เป็น "${value}"`,
        req,
        session,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
