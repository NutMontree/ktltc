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
    let cpuUsage = "0";
    let ramUsage = { total: 0, used: 0, percent: 0 };
    
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

      // Calculate size of all relevant folders including ktltc_drive on Lenovo
      let publicDir = "\\\\192.168.6.118\\public"; 
      const foldersToMeasure = ["uploads", "images", "pdf", "ktltc_drive", "attendance_photos"];
      let totalBytes = 0;

      const fs = require("fs");
      
      // ตรวจสอบว่า UNC Path เข้าถึงได้ไหม ถ้าไม่ได้ให้ถอยกลับไปใช้ Z:
      if (!fs.existsSync(publicDir)) {
        console.warn(`⚠️ UNC Path ${publicDir} not accessible, trying Z: drive...`);
        publicDir = "Z:";
      }

      const getDirSize = (dirPath: string) => {
        let size = 0;
        try {
          if (!fs.existsSync(dirPath)) {
            console.log(`❌ Folder not found: ${dirPath}`);
            return 0;
          }
          const files = fs.readdirSync(dirPath);
          for (let i = 0; i < files.length; i++) {
            const filePath = path.join(dirPath, files[i]);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              size += getDirSize(filePath);
            } else {
              size += stats.size;
            }
          }
        } catch (e: any) {
          console.error(`Error reading ${dirPath}:`, e.message);
        }
        return size;
      };

      foldersToMeasure.forEach((folder) => {
        const folderPath = path.join(publicDir, folder);
        const folderSize = getDirSize(folderPath);
        console.log(`📁 Folder ${folder}: ${(folderSize / (1024 * 1024)).toFixed(2)} MB`);
        totalBytes += folderSize;
      });
      
      storageUsageMB = (totalBytes / (1024 * 1024)).toFixed(2);

      // 4. Get real disk stats and Lenovo Host Info
      try {
        const os = require("os");
        const fs = require("fs");

        // 4.1 Get Disk Stats (UNC Path or Z:)
        if (fs.statfsSync) {
          try {
            const stats = fs.statfsSync(publicDir);
            serverTotalMB = Math.round((stats.blocks * stats.bsize) / (1024 * 1024));
            serverAvailableMB = Math.round((stats.bfree * stats.bsize) / (1024 * 1024));
            serverUsedMB = serverTotalMB - serverAvailableMB;
          } catch (e) {
            try {
              const stats = fs.statfsSync("Z:");
              serverTotalMB = Math.round((stats.blocks * stats.bsize) / (1024 * 1024));
              serverAvailableMB = Math.round((stats.bfree * stats.bsize) / (1024 * 1024));
              serverUsedMB = serverTotalMB - serverAvailableMB;
            } catch (zErr) {
              console.warn("Disk stats failed for both UNC and Z:");
            }
          }
        }

        // 4.2 Get CPU & RAM from Lenovo Host (via MongoDB Admin Command)
        try {
          const adminDb = db.admin();
          const hostInfo = await adminDb.command({ hostInfo: 1 });
          
          ramUsage = {
            total: hostInfo.extra.memSizeMB || 0,
            used: 0, 
            percent: 0, 
          };

          cpuUsage = hostInfo.system.cpuAddrSize ? "Connected" : "0";
        } catch (mongoErr) {
          console.error("MongoDB HostInfo Error:", mongoErr);
          // Fallback to PC stats if MongoDB Admin command fails
          ramUsage = {
            total: Math.round(os.totalmem() / (1024 * 1024)),
            used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)),
            percent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
          };
          
          const cpus = os.cpus();
          let totalIdle = 0, totalTick = 0;
          cpus.forEach((cpu: any) => {
            for (let type in cpu.times) totalTick += cpu.times[type];
            totalIdle += cpu.times.idle;
          });
          cpuUsage = (100 - Math.round((totalIdle / totalTick) * 100)).toString();
        }
      } catch (infraErr) {
        console.error("Infrastructure Check Error:", infraErr);
      }
    } catch (err) {
      console.error("General Stats Calculation Error:", err);
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
      cpuUsage: cpuUsage,
      ramUsage: ramUsage,
      totalPendingQA,
      totalUsers,
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
