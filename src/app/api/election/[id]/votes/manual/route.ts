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
    const { candidateId, manualVotes } = await req.json();

    if (typeof manualVotes !== 'number') {
      return NextResponse.json({ error: "manualVotes must be a number" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const updateData = {
      manualVotes: manualVotes,
      updatedAt: new Date()
    };
    
    let result;
    if (candidateId === null || candidateId === "null" || candidateId === "abstain") {
        // Handle abstain votes
        result = await db.collection("elections").updateOne(
            { _id: new ObjectId(id) },
            { $set: { abstainManualVotes: manualVotes, updatedAt: new Date() } }
        );
    } else {
        // Handle candidate votes
        result = await db.collection("candidates").updateOne(
            { _id: new ObjectId(candidateId), electionId: new ObjectId(id) },
            { $set: updateData }
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
