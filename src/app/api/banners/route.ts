import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// --- [GET] ดึงข้อมูลแบนเนอร์ ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isActiveOnly = searchParams.get("isActive") === "true";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // กรณีดึงไปใช้ที่หน้าแรก (isActive=true) ไม่ต้องเช็คสิทธิ์
    if (isActiveOnly) {
      const banners = await db
        .collection("banners")
        .find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .toArray();
      return NextResponse.json(banners);
    }

    // กรณีดึงไปใช้หลังบ้าน (Admin) ต้องเช็คสิทธิ์
    const session = await auth();
    const isAdmin =
      session &&
      ["super_admin", "admin", "editor"].includes(session.user.role);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banners = await db
      .collection("banners")
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(banners);
  } catch (error: any) {
    console.error("❌ [API BANNERS GET ERROR]:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// --- [POST] เพิ่มแบนเนอร์ใหม่ ---
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    const allowedRoles = ["super_admin", "admin", "editor"];

    if (!session || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, imageUrl, linkUrl, order, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "กรุณาใส่หัวข้อและรูปภาพ" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newBanner = {
      title,
      imageUrl,
      linkUrl: linkUrl || "",
      order: parseInt(order.toString()) || 0,
      isActive: isActive ?? true,
      createdBy: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("banners").insertOne(newBanner);

    // บันทึก Log
    await db.collection("logs").insertOne({
      adminId: new ObjectId(session.user.id),
      adminName: session.user.name,
      action: "CREATE_BANNER",
      details: `สร้างแบนเนอร์: ${title}`,
      targetId: result.insertedId,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
