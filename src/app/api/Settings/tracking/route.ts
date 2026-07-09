import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Attempt to fetch the settings
    const settings = await db.collection("system_settings").findOne({ _id: "tracking_config" });
    
    // Return default settings if none found
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          webrtc_hack_enabled: false,
          pip_hack_enabled: false
        }
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Fetch Tracking Settings Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Only super_admin can update settings
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    
    if (userRole !== "super_admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { webrtc_hack_enabled, pip_hack_enabled } = await request.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("system_settings").updateOne(
      { _id: "tracking_config" },
      {
        $set: {
          webrtc_hack_enabled: Boolean(webrtc_hack_enabled),
          pip_hack_enabled: Boolean(pip_hack_enabled),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Tracking Settings Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
