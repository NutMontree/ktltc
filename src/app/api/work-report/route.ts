import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { saveFileLocally } from "@/lib/upload-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const targetUserId = searchParams.get("userId");
    const roleParam = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Case 1: Fetch all reports for a date range (Admin only)
    if (startDateParam && endDateParam) {
      const allowedRoles = [
        "super_admin",
        "admin",
        "hr",
        "director",
        "deputy_director",
        "editor",
      ];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const matchStage: any = {
        date: {
          $gte: new Date(startDateParam + "T00:00:00.000Z"),
          $lte: new Date(endDateParam + "T23:59:59.999Z"),
        },
      };

      const basePipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      ];

      // Filter by Role
      if (roleParam && roleParam !== "all") {
        basePipeline.push({ $match: { "userDetails.role": roleParam } });
      }

      const facetPipeline: any[] = [
        ...basePipeline,
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { date: -1, createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  id: { $toString: "$_id" },
                  date: 1,
                  user: {
                    name: { $ifNull: ["$userDetails.name", "Unknown User"] },
                    email: { $ifNull: ["$userDetails.email", ""] },
                    role: { $ifNull: ["$userDetails.role", ""] },
                    department: { $ifNull: ["$userDetails.department", "N/A"] },
                    image: { $ifNull: ["$userDetails.image", ""] },
                  },
                  activities: 1,
                  summary: 1,
                  problems: 1,
                  plansNextDay: 1,
                  images: 1,
                  createdAt: 1,
                  updatedAt: 1,
                },
              },
            ],
          },
        },
      ];

      const result = await db
        .collection("work_reports")
        .aggregate(facetPipeline)
        .toArray();

      const total = result[0]?.metadata[0]?.total || 0;
      const records = result[0]?.data || [];

      return NextResponse.json({
        success: true,
        data: records,
        total,
        page,
        limit,
        hasMore: total > skip + records.length,
      });
    }

    // Case 2: Fetch specific report for a date OR Fetch all history for current user
    const queryUserId = targetUserId || userId;

    if (!dateParam && !startDateParam) {
      // User history mode
      const reports = await db.collection("work_reports")
        .find({ userId: new ObjectId(queryUserId) })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await db.collection("work_reports").countDocuments({
        userId: new ObjectId(queryUserId),
      });

      return NextResponse.json({
        success: true,
        data: reports.map(r => ({ ...r, id: r._id.toString() })),
        total,
        page,
        limit,
        hasMore: total > skip + reports.length
      });
    }

    let queryDate: Date = new Date(dateParam || new Date());
    queryDate.setUTCHours(0, 0, 0, 0);

    // Security: Only allow fetching own report unless admin
    const allowedRoles = [
      "super_admin",
      "admin",
      "hr",
      "director",
      "deputy_director",
      "editor",
      "staff",
    ];
    if (queryUserId !== userId && !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const report = await db.collection("work_reports").findOne({
      userId: new ObjectId(queryUserId),
      date: queryDate,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Work Report GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { date, activities, summary, problems, plansNextDay, images } = data;

    // Handle Local Uploads if images are provided
    let imageUrls: string[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.startsWith("data:image")) {
          const imageUrl = await saveFileLocally(img, "work_reports", "report");
          if (imageUrl) imageUrls.push(imageUrl);
        } else if (img.startsWith("http") || img.startsWith("/")) {
          // Keep existing URLs (Cloudinary or local)
          imageUrls.push(img);
        }
      }
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const reportDate = date ? new Date(date) : new Date();
    reportDate.setUTCHours(0, 0, 0, 0);

    const updateDoc = {
      $set: {
        activities:
          activities?.map((a: any) => ({
            ...a,
            taskName: a.taskName?.trim() || "ไม่ได้ระบุ",
            detail: a.detail?.trim() || "ไม่ได้ระบุ",
          })) || [],
        summary: summary?.trim() || "ไม่ได้ระบุ",
        problems: problems?.trim() || "ไม่ได้ระบุ",
        plansNextDay: plansNextDay?.trim() || "ไม่ได้ระบุ",
        images: imageUrls,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId: new ObjectId(userId),
        date: reportDate,
        createdAt: new Date(),
      },
    };

    const result = await db
      .collection("work_reports")
      .findOneAndUpdate(
        { userId: new ObjectId(userId), date: reportDate },
        updateDoc,
        { upsert: true, returnDocument: "after" },
      );

    // Safety check for result (TypeScript)
    const savedReport = result?.value || result;

    return NextResponse.json({ success: true, data: savedReport });
  } catch (error: any) {
    console.error("Work Report POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, activities, summary, problems, plansNextDay, images } = data;
    if (!id) return NextResponse.json({ error: "Missing report ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Security: Check if user owns the report OR is super_admin
    const existingReport = await db.collection("work_reports").findOne({ _id: new ObjectId(id) });
    if (!existingReport) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const isOwner = (existingReport.userId as ObjectId).toString() === userId;

    if (!isOwner && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Not authorized to edit this report" }, { status: 403 });
    }

    const updates: any = {
      activities,
      summary,
      problems,
      plansNextDay,
      updatedAt: new Date(),
    };

    if (images) updates.images = images;

    const result = await db.collection("work_reports").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
    });
  } catch (error: any) {
    console.error("Work Report PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let result;
    if (deleteAll) {
      // Bulk Delete (Super Admin only check already done above)
      result = await db.collection("work_reports").deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Deleted all ${result.deletedCount} reports`,
      });
    }

    if (!id)
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });

    result = await db
      .collection("work_reports")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error: any) {
    console.error("Work Report DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
