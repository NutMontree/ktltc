import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");

    // 1. Check for Web Session (NextAuth) first
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    } 
    // 2. Fallback to JWT Token (for Mobile App)
    else if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback_secret_ktltc_mobile_app");
      try {
        const verified = await jwtVerify(token, secret);
        userId = verified.payload.id as string;
      } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
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
