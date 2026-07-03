import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ISarDocument } from "@/models/SarDocument";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const documents = await db
      .collection<ISarDocument>("sar_documents")
      .find({})
      .sort({ year: -1 })
      .toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET SAR Documents Error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const newDocument: ISarDocument = {
      year,
      title,
      file,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("sar_documents").insertOne(newDocument);

    // --- Add Log ---
    await db.collection("sar_logs").insertOne({
      userName: session?.user?.name || (session?.user as any)?.username || "Unknown",
      action: "CREATE",
      details: `เพิ่มเอกสารปีการศึกษา ${year}: ${title}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST SAR Document Error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
