import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const teacherParam = searchParams.get("teacher");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let query: any = {};
    const isDirector = user.role === "director" || user.role === "super_admin";
    
    if (!isDirector) {
      // Teachers can only view their own plans
      query = { teacherName: user.name || user.username };
    } else if (teacherParam) {
      // Directors can filter by teacher query parameter
      query = { teacherName: teacherParam };
    }

    const pipeline: any[] = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          let: { tName: "$teacherName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$name", "$$tName"] },
                    { $eq: ["$username", "$$tName"] }
                  ]
                }
              }
            },
            { $limit: 1 },
            { $project: { image: 1 } }
          ],
          as: "teacherInfo"
        }
      },
      {
        $addFields: {
          teacherImage: { $arrayElemAt: ["$teacherInfo.image", 0] }
        }
      },
      {
        $project: {
          teacherInfo: 0
        }
      }
    ];

    const plans = await db.collection("lesson_plans").aggregate(pipeline).toArray();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lesson plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any || { name: "System", id: "system" };
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newPlan = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("lesson_plans").insertOne(newPlan);

    // Notify directors and super_admins
    const targetUsers = await db.collection("users").find({
      role: { $in: ["director", "super_admin"] }
    }).project({ _id: 1 }).toArray();

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        userId: new ObjectId(u._id),
        title: "แผนการสอนใหม่",
        message: `ครู ${newPlan.teacherName || user.name || 'ไม่ระบุชื่อ'} ได้ส่งแผนการสอน/บันทึกหลังสอนใหม่`,
        type: "info",
        isRead: false,
        read: false,
        from: user.id || "system",
        fromName: user.name || "System",
        targetUrl: "/dashboard/director/lesson-plans",
        createdAt: new Date()
      }));
      await db.collection("notifications").insertMany(notifications);
    }

    return NextResponse.json({ ...newPlan, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson plan" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    const { _id, status, feedback, subject, title, fileUrl, fileUrls, semester, academicYear, hasAfterClassNote, afterClassNoteUrls } = body;
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;
    
    // For teacher edits
    if (subject) updateData.subject = subject;
    if (title) updateData.title = title;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (fileUrls !== undefined) updateData.fileUrls = fileUrls;
    if (semester) updateData.semester = semester;
    if (academicYear) updateData.academicYear = academicYear;
    if (hasAfterClassNote !== undefined) updateData.hasAfterClassNote = hasAfterClassNote;
    if (afterClassNoteUrls !== undefined) updateData.afterClassNoteUrls = afterClassNoteUrls;


    await db.collection("lesson_plans").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lesson plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("lesson_plans").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lesson plan" }, { status: 500 });
  }
}
