import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// ✅ ฟังก์ชันช่วยบันทึก Log - ปรับให้ดึง Session ข้างในนี้เลย ลดความซ้ำซ้อน
async function createActivityLog(
  db: any,
  req: NextRequest,
  { action, details }: { action: string; details: string },
) {
  try {
    const session = await auth();
    // ถ้าดึง session ไม่ได้ ให้ลงชื่อเป็น System_Kernel
    const operatorName = session?.user?.name || "System_Kernel";

    await db.collection("logs").insertOne({
      userName: operatorName,
      action,
      details,
      module: "ADMIN_BANNERS",
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
  } catch (err) {
    console.error("Log recording failed:", err);
  }
}

// GET: ดึงข้อมูลแบนเนอร์ (คงเดิม)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const banner = await db
      .collection("banners")
      .findOne({ _id: new ObjectId(id) });
    if (!banner)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH: อัปเดตข้อมูลแบนเนอร์ + บันทึก Log แบบละเอียด
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = (session?.user as any)?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageNews = rolePerms?.permissions?.manage_news || userRole === "super_admin";

    if (!canManageNews && !["admin", "editor"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { _id, ...updateData } = body;

    // 1. ดึงข้อมูลเดิมก่อนอัปเดต เพื่อเอาชื่อมาบันทึก Log
    const oldBanner = await db
      .collection("banners")
      .findOne({ _id: new ObjectId(id) });
    if (!oldBanner)
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    // 2. อัปเดตข้อมูล
    const result = await db
      .collection("banners")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
      );

    if (result.matchedCount > 0) {
      // 3. บันทึก Log - ระบุเลยว่าแก้จากอะไรเป็นอะไร หรือแก้ของใคร
      await createActivityLog(db, req, {
        action: "UPDATE_BANNER",
        details: `แก้ไขแบนเนอร์: "${oldBanner.title}" ${updateData.title && updateData.title !== oldBanner.title ? `เป็น "${updateData.title}"` : "(คงชื่อเดิม)"}`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Update Failed" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}

// DELETE: ลบแบนเนอร์ + บันทึก Log (ที่มึงบอกว่าไม่มี กูใส่ให้แล้ว)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = (session?.user as any)?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageNews = rolePerms?.permissions?.manage_news || userRole === "super_admin";

    const { id } = await params;

    if (!canManageNews && !["admin", "editor"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const client_unused = clientPromise; // already initialized above
    const db_unused = client.db("ktltc_db"); // already initialized above

    // 1. ดึงข้อมูลก่อนลบ (ต้องทำ ไม่งั้น Log จะไม่รู้ว่าลบแบนเนอร์ชื่ออะไร)
    const bannerToDelete = await db
      .collection("banners")
      .findOne({ _id: new ObjectId(id) });

    if (!bannerToDelete)
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    // 2. ลบข้อมูล
    const result = await db
      .collection("banners")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      // 3. บันทึก Log การลบ - ใส่ชื่อแบนเนอร์ลงไปในรายละเอียดด้วย
      await createActivityLog(db, req, {
        action: "DELETE_BANNER",
        details: `ลบแบนเนอร์: "${bannerToDelete.title}" (ID: ${id})`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Delete Failed" }, { status: 400 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete Failed" }, { status: 500 });
  }
}
