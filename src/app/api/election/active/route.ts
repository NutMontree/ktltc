import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

// verify any logged in user
async function verifyUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function GET() {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized, please login" }, { status: 401 });
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
          userId: new ObjectId(user.id as any),
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
            return {
              ...candidate,
              _id: candidate._id.toString(),
              members: membersWithImages
            };
          })
        );

        return {
          ...election,
          _id: election._id.toString(),
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
