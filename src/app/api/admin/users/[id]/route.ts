import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"; // อย่าลืม npm install bcryptjs
import { auth } from "@/lib/auth";
import { saveFileLocally } from "@/lib/upload-server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      password,
      username,
      ...updateData
    } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ✅ ตรวจสอบความเป็นสากลของ Username (ป้องกันการซ้ำ)
    if (username) {
      const trimmedUsername = username.trim();
      const existingUser = await db.collection("users").findOne({ 
        username: { $regex: new RegExp(`^${trimmedUsername}$`, "i") },
        _id: { $ne: new ObjectId(id) } 
      });
      if (existingUser) {
        return NextResponse.json({ error: "ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว" }, { status: 400 });
      }
      updateData.username = trimmedUsername;
    }

    // เตรียมข้อมูลสำหรับอัปเดต
    const updatePayload: any = { ...updateData, updatedAt: new Date() };

    // ✅ Manage Profile Image (Local)
    if (updateData.image && updateData.image.startsWith("data:image")) {
      const imageUrl = await saveFileLocally(updateData.image, "user_profiles", "profile");
      if (imageUrl) {
        updatePayload.image = imageUrl;
      }
    }

    // ✅ Manage Cover Image (Local)
    if (
      updateData.coverImage &&
      updateData.coverImage.startsWith("data:image")
    ) {
      const coverUrl = await saveFileLocally(updateData.coverImage, "user_covers", "cover");
      if (coverUrl) {
        updatePayload.coverImage = coverUrl;
      }
    }

    // ถ้ามีการส่งรหัสผ่านใหม่มา ให้เข้ารหัสก่อน
    if (password && password.length >= 6) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatePayload });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Automatic Unified Logging
    const adminName = (session?.user as any)?.name || "Super_Admin";
    const adminId = (session?.user as any)?.id;

    // หาชื่อผู้ใช้เป้าหมาย
    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { name: 1, username: 1 } });
    const targetName = targetUser?.name || targetUser?.username || id;
    
    // Determine action description based on what was updated
    let actionDesc = `เเก้ไขข้อมูลผู้ใช้: ${targetName}`;
    if (updateData.role) actionDesc = `เปลี่ยนสิทธิ์ของ ${targetName} เป็น ${updateData.role}`;
    if (updateData.isActive === false) actionDesc = `🚫 ระงับการใช้งานผู้ใช้: ${targetName}`;
    if (updateData.isActive === true) actionDesc = `✅ เปิดใช้งานผู้ใช้: ${targetName}`;
    if (username) actionDesc += ` (เปลี่ยนชื่อผู้ใช้เป็น @${username})`;
    if (password) actionDesc += " (มีการเปลี่ยนรหัสผ่าน)";

    await db.collection("logs").insertOne({
      adminId: adminId ? new ObjectId(adminId as string) : null,
      userName: adminName, // Fixed from adminName to userName for consistency
      action: "UPDATE_USER",
      details: `${actionDesc} (Target ID: ${id})`,
      targetId: new ObjectId(id),
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      role: "super_admin"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // หาชื่อผู้ใช้ก่อนลบ
    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { name: 1, username: 1 } });

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // บันทึก Log การลบสมาชิก
    const adminName = (session?.user as any)?.name || "Super_Admin";
    const adminId = (session?.user as any)?.id;
    const targetName = targetUser?.name || targetUser?.username || `ID: ${id}`;

    await db.collection("logs").insertOne({
      adminId: adminId ? new ObjectId(adminId as string) : null,
      userName: adminName,
      action: "DELETE_USER",
      details: `ลบสมาชิก: ${targetName}`,
      targetId: new ObjectId(id),
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      role: "super_admin"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
