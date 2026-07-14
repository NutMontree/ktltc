import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { visitorId, path } = await req.json();

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

    // Parse Device and Location (Advanced Analytics)
    // 1. Get IP
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";
    // 2. Get User-Agent
    const userAgent = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // 3. Get Location from geoip-lite
    const geo = geoip.lookup(ip);
    let country = req.headers.get("cf-ipcountry") || (geo ? geo.country : "Unknown");
    let city = geo ? geo.city : "Unknown";

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
          deviceType: result.device.type || "desktop",
          os: result.os.name || "Unknown",
          browser: result.browser.name || "Unknown",
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
