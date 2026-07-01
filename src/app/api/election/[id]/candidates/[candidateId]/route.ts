import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String((session.user as any).role || '').toLowerCase().trim();
  if (['super_admin', 'admin', 'director', 'teacher'].includes(role)) {
    return session.user;
  }
  return null;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; candidateId: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { candidateId } = await params;
    const body = await req.json();
    const { number, name, partyName, imageUrl, policy, members } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData: any = { updatedAt: new Date() };
    if (number !== undefined) updateData.number = Number(number);
    if (name !== undefined) updateData.name = name;
    if (partyName !== undefined) updateData.partyName = partyName;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (policy !== undefined) updateData.policy = policy;
    if (members !== undefined) updateData.members = members;

    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; candidateId: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { candidateId } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const result = await db.collection("candidates").deleteOne({ _id: new ObjectId(candidateId) });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
