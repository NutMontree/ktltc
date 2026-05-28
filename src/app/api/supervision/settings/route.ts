import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Fetch all supervision settings (academicYears, termYears)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const settings = await db.collection("supervision_settings").findOne({ _id: "global_settings" as any });

    if (!settings) {
      // Default settings if they don't exist yet
      return NextResponse.json({
        academicYears: ["2567", "2566"],
        termYears: ["1/2567", "2/2567"]
      });
    }

    return NextResponse.json({
      academicYears: settings.academicYears || ["2567", "2566"],
      termYears: settings.termYears || ["1/2567", "2/2567"]
    });
  } catch (error) {
    console.error("Failed to fetch supervision settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST: Add a new year or term/year
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json({ error: "Missing type or value" }, { status: 400 });
    }

    if (type !== "academicYear" && type !== "termYear") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // The field we want to update
    const fieldName = type === "academicYear" ? "academicYears" : "termYears";

    // Use $addToSet to add the item only if it doesn't already exist
    const result = await db.collection("supervision_settings").findOneAndUpdate(
      { _id: "global_settings" as any },
      { $addToSet: { [fieldName]: value } },
      { upsert: true, returnDocument: "after" }
    );
    const doc = result ? ((result as any).value || result) : null;

    return NextResponse.json({
      success: true,
      academicYears: doc?.academicYears || ["2567", "2566"],
      termYears: doc?.termYears || ["1/2567", "2/2567"]
    });

  } catch (error) {
    console.error("Failed to update supervision settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
