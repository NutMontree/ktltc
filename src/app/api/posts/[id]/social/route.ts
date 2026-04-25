import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userName = session.user.name;
    const { id } = params;
    const { type, text } = await req.json();

    console.log(`SOCIAL Action: ${type} on ID: ${id} by User: ${userName}`);

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (type === "LIKE") {
      const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

      const likes = post.likes || [];
      const hasLiked = likes.includes(userId);

      if (hasLiked) {
        await db.collection("posts").updateOne(
          { _id: new ObjectId(id) },
          { $pull: { likes: userId } }
        );
      } else {
        await db.collection("posts").updateOne(
          { _id: new ObjectId(id) },
          { $addToSet: { likes: userId } }
        );
      }
    } else if (type === "COMMENT") {
      const comment = {
        userId: new ObjectId(userId),
        userName,
        text,
        createdAt: new Date(),
      };
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: comment } as any }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
