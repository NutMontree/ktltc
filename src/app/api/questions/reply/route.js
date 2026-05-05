import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function PATCH(req) {
  try {
    const session = await auth();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = session?.user?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageQA = rolePerms?.permissions?.manage_qa || userRole === "super_admin";

    if (!session || !canManageQA) {
      // Legacy fallback
      if (userRole !== "admin" && userRole !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { questionId, answerText, isEditing } = await req.json();

    // เช็คข้อมูลเบื้องต้น
    if (!questionId || !answerText) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }


    // 2. ค้นหาคำถามเดิมก่อนอัปเดต (เอามาใช้เขียน Log)
    const originalQuestion = await db.collection("questions").findOne({
      _id: new ObjectId(questionId),
    });

    if (!originalQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    // 3. ทำการอัปเดตคำตอบลงใน Database
    const updateResult = await db.collection("questions").updateOne(
      { _id: new ObjectId(questionId) },
      {
        $set: {
          answer: answerText,
          repliedBy: session.user.name,
          repliedAt: new Date(),
          status: "answered",
        },
      },
    );

    if (updateResult.matchedCount === 1) {
      const customerName = originalQuestion.guestName || "บุคคลทั่วไป";

      // 4. บันทึก Log: แยก Action ให้ชัดเจนว่าเป็นการ "ตอบใหม่" หรือ "แก้ไข"
      // แอดมินคนอื่นจะได้รู้ว่ามึงแอบมาแก้คำพูดสัส!
      await db.collection("logs").insertOne({
        userName: session.user.name,
        action: isEditing ? "EDIT_REPLY" : "REPLY_QUESTION", // เช็ค Flag จาก Frontend
        details: `${isEditing ? "แก้ไขคำตอบ" : "ตอบคำถาม"} ของ: ${customerName} (หัวข้อ: ${originalQuestion.subject})`,
        link: `/dashboard/questions#${questionId}`, // ลิงก์ตรงไปหาคำถาม
        module: "Q&A",
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        targetId: new ObjectId(questionId),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  } catch (error) {
    console.error("REPLY_API_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = session?.user?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageQA = rolePerms?.permissions?.manage_qa || userRole === "super_admin";

    if (!session || !canManageQA) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { questionId, guestName, subject, content, createdAt } =
      await req.json();

    if (!questionId || !guestName || !subject || !content || !createdAt) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const parsedCreatedAt = new Date(createdAt);
    if (Number.isNaN(parsedCreatedAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid createdAt value" },
        { status: 400 },
      );
    }

    const targetId = new ObjectId(questionId);

    const originalQuestion = await db
      .collection("questions")
      .findOne({ _id: targetId });

    if (!originalQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const updateResult = await db.collection("questions").updateOne(
      { _id: targetId },
      {
        $set: {
          guestName: guestName.trim(),
          subject: subject.trim(),
          content: content.trim(),
          createdAt: parsedCreatedAt,
          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.matchedCount !== 1) {
      return NextResponse.json({ error: "Update failed" }, { status: 400 });
    }

    await db.collection("logs").insertOne({
      userName: session.user.name,
      action: "EDIT_QUESTION",
      details: `แก้ไขคำถามของ: ${originalQuestion.guestName || "Unknown"} (หัวข้อเดิม: ${originalQuestion.subject})`,
      link: `/dashboard/questions#${questionId}`,
      module: "Q&A",
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      targetId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("EDIT_QUESTION_API_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 🗑️ แถม: API สำหรับลบคำถาม (มึงถามหาเมื่อกี้)
// ---------------------------------------------------------
export async function DELETE(req) {
  try {
    const session = await auth();
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = session?.user?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageQA = rolePerms?.permissions?.manage_qa || userRole === "super_admin";

    if (!session || !canManageQA) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });


    // เก็บข้อมูลก่อนลบไว้ลง Log
    const target = await db
      .collection("questions")
      .findOne({ _id: new ObjectId(id) });

    const result = await db.collection("questions").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      await db.collection("logs").insertOne({
        userName: session.user.name,
        action: "DELETE_QUESTION",
        details: `ลบคำถามของ: ${target?.guestName || "Unknown"} (หัวข้อ: ${target?.subject})`,
        module: "Q&A",
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
