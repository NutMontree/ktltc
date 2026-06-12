import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * ฟังก์ชันช่วยบันทึก Log (ใช้โครงสร้างเดียวกับ PATCH/DELETE)
 */
async function createLog(
  db: any,
  action: string,
  details: string,
  req: Request,
) {
  try {
    const session = await auth();
    await db.collection("logs").insertOne({
      userName: session?.user?.name || "Admin",
      action,
      details,
      module: "POSTERS",
      link: "/dashboard/posters",
      timestamp: new Date(), // ✅ ใช้ timestamp ให้ตรงกับหน้า Super Admin
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

// GET: ดึงรายการโปสเตอร์ทั้งหมด
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const posters = await db
      .collection("posters")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    // Sanitize imageUrl to fix [object Object] issue
    const sanitizedPosters = posters.map(p => ({
      ...p,
      imageUrl: typeof p.imageUrl === 'object' && p.imageUrl ? p.imageUrl.secure_url : p.imageUrl
    }));
    
    return NextResponse.json(sanitizedPosters);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// POST: เพิ่มโปสเตอร์ใหม่ พร้อมบันทึก Log
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // เตรียมข้อมูลที่จะบันทึก
    const newPoster = {
      ...body,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("posters").insertOne(newPoster);

    if (result.acknowledged) {
      // ✅ บันทึก Log เมื่อสร้างสำเร็จ
      await createLog(
        db,
        "CREATE_POSTER",
        `เพิ่มโปสเตอร์ใหม่: ${body.title || "ไม่ได้ระบุชื่อ"}`,
        req,
      );

      return NextResponse.json(
        { success: true, id: result.insertedId },
        { status: 201 },
      );
    }

    return NextResponse.json({ error: "Failed to insert" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Post failed" }, { status: 500 });
  }
}
