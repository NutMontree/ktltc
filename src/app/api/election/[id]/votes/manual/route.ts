import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String(session.user.role || '').toLowerCase().trim();
  if (['super_admin', 'admin'].includes(role)) {
    return session.user;
  }
  return null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const { candidateId, amount, action } = await req.json();

    if (typeof amount !== 'number' || !['add', 'subtract'].includes(action)) {
      return NextResponse.json({ error: "Invalid amount or action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    let result;
    const incAmount = action === "add" ? amount : -amount;

    if (candidateId === null || candidateId === "null" || candidateId === "abstain") {
        // Handle abstain votes
        result = await db.collection("elections").updateOne(
            { _id: new ObjectId(id) },
            { $inc: { abstainManualVotes: incAmount }, $set: { updatedAt: new Date() } }
        );
    } else {
        // Handle candidate votes
        result = await db.collection("candidates").updateOne(
            { _id: new ObjectId(candidateId), electionId: new ObjectId(id) },
            { $inc: { manualVotes: incAmount }, $set: { updatedAt: new Date() } }
        );
    }

    if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Manual votes updated successfully" });
  } catch (error: any) {
    console.error("Manual votes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
