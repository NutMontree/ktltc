import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  campusCenterLat: 14.754043,
  campusCenterLng: 104.65807,
  geofenceRadius: 500,
  refreshIntervalSeconds: 15
};

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only authorized staff can get config
    if (!["super_admin", "admin", "director", "teacher", "deputy_student_affairs"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // We only need one global config document
    const config = await db.collection("tracking_configs").findOne({ type: "global" });

    if (!config) {
      return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Fetch Tracking Config Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only admins can modify
    if (!["super_admin", "admin"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { campusCenterLat, campusCenterLng, geofenceRadius, refreshIntervalSeconds } = data;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateDoc = {
      $set: {
        type: "global",
        campusCenterLat: Number(campusCenterLat) || DEFAULT_CONFIG.campusCenterLat,
        campusCenterLng: Number(campusCenterLng) || DEFAULT_CONFIG.campusCenterLng,
        geofenceRadius: Number(geofenceRadius) || DEFAULT_CONFIG.geofenceRadius,
        refreshIntervalSeconds: Number(refreshIntervalSeconds) || DEFAULT_CONFIG.refreshIntervalSeconds,
        updatedAt: new Date()
      }
    };

    await db.collection("tracking_configs").updateOne(
      { type: "global" },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Tracking config updated successfully" });
  } catch (error) {
    console.error("Update Tracking Config Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
