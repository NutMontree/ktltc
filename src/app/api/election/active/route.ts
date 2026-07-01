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

export async function GET() {
  try {
    const student = await verifyStudent();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized, student only" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const now = new Date();

    // Find the active elections that are currently ongoing
    const activeElections = await db
      .collection("elections")
      .find({
        status: "active",
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .toArray();

    if (!activeElections || activeElections.length === 0) {
      return NextResponse.json({ active: false, elections: [] });
    }

    // Map through all active elections and attach candidates and user vote status
    const electionsWithDetails = await Promise.all(
      activeElections.map(async (election) => {
        const existingVote = await db.collection("votes").findOne({
          electionId: new ObjectId(election._id as any),
          userId: new ObjectId(student.id as any),
        });

        const candidates = await db
          .collection("candidates")
          .find({ electionId: new ObjectId(election._id as any) })
          .sort({ number: 1 })
          .toArray();

        const enrichedCandidates = await Promise.all(
          candidates.map(async (candidate) => {
            if (!candidate.members || candidate.members.length === 0) return candidate;
            
            const membersWithImages = await Promise.all(
              candidate.members.map(async (member: any) => {
                // Find user by name to dynamically get real profile image
                const user = await db.collection("users").findOne({ name: member.name });
                return {
                  ...member,
                  imageUrl: user?.image || member.imageUrl || ""
                };
              })
            );
            return { ...candidate, members: membersWithImages };
          })
        );

        return {
          ...election,
          candidates: enrichedCandidates,
          hasVoted: !!existingVote,
        };
      })
    );

    // Keep backwards compatibility for single election but provide elections array for multiple
    return NextResponse.json({
      active: true,
      elections: electionsWithDetails,
      // Fallback for single election mode
      election: electionsWithDetails[0],
      candidates: electionsWithDetails[0].candidates,
      hasVoted: electionsWithDetails[0].hasVoted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
