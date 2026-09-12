import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const sessionsCol = db.collection("m1_chat_sessions");

    const sessions = await sessionsCol
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        title: s.title || "บทสนทนาใหม่",
        model: s.model || "gemini-3.6-flash",
        lastMessage: s.lastMessage || "",
        updatedAt: s.updatedAt || s.createdAt,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Fetch chat sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const newSessionId = body.sessionId || randomUUID();
    const title = body.title || "บทสนทนาใหม่";
    const model = body.model || "gemini-3.6-flash";

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const sessionsCol = db.collection("m1_chat_sessions");

    const newSession = {
      sessionId: newSessionId,
      title,
      model,
      lastMessage: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await sessionsCol.insertOne(newSession);

    return NextResponse.json({
      success: true,
      session: newSession,
    });
  } catch (error: any) {
    console.error("Create chat session error:", error);
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
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const sessionsCol = db.collection("m1_chat_sessions");
    const messagesCol = db.collection("m1_chat_messages");

    await sessionsCol.deleteOne({ sessionId });
    await messagesCol.deleteMany({ sessionId });

    return NextResponse.json({
      success: true,
      message: "ลบห้องสนทนาเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Delete chat session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { sessionId, title } = body;

    if (!sessionId || !title?.trim()) {
      return NextResponse.json({ error: "sessionId and title are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const sessionsCol = db.collection("m1_chat_sessions");

    const trimmedTitle = title.trim();
    await sessionsCol.updateOne(
      { sessionId },
      { $set: { title: trimmedTitle, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      title: trimmedTitle,
    });
  } catch (error: any) {
    console.error("Update chat session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
