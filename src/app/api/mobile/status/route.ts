import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback_secret_ktltc_mobile_app");
    
    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const userId = payload.id as string;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const activeSession = await db.collection("off_campus_sessions").findOne({
      studentId: new ObjectId(userId),
      status: "ACTIVE"
    });

    return NextResponse.json({ 
      success: true, 
      isTrackingActive: !!activeSession,
      session: activeSession ? {
        scannedOutAt: activeSession.scannedOutAt
      } : null
    });

  } catch (error) {
    console.error("Mobile Status Check Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
