import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { auth, hasPermission } from "@/lib/auth";
import { deleteFileFromUrl } from "@/lib/file-utils";

const PROTECTED_ROLES = ["super_admin", "editor", "admin", "director"];
const ALLOWED_ADMIN_ROLES = [
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const currentUserRole = String((session.user as any)?.role || "").toLowerCase().trim();
    const isSuperAdmin = currentUserRole === "super_admin";

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // If super_admin, include passwordText in response so they can view it.
    const projection: any = { password: 0 };
    if (!isSuperAdmin) {
      projection.passwordText = 0;
    }

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET User Error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Fetch current target user state for protection and logging
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserRole = String((session.user as any)?.role || "").toLowerCase().trim();
    const isSuperAdmin = currentUserRole === "super_admin";
    
    // Check dynamic permissions
    const canManageRoles = await hasPermission(currentUserRole, "manage_roles_advanced");
    const isTargetStudent = ["student", "นักเรียน", "นักเรียน/นักศึกษา"].includes(String(targetUser.role).toLowerCase());
    const canEditStudents = ["super_admin", "admin", "hr", "director", "teacher"].includes(currentUserRole);
 
    // 🔒 Ensure the current user has administrative permissions
    if (!canManageRoles && !isSuperAdmin) {
      // If no advanced role management, they can ONLY edit if target is student AND they have student editing rights
      if (!(canEditStudents && isTargetStudent)) {
        return NextResponse.json({ error: "Access Denied: No permission to edit this user." }, { status: 403 });
      }

      // Security: Strip out sensitive fields that they shouldn't edit
      delete body.role;
      delete body.password;
      delete body.passwordText;
      delete body.isActive;
    }
 
    // 🚫 Check if target user has a protected role and current user is NOT super_admin
    const targetRole = String(targetUser.role || "").toLowerCase().trim();
    if (!isSuperAdmin && PROTECTED_ROLES.includes(targetRole)) {
      return NextResponse.json(
        { error: "ACCESS_DENIED: Cannot modify high-level administrative accounts." },
        { status: 403 }
      );
    }

    // เตรียมข้อมูลที่จะอัปเดต
    const updateData: any = { ...body, updatedAt: new Date() };

    // Enforce classGroup consistency across all systems with standard formatting
    if (updateData.groupCode !== undefined || updateData.classGroupId !== undefined || updateData.classroomName !== undefined) {
      let rawGroup = updateData.classGroupId || updateData.groupCode || updateData.classroomName || "";
      rawGroup = rawGroup.trim();
      const stripped = rawGroup.replace(/[\s\.-]+/g, "");
      const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
      let unifiedClassGroup = stripped;
      if (match) {
        unifiedClassGroup = match[2] ? `${match[1]}.${match[2]}` : match[1];
      }

      updateData.classGroupId = unifiedClassGroup;
      updateData.groupCode = unifiedClassGroup;
      updateData.classroomName = unifiedClassGroup;
    }

    // 🔒 ถ้ามีการส่ง password มาใหม่ ให้ Hash ก่อนบันทึก
    if (body.password && body.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateData.password = hashedPassword;
      updateData.passwordText = body.password;
    } else {
      // ถ้าไม่ได้ส่งมา หรือส่งมาเป็นค่าว่าง ให้ลบออกจาก updateData (ใช้รหัสเดิม)
      delete updateData.password;
    }

    // ป้องกันไม่ให้แก้ _id
    delete updateData._id;

    // 🗑 ลบรูปภาพเดิมถ้ามีการเปลี่ยนรูปโปรไฟล์ หรือลบรูปโปรไฟล์ (เมื่อ body ส่ง image มาและไม่เท่ากับของเดิม)
    if (updateData.image !== undefined && targetUser.image && updateData.image !== targetUser.image) {
      await deleteFileFromUrl(targetUser.image);
    }
    // 🗑 ลบรูปหน้าปกเดิมถ้ามีการเปลี่ยนรูป
    if (updateData.coverImage !== undefined && targetUser.coverImage && updateData.coverImage !== targetUser.coverImage) {
      await deleteFileFromUrl(targetUser.coverImage);
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    // 📝 Automated Logging for Role or Department changes
    if (result.modifiedCount > 0) {
      const logDetails: string[] = [];
      if (body.role && body.role !== targetUser.role) {
        logDetails.push(`เปลี่ยนสิทธิ์จาก [${targetUser.role}] เป็น [${body.role}]`);
      }
      if (body.department && body.department !== targetUser.department) {
        logDetails.push(`เปลี่ยนสังกัดจาก [${targetUser.department || "ไม่มี"}] เป็น [${body.department}]`);
      }

      if (logDetails.length > 0) {
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

        await db.collection("logs").insertOne({
          userName: session.user?.name || "SYSTEM",
          userEmail: session.user?.email || null,
          action: "MEMBER_UPDATE",
          details: `แก้ไขข้อมูลของคุณ ${targetUser.name}: ${logDetails.join(" และ ")}`,
          timestamp: new Date(),
          ip,
          role: currentUserRole,
        });
      }
    }

    return NextResponse.json({
      message: "Update success",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ... (ส่วน DELETE คงเดิม)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    const isSuperAdmin = currentUserRole === "super_admin";

    // Check dynamic permissions
    const canManageRoles = await hasPermission(currentUserRole, "manage_roles_advanced");

    if (!session || (!isSuperAdmin && !canManageRoles)) {
      return NextResponse.json({ error: "Access Denied: Permission for Role Management required." }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Log the deletion
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(id) });
    await db.collection("logs").insertOne({
      userName: (session.user as any)?.name || "SYSTEM",
      userEmail: session.user?.email || null,
      action: "MEMBER_DELETE",
      details: `ลบชื่อผู้ใช้งาน: ${targetUser?.name || id} ออกจากระบบ`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for")?.split(/, /)[0] || "127.0.0.1",
      role: currentUserRole,
    });

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
