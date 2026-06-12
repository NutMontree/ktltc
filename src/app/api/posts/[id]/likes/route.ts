import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(req.url);
    const commentId = url.searchParams.get("commentId");
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    
    let likeIds = [];
    if (commentId) {
      const comment = post.comments?.find((c: any) => c.id === commentId);
      likeIds = comment?.likes || [];
    } else {
      likeIds = post.likes || [];
    }

    if (!likeIds || likeIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const validIds = likeIds.filter((id: string) => id && id.length === 24);
    const objectIds = validIds.map((likeId: string) => new ObjectId(likeId));

    const users = await db.collection("users").find({
      $or: [
        { _id: { $in: objectIds } },
        { _id: { $in: likeIds } }
      ]
    }).project({ name: 1, image: 1, role: 1 }).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch likes error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
