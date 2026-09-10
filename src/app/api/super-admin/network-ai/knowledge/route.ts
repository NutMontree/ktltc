import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const col = db.collection("m1_knowledge_base");

    const items = await col.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      total: items.length,
      knowledge: items,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { topic, content, tags } = await req.json();

    if (!topic || !content) {
      return NextResponse.json({ error: "Topic and content are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const col = db.collection("m1_knowledge_base");

    const newMemory = {
      topic: topic.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [tags || "learned"],
      source: "manual_input",
      confidence: 1.0,
      createdAt: new Date(),
    };

    const res = await col.insertOne(newMemory);

    return NextResponse.json({
      success: true,
      id: res.insertedId,
      memory: newMemory,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const col = db.collection("m1_knowledge_base");

    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
