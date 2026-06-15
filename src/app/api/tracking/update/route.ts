import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
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
    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, message: "Missing coordinates" }, { status: 400 });
    }

    const updateData = {
      "currentLocation.latitude": latitude,
      "currentLocation.longitude": longitude,
      "currentLocation.updatedAt": new Date()
    };

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check if there is an active session for this user
    const activeSession = await db.collection("off_campus_sessions").findOne({
      studentId: new ObjectId(userId),
      status: "ACTIVE"
    });

    if (!activeSession) {
      return NextResponse.json({ success: false, message: "No active tracking session" }, { status: 403 });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking Update Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
