import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

// verify student role
async function verifyStudent() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String((session.user as any).role || '').toLowerCase().trim();
  if (role === 'student') {
    return session.user;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const student = await verifyStudent();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized, student only" }, { status: 401 });
    }

    const body = await req.json();
    const { electionId, candidateId } = body; 
    // candidateId can be null/empty for Abstain

    if (!electionId) {
      return NextResponse.json(
        { error: "Missing electionId" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const now = new Date();

    // Ensure the election is currently active
    const election = await db.collection("elections").findOne({
      _id: new ObjectId(electionId),
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (!election) {
      return NextResponse.json({ error: "Election is not active" }, { status: 400 });
    }

    // Prepare vote
    const newVote = {
      electionId: new ObjectId(electionId),
      userId: new ObjectId(student.id as any), // token payload must have userId
      candidateId: candidateId ? new ObjectId(candidateId) : null, // null for abstain
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      createdAt: new Date(),
    };

    try {
      await db.collection("votes").insertOne(newVote);
    } catch (e: any) {
      // 11000 is duplicate key error code in MongoDB (unique index constraint hit)
      if (e.code === 11000) {
        return NextResponse.json({ error: "คุณได้ลงคะแนนไปแล้ว (You have already voted)" }, { status: 403 });
      }
      throw e;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
