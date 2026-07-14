import { NextResponse, NextRequest, userAgent } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visitorId = body.visitorId;
    const path = body.path;

    if (!visitorId) {
      return NextResponse.json({ success: false, message: "Missing visitorId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Upsert the visitor session (Live tracking)
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

    // Parse Device and Location natively without npm dependencies
    // 1. Get IP
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // 2. Get User-Agent natively via NextJS
    const { device, os, browser } = userAgent(req);
    
    // 3. Get Location from Cloudflare Headers
    const country = req.headers.get("cf-ipcountry") || "Unknown";
    const city = req.headers.get("cf-ipcity") || "Unknown";

    // Create a date string (YYYY-MM-DD) in Thai timezone
    const now = new Date();
    const tzOffset = 7 * 60 * 60 * 1000; // +7 hours for Thailand
    const localDate = new Date(now.getTime() + tzOffset);
    const dateStr = localDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Upsert into website_analytics (One row per visitor per day)
    await db.collection("website_analytics").updateOne(
      { visitorId, date: dateStr },
      {
        $setOnInsert: {
          visitorId,
          date: dateStr,
          ip: ip.split(',')[0].trim(),
          country,
          city,
          deviceType: device.type || "desktop",
          os: os.name || "Unknown",
          browser: browser.name || "Unknown",
        },
        $set: {
          lastActiveAt: new Date(),
          path: path,
        },
        $inc: {
          views: 1
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
