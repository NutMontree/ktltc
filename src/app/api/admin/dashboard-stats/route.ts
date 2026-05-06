import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { execSync } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = (session?.user as any)?.role?.toLowerCase();

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const hasAccess = rolePerms?.permissions?.access_dashboard || userRole === "super_admin";

    if (!hasAccess) {
      // Fallback for legacy roles if role_permissions not set up
      const legacyRoles = ["admin", "editor"];
      if (!legacyRoles.includes(userRole)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // 1. Fetch counts from MongoDB
    const [
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalUsers,
      totalPendingQA,
      totalDriveFiles,
      totalDriveFolders,
    ] = await Promise.all([
      db.collection("news").countDocuments(),
      db.collection("navbar").countDocuments({ parentId: null }),
      db.collection("pages").countDocuments(),
      db.collection("banners").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("questions").countDocuments({ status: "pending" }),
      db.collection("drive_files").countDocuments(),
      db.collection("drive_folders").countDocuments(),
    ]);

    // 2. Media Stats (Image Count from News + Drive)
    const [newsImageStats, driveImageCount] = await Promise.all([
      db.collection("news")
        .aggregate([
          {
            $project: {
              imageCount: {
                $add: [
                  { $cond: { if: { $isArray: "$images" }, then: { $size: "$images" }, else: 0 } },
                  { $cond: { if: { $isArray: "$announcementImages" }, then: { $size: "$announcementImages" }, else: 0 } },
                ],
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$imageCount" } } },
        ])
        .toArray(),
      db.collection("drive_files").countDocuments({ type: { $regex: /^image\//i } })
    ]);

    const totalImagesCount = (newsImageStats.length > 0 ? newsImageStats[0].total : 0) + driveImageCount;

    // 3. Infrastructure Usage (MongoDB)
    const dbStats = await db.stats();
    const dbSizeMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);
    
    // 4. Local Storage & DB Quotas
    let storageUsageMB = "0.00";
    let storageLimitMB = 20000; // Default fallback
    let dbLimitMB = 0; // Default unlimited for DB
    let serverTotalMB = 0; // Real disk capacity
    let serverUsedMB = 0;
    let serverAvailableMB = 0;
    
    try {
      // Fetch custom limits from database
      const [storageLimit, dbLimit] = await Promise.all([
        db.collection("site_settings").findOne({ key: "storage_limit_mb" }),
        db.collection("site_settings").findOne({ key: "db_limit_mb" })
      ]);

      if (storageLimit) {
        storageLimitMB = parseFloat(storageLimit.value);
        if (isNaN(storageLimitMB)) storageLimitMB = 20000;
      }

      if (dbLimit) {
        dbLimitMB = parseFloat(dbLimit.value);
        if (isNaN(dbLimitMB)) dbLimitMB = 0;
      }

      // Calculate size of all relevant folders including ktltc_drive
      const publicDir = path.join(process.cwd(), "public");
      const cmd = `du -sm ${publicDir}/uploads ${publicDir}/images ${publicDir}/pdf ${publicDir}/ktltc_drive 2>/dev/null | awk '{sum += $1} END {print sum}'`;
      const sizeStr = execSync(cmd).toString().trim();
      storageUsageMB = (parseFloat(sizeStr) || 0).toFixed(2);

      // Get real disk capacity
      try {
        const diskCmd = `df -m "${process.cwd()}" | tail -1 | awk '{print $2 " " $3 " " $4}'`;
        const diskInfo = execSync(diskCmd).toString().trim().split(/\s+/);
        serverTotalMB = parseInt(diskInfo[0]) || 0;
        serverUsedMB = parseInt(diskInfo[1]) || 0;
        serverAvailableMB = parseInt(diskInfo[2]) || 0;
      } catch (diskErr) {
        console.error("Disk Capacity Check Error:", diskErr);
      }
    } catch (err) {
      console.error("Local Storage Usage Calculation Error:", err);
    }

    return NextResponse.json({
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalImagesCount,
      totalDriveFiles,
      totalDriveFolders,
      dbSizeMB,
      dbLimitMB: dbLimitMB,
      cloudUsageMB: storageUsageMB, // Keeping same key for frontend compatibility
      cloudLimitMB: storageLimitMB,
      serverTotalMB: serverTotalMB,
      serverUsedMB: serverUsedMB,
      serverAvailableMB: serverAvailableMB,
      totalPendingQA,
      totalUsers,
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
