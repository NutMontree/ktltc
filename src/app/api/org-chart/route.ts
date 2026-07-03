import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const orgChart = await db.collection("org_charts").findOne({ department });

    return NextResponse.json(orgChart || { department, imageUrl: null });
  } catch (error) {
    console.error("GET Org Chart Error:", error);
    return NextResponse.json({ error: "Failed to fetch org chart" }, { status: 500 });
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
    const { department, imageUrl } = data;

    if (!department || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateDoc = {
      $set: {
        department,
        imageUrl,
        updatedAt: new Date(),
        updatedBy: session?.user?.name || (session?.user as any)?.username || "Unknown",
      },
    };

    await db.collection("org_charts").updateOne(
      { department },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Org Chart Error:", error);
    return NextResponse.json({ error: "Failed to update org chart" }, { status: 500 });
  }
}
