import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only authorized staff can track
    if (!["super_admin", "admin", "director", "teacher", "deputy_student_affairs"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const dateBoundary = new Date();
    dateBoundary.setDate(dateBoundary.getDate() - days);
    const dateBoundaryStr = dateBoundary.toISOString().split("T")[0];

    const analyticsData = await db.collection("website_analytics").find({ date: { $gte: dateBoundaryStr } }).toArray();

    // Aggregations
    let totalVisitors = 0;
    const dailyData: Record<string, number> = {};
    const deviceData: Record<string, number> = {};
    const osData: Record<string, number> = {};
    const countryData: Record<string, number> = {};
    const latestVisitorsMap = new Map<string, any>();

    // Sort by lastActiveAt descending for latest visitors
    const sortedData = [...analyticsData].sort((a, b) => {
      const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return timeB - timeA;
    });

    for (const record of sortedData) {
      totalVisitors++;
      
      // Daily Trend
      dailyData[record.date] = (dailyData[record.date] || 0) + 1;
      
      // Device
      const device = record.deviceType || "desktop";
      deviceData[device] = (deviceData[device] || 0) + 1;
      
      // OS
      const os = record.os || "Unknown";
      osData[os] = (osData[os] || 0) + 1;

      // Country / City
      const loc = `${record.city || "Unknown"}, ${record.country || "Unknown"}`;
      countryData[loc] = (countryData[loc] || 0) + 1;

      // Deduplicate by IP for latest visitors
      if (!latestVisitorsMap.has(record.ip)) {
        if (latestVisitorsMap.size < 500) { // Keep up to 500 for the modal
          latestVisitorsMap.set(record.ip, {
            ip: record.ip,
            location: loc,
            device: device,
            os: os,
            browser: record.browser,
            path: record.path,
            time: record.lastActiveAt,
            count: record.views || 1
          });
        }
      } else {
        // Accumulate views for the same IP
        const existing = latestVisitorsMap.get(record.ip);
        existing.count += (record.views || 1);
      }
    }

    const latestVisitors = Array.from(latestVisitorsMap.values());

    // Format for charts
    const dailyTrendChart = Object.keys(dailyData).sort().map(date => ({
      date,
      visitors: dailyData[date]
    }));

    const deviceChart = Object.keys(deviceData).map(key => ({
      name: key,
      value: deviceData[key]
    }));

    const osChart = Object.keys(osData).map(key => ({
      name: key,
      value: osData[key]
    })).sort((a, b) => b.value - a.value);

    const locationChart = Object.keys(countryData).map(key => ({
      name: key,
      value: countryData[key]
    })).sort((a, b) => b.value - a.value).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        dailyTrendChart,
        deviceChart,
        osChart,
        locationChart,
        latestVisitors
      }
    });

  } catch (error) {
    console.error("Fetch Analytics Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only authorized staff can clear data
    if (!["super_admin", "admin", "director"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Clear the analytics collections
    await db.collection("website_analytics").deleteMany({});

    return NextResponse.json({ success: true, message: "Cleared analytics data" });
  } catch (error) {
    console.error("Clear Analytics Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
