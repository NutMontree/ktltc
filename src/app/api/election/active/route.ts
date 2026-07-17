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

    // 1. Get election IDs
    const electionIds = activeElections.map((e) => new ObjectId(e._id as any));

    // 2. Fetch all votes for this user in these elections (Bulk)
    const existingVotes = await db
      .collection("votes")
      .find({
        userId: new ObjectId(user.id as any),
        electionId: { $in: electionIds },
      })
      .toArray();
    
    const votedElectionIds = new Set(existingVotes.map((v) => v.electionId.toString()));

    // 3. Fetch all candidates for these elections (Bulk)
    const allCandidates = await db
      .collection("candidates")
      .find({ electionId: { $in: electionIds } })
      .sort({ number: 1 })
      .toArray();

    // 4. Extract all member names to fetch images
    const memberNames = new Set<string>();
    allCandidates.forEach((candidate) => {
      if (candidate.members) {
        candidate.members.forEach((m: any) => {
          if (m.name) memberNames.add(m.name);
        });
      }
    });

    // 5. Fetch user images in bulk
    const userImages = await db
      .collection("users")
      .find({ name: { $in: Array.from(memberNames) } })
      .project({ name: 1, image: 1 })
      .toArray();
      
    const userImageMap = new Map<string, string>();
    userImages.forEach((u) => {
      if (u.image) userImageMap.set(u.name, u.image);
    });

    // 6. Map everything in memory
    const electionsWithDetails = activeElections.map((election) => {
      const electionIdStr = election._id.toString();
      const hasVoted = votedElectionIds.has(electionIdStr);
      
      const electionCandidates = allCandidates.filter(
        (c) => c.electionId.toString() === electionIdStr
      );

      const enrichedCandidates = electionCandidates.map((candidate) => {
        let membersWithImages = candidate.members || [];
        if (membersWithImages.length > 0) {
          membersWithImages = membersWithImages.map((member: any) => ({
            ...member,
            imageUrl: userImageMap.get(member.name) || member.imageUrl || ""
          }));
        }
        
        return {
          ...candidate,
          _id: candidate._id.toString(),
          members: membersWithImages
        };
      });

      return {
        ...election,
        _id: electionIdStr,
        candidates: enrichedCandidates,
        hasVoted,
      };
    });

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
