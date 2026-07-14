import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { visitorId, path } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ success: false, message: "Missing visitorId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Upsert the visitor session
    await db.collection("visitors_live").updateOne(
      { visitorId },
      { 
        $set: { 
          visitorId,
          path, 
          lastActiveAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor Tracking Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
