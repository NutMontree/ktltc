import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { execSync } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    if (!session || !["super_admin", "admin", "editor"].includes(userRole)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Fetch counts from MongoDB
    const [
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalUsers,
      totalPendingQA,
    ] = await Promise.all([
      db.collection("news").countDocuments(),
      db.collection("navbar").countDocuments({ parentId: null }),
      db.collection("pages").countDocuments(),
      db.collection("banners").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("questions").countDocuments({ status: "pending" }),
    ]);

    // 2. Media Stats (Image Count)
    const imageStats = await db
      .collection("news")
      .aggregate([
        {
          $project: {
            imageCount: {
              $add: [
                {
                  $cond: {
                    if: { $isArray: "$images" },
                    then: { $size: "$images" },
                    else: 0,
                  },
                },
                {
                  $cond: {
                    if: { $isArray: "$announcementImages" },
                    then: { $size: "$announcementImages" },
                    else: 0,
                  },
                },
              ],
            },
          },
        },
        { $group: { _id: null, totalImages: { $sum: "$imageCount" } } },
      ])
      .toArray();

    const totalImagesCount = imageStats.length > 0 ? imageStats[0].totalImages : 0;

    // 3. Infrastructure Usage (MongoDB)
    const dbStats = await db.stats();
    const dbSizeMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);
    
    // 4. Local Storage Usage (Instead of Cloudinary)
    let storageUsageMB = "0.00";
    let storageLimitMB = 20000; // Example 20GB limit for local storage display
    
    try {
      // Calculate size of public/uploads, public/images, public/pdf
      const publicDir = path.join(process.cwd(), "public");
      const cmd = `du -sm ${publicDir}/uploads ${publicDir}/images ${publicDir}/pdf 2>/dev/null | awk '{sum += $1} END {print sum}'`;
      const sizeStr = execSync(cmd).toString().trim();
      storageUsageMB = (parseFloat(sizeStr) || 0).toFixed(2);
    } catch (err) {
      console.error("Local Storage Usage Calculation Error:", err);
    }

    return NextResponse.json({
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalImagesCount,
      dbSizeMB,
      cloudUsageMB: storageUsageMB, // Keeping same key for frontend compatibility
      cloudLimitMB: storageLimitMB,
      totalPendingQA,
      totalUsers,
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
