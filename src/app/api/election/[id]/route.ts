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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const election = await db.collection("elections").findOne({ _id: new ObjectId(id) });
    if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(election);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const body = await req.json();
    const { title, description, startDate, endDate, status } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;

    const result = await db.collection("elections").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Updated successfully" });
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

    // also delete candidates and votes related to this election
    await db.collection("candidates").deleteMany({ electionId: new ObjectId(id) });
    await db.collection("votes").deleteMany({ electionId: new ObjectId(id) });
    
    const result = await db.collection("elections").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
