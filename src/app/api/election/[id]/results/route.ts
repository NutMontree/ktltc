import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

async function verifyUser() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String(session.user.role || '').toLowerCase().trim();
  // Allow all valid roles to view results
  if (['super_admin', 'admin', 'director', 'teacher', 'student'].includes(role)) {
    return session.user;
  }
  return null;
}

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String(session.user.role || '').toLowerCase().trim();
  if (['super_admin', 'admin', 'director', 'teacher'].includes(role)) {
    return session.user;
  }
  return null;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Aggregation pipeline to get vote counts per candidate
    const results = await db.collection("votes").aggregate([
      { $match: { electionId: new ObjectId(id) } },
      { 
        $group: { 
          _id: "$candidateId", 
          count: { $sum: 1 } 
        } 
      }
    ]).toArray();

    const totalEligibleVoters = await db.collection("users").countDocuments({ role: "student" });

    return NextResponse.json({ results, totalEligibleVoters });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const result = await db.collection("votes").deleteMany({ electionId: new ObjectId(id) });
    
    return NextResponse.json({ message: "Reset votes successfully", deletedCount: result.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
