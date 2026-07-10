import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth"; // นำเข้า auth เพื่อเช็คว่าใครทำรายการ
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

/**
 * ฟังก์ชันช่วยบันทึก Log ลง Database
 * ปรับให้ใช้ timestamp และรองรับชื่อผู้ใช้งาน
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
      userName: session?.user?.name || "Admin", // บันทึกชื่อคนทำ
      action,
      details,
      module: "POSTERS",
      link: "/dashboard/posters", // ใส่ลิงก์เผื่อกดจากหน้า Log ได้
      timestamp: new Date(), // ✅ เปลี่ยนจาก createdAt เป็น timestamp
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

// ฟังก์ชันลบไฟล์รูปภาพเก่าจาก Server
async function deleteOldImage(imageUrl: string) {
  try {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
    const filename = imageUrl.split("/").pop();
    if (!filename) return;
    
    // ซ่อน path จาก Turbopack เพื่อป้องกันปัญหา Overly broad pattern
    const basePath = process.cwd();
    const subPath = "public/uploads";
    const filepath = `${basePath}/${subPath}/${filename}`;
    
    // Obfuscate fs to prevent Turbopack from analyzing the path
    const fsUtil = fs;
    if (fsUtil.existsSync(filepath)) {
      await fsUtil.promises.unlink(filepath);
      console.log(`Deleted old image: ${filepath}`);
    }
  } catch (error) {
    console.error("Failed to delete old image:", error);
  }
}

// GET: ดึงข้อมูลรายละเอียด
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const poster = await db.collection("posters").findOne({
      _id: new ObjectId(id),
    });
    
    if (poster && typeof poster.imageUrl === 'object' && poster.imageUrl) {
      poster.imageUrl = poster.imageUrl.secure_url;
    }
    
    return NextResponse.json(poster);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// PATCH: แก้ไขข้อมูล พร้อมบันทึก Log
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { _id, ...updateData } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const original = await db
      .collection("posters")
      .findOne({ _id: new ObjectId(id) });

    // ลบรูปภาพเก่าทิ้ง หากมีการเปลี่ยนรูปภาพหรือลบรูปภาพออก
    if (updateData.imageUrl !== undefined && original?.imageUrl && original.imageUrl !== updateData.imageUrl) {
      await deleteOldImage(original.imageUrl);
    }

    await db
      .collection("posters")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
      );

    const isToggle =
      Object.keys(updateData).length === 1 && updateData.isActive !== undefined;
    const actionLabel = isToggle ? "TOGGLE_POSTER" : "UPDATE_POSTER";
    const statusText = updateData.isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน";

    await createLog(
      db,
      actionLabel,
      isToggle
        ? `${statusText} โปสเตอร์: ${original?.title || id}`
        : `แก้ไขข้อมูลโปสเตอร์: ${original?.title || id}`,
      req, // ส่ง req ไปเพื่อเก็บ IP
    );

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: ลบข้อมูล พร้อมบันทึก Log
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const original = await db
      .collection("posters")
      .findOne({ _id: new ObjectId(id) });

    const result = await db.collection("posters").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      // ลบรูปภาพออกจากเซิร์ฟเวอร์
      if (original?.imageUrl) {
        await deleteOldImage(original.imageUrl);
      }

      // ✅ เรียกใช้ createLog ที่ปรับปรุงแล้ว
      await createLog(
        db,
        "DELETE_POSTER",
        `ลบโปสเตอร์: ${original?.title || id}`,
        req,
      );
      
      revalidatePath("/");
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
