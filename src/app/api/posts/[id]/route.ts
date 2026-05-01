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
    const { title, content, image, images } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content,
          image,
          images: images || (image ? [image] : []),
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
    const body = await req.json();
    const { type, text, commentId, parentId, newText } = body;

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
        id: new ObjectId().toString(),
        userId: new ObjectId(userId),
        userName,
        userImage: session.user.image,
        text,
        image: body.image || null,
        parentId: parentId || null,
        createdAt: new Date(),
      };
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(id) },
          { $push: { comments: comment } as any },
        );
    } else if (type === "DELETE_COMMENT") {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: {
            comments: {
              id: commentId,
              $or: [
                { userId: new ObjectId(userId) },
                { userId: userId }
              ]
            },
          } as any,
        },
      );
    } else if (type === "UPDATE_COMMENT") {
      await db.collection("posts").updateOne(
        {
          _id: new ObjectId(id),
          comments: {
            $elemMatch: {
              id: commentId,
              $or: [
                { userId: new ObjectId(userId) },
                { userId: userId }
              ]
            }
          }
        },
        {
          $set: {
            "comments.$.text": newText,
            "comments.$.updatedAt": new Date(),
          },
        },
      );
    } else if (type === "LIKE_COMMENT") {
      const post = await db
        .collection("posts")
        .findOne({ _id: new ObjectId(id), "comments.id": commentId });

      if (post) {
        const comment = post.comments.find((c: any) => c.id === commentId);
        const commentLikes = comment.likes || [];
        const hasLiked = commentLikes.includes(userId);

        if (hasLiked) {
          await db.collection("posts").updateOne(
            { _id: new ObjectId(id), "comments.id": commentId },
            { $pull: { "comments.$.likes": userId } as any },
          );
        } else {
          await db.collection("posts").updateOne(
            { _id: new ObjectId(id), "comments.id": commentId },
            { $addToSet: { "comments.$.likes": userId } as any },
          );
        }
      }
    } else if (type === "SHARE") {
      const originalPost = await db
        .collection("posts")
        .findOne({ _id: new ObjectId(id) });
      if (!originalPost)
        return NextResponse.json({ error: "ไม่พบโพสต์ต้นฉบับ" }, { status: 404 });

      const sharedPost = {
        authorId: new ObjectId(userId),
        authorName: userName,
        authorImage: session.user.image,
        targetId: body.targetId ? new ObjectId(body.targetId) : new ObjectId(userId),
        content: body.shareText || "",
        sharedPostId: new ObjectId(id),
        sharedPostData: {
          content: originalPost.content,
          image: originalPost.image,
          images: originalPost.images,
          authorName: originalPost.authorName || originalPost.userName,
          authorImage: originalPost.authorImage || originalPost.userImage,
          createdAt: originalPost.createdAt,
        },
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection("posts").insertOne(sharedPost);
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
