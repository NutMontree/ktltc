import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const logs = await db
      .collection("pa_logs")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET PA Logs Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
