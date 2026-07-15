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
    
    // Fetch candidates to get manualVotes
    const candidates = await db.collection("candidates").find({ electionId: new ObjectId(id) }).toArray();
    
    // Fetch election config to get abstainManualVotes
    const election = await db.collection("elections").findOne({ _id: new ObjectId(id) });
    
    // Aggregation pipeline to get vote counts per candidate
    const voteCounts = await db.collection("votes").aggregate([
      { $match: { electionId: new ObjectId(id) } },
      { 
        $group: { 
          _id: "$candidateId", 
          count: { $sum: 1 } 
        } 
      }
    ]).toArray();
    
    const results = voteCounts.map(vc => {
      if (vc._id === null) {
          return {
              _id: vc._id,
              count: vc.count + (election?.abstainManualVotes || 0)
          };
      }
      const candidate = candidates.find(c => c._id.toString() === vc._id?.toString());
      return {
          _id: vc._id,
          count: vc.count + (candidate?.manualVotes || 0)
      };
    });
    
    // Add candidates that have manual votes but no real votes yet
    candidates.forEach(c => {
        if (c.manualVotes && !results.some(r => r._id?.toString() === c._id.toString())) {
            results.push({
                _id: c._id.toString(),
                count: c.manualVotes
            });
        }
    });
    
    // Add abstain manual votes if no abstain real votes yet
    if (election?.abstainManualVotes && !results.some(r => r._id === null)) {
        results.push({
            _id: null,
            count: election.abstainManualVotes
        });
    }

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
