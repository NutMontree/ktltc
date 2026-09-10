import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized: Super Admin Only" }, { status: 403 });
  }

  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const messagesCol = db.collection("m1_chat_messages");
    const sessionsCol = db.collection("m1_chat_sessions");

    const sessionInfo = await sessionsCol.findOne({ sessionId });
    const messages = await messagesCol
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      session: sessionInfo,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        modelUsed: m.modelUsed,
        learnedAlert: m.learnedAlert,
        webSources: m.webSources,
        codeProposal: m.codeProposal,
        attachments: m.attachments,
        duration: m.duration,
        actionSteps: m.actionSteps,
      })),
    });
  } catch (error: any) {
    console.error("Fetch session messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
