import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const cacheDocs = await db
      .collection("extracted_cache")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: cacheDocs }, { status: 200 });
  } catch (error) {
    console.error("Error in GET extracted-cache:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("extracted_cache").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id, // Ensure they can only delete their own
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE extracted-cache:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
