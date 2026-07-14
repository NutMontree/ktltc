import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// ✅ PATCH: แก้ไขสถานะ + บันทึก Log
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const adminName = session?.user?.name || "Super_Admin";
    const adminId = session?.user?.id;

    const { id } = await params;
    const body = await req.json();
    const { isActive, role } = body;
 
    const currentUserRole = String(session?.user?.role || "").toLowerCase().trim();
    const allowedAdminRoles = [
      "super_admin",
      "admin",
      "hr",
      "director",
      "deputy_resource",
      "deputy_strategy",
      "deputy_academic",
      "deputy_student_affairs",
      "editor",
      "staff"
    ];
 
    if (!allowedAdminRoles.includes(currentUserRole)) {
      return NextResponse.json({ error: "Access Denied: Administrative role required." }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ✅ หาชื่อผู้ใช้ก่อน (เพื่อบันทึก Log ให้ชัดเจน)
    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { name: 1, username: 1 } });

    const updateData: any = { updatedAt: new Date() };
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (role) updateData.role = role;

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      console.warn("⚠️ No documents updated. ID might be wrong.");
    }

    // ✅ บันทึก Audit Log ทุกครั้ง
    let action = "UPDATE_USER";
    let actionDesc = "แก้ไขข้อมูลสมาชิก";

    const targetName = targetUser?.name || targetUser?.username || id;

    if (typeof isActive === "boolean") {
      action = isActive ? "APPROVE_USER" : "SUSPEND_USER";
      actionDesc = isActive ? `✅ อนุมัติบัญชีสมาชิก: ${targetName}` : `🚫 ระงับบัญชีสมาชิก: ${targetName}`;
    }
    if (role) {
      action = "CHANGE_ROLE";
      actionDesc = `เปลี่ยนสิทธิ์ของ ${targetName} เป็น: ${role}`;
    }

    await db.collection("logs").insertOne({
      adminId: adminId ? new ObjectId(adminId as string) : null,
      userName: adminName,
      action,
      details: `${actionDesc} (Target ID: ${id})`,
      targetId: new ObjectId(id),
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      role: session?.user?.role || "super_admin",
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("❌ Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE: ลบผู้ใช้ พร้อม Log
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const adminName = session?.user?.name || "Super_Admin";
    const adminId = session?.user?.id;

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { name: 1, username: 1 } });

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    const targetName = targetUser?.name || targetUser?.username || `ID: ${id}`;
    await db.collection("logs").insertOne({
      adminId: adminId ? new ObjectId(adminId as string) : null,
      userName: adminName,
      action: "DELETE_USER",
      details: `ลบสมาชิก: ${targetName}`,
      targetId: new ObjectId(id),
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      role: session?.user?.role || "super_admin",
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
