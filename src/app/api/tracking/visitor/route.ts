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

    // 1. Get IP
    const rawIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = rawIp.split(',')[0].trim();
    
    // 2. Get User-Agent natively via NextJS
    const { device, os, browser } = userAgent(req);
    
    // 3. Get Location from Cloudflare Headers or Cache
    let country = req.headers.get("cf-ipcountry") || "Unknown";
    let city = req.headers.get("cf-ipcity") || "Unknown";

    if (ip === "127.0.0.1" || ip === "::1" || ip.includes("127.0.0.1") || ip.startsWith("::ffff:127.0.0.1")) {
      country = "TH";
      city = "Localhost";
    } else if (city === "Unknown") {
      // Try to fetch from ip_locations cache
      const cachedIp = await db.collection("ip_locations").findOne({ ip });
      if (cachedIp) {
        city = cachedIp.city;
        if (country === "Unknown") country = cachedIp.country;
      } else {
        // Fetch from external API if not cached
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          const ipRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.status === "success") {
              city = ipData.city || city;
              country = ipData.countryCode || ipData.country || country;
              
              // Save to cache
              await db.collection("ip_locations").insertOne({
                ip,
                city,
                country,
                createdAt: new Date()
              });
            }
          }
        } catch (e) {
          console.error("IP Geolocation Fetch Error:", e);
        }
      }
    }

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
          ip: ip,
          deviceType: device.type || "desktop",
          os: os.name || "Unknown",
          browser: browser.name || "Unknown",
        },
        $set: {
          lastActiveAt: new Date(),
          path: path,
          country: country, // Update country in case it was resolved
          city: city        // Update city in case it was resolved
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
