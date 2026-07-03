import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = session?.user?.role?.toLowerCase() || "";

    if (userRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { details } = data;

    if (!details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("sar_logs").updateOne(
      { _id: new ObjectId((await params).id) },
      {
        $set: {
          details,
          // Could also add updatedBy/updatedAt if strictly auditing the audit log
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT SAR Log Error:", error);
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = session?.user?.role?.toLowerCase() || "";

    if (userRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("sar_logs").deleteOne({
      _id: new ObjectId((await params).id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE SAR Log Error:", error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
