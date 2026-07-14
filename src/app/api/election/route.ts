import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

// helper to verify admin role
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String(session.user.role || '').toLowerCase().trim();
  if (['super_admin', 'admin', 'director', 'teacher'].includes(role)) {
    return session.user;
  }
  return null;
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const elections = await db
      .collection("elections")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(elections);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate, status } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newElection = {
      title,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("elections").insertOne(newElection);

    return NextResponse.json({ ...newElection, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
