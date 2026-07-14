import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

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
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const candidates = await db.collection("candidates").find({ electionId: new ObjectId(id) }).sort({ number: 1 }).toArray();
    
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

    return NextResponse.json(enrichedCandidates);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const body = await req.json();
    const { number, name, partyName, imageUrl, policy, members } = body;

    if (!number || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newCandidate = {
      electionId: new ObjectId(id),
      number: Number(number),
      name,
      partyName: partyName || "",
      imageUrl: imageUrl || "",
      policy: policy || "",
      members: members || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("candidates").insertOne(newCandidate);
    return NextResponse.json({ ...newCandidate, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
