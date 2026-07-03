import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ISarLog } from "@/models/SarLog";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const logs = await db
      .collection<ISarLog>("sar_logs")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET SAR Logs Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
