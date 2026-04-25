/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// 1. ลบโพสต์
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("DELETE Post ID:", id);
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(id),
    });
    console.log("ลบผลลัพธ์:", result);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "ไม่พบโพสต์" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "ไม่สามารถลบโพสต์ได้" }, { status: 500 });
  }
}

// 2. แก้ไขโพสต์
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
    }

    const { id } = await params;
    console.log("รหัสโพสต์:", id);
    const { title, content, image } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content,
          image,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "ไม่พบโพสต์" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตโพสต์ได้" },
      { status: 500 },
    );
  }
}
// 3. จัดการ Like/Comment (Social Actions)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userName = session.user.name;
    const { id } = await params;
    const { type, text } = await req.json();

    console.log(`SOCIAL Action: ${type} on ID: ${id} by User: ${userName}`);

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (type === "LIKE") {
      const post = await db
        .collection("posts")
        .findOne({ _id: new ObjectId(id) });
      if (!post)
        return NextResponse.json({ error: "ไม่พบโพสต์" }, { status: 404 });

      const likes = post.likes || [];
      const hasLiked = likes.includes(userId);

      if (hasLiked) {
        await db
          .collection("posts")
          .updateOne({ _id: new ObjectId(id) }, { $pull: { likes: userId } });
      } else {
        await db
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(id) },
            { $addToSet: { likes: userId } },
          );
      }
    } else if (type === "COMMENT") {
      const comment = {
        userId: new ObjectId(userId),
        userName,
        text,
        createdAt: new Date(),
      };
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(id) },
          { $push: { comments: comment } as any },
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ข้อผิดพลาดของ Social API:", error);
    return NextResponse.json(
      { error: "ข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}
