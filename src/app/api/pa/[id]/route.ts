import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = session?.user?.role?.toLowerCase() || "";

    if (!["teacher", "admin", "super_admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { year, title, file } = data;

    if (!year || !title || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("pa_documents").updateOne(
      { _id: new ObjectId((await params).id) },
      {
        $set: {
          year,
          title,
          file,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // --- Add Log ---
    await db.collection("pa_logs").insertOne({
      userName: session?.user?.name || session?.user?.username || "Unknown",
      action: "UPDATE",
      details: `แก้ไขเอกสารปีการศึกษา ${year}: ${title}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT PA Document Error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = session?.user?.role?.toLowerCase() || "";

    if (!["teacher", "admin", "super_admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("pa_documents").deleteOne({
      _id: new ObjectId((await params).id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // --- Add Log ---
    await db.collection("pa_logs").insertOne({
      userName: session?.user?.name || session?.user?.username || "Unknown",
      action: "DELETE",
      details: `ลบเอกสาร (ID: ${(await params).id})`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PA Document Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
