import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    let query: any = {};
    const isDirector = user.role === "director" || user.role === "super_admin";
    
    if (!isDirector) {
      query = { teacherName: user.name || user.username };
    }

    const dpa = await db.collection("dpa_evaluations").find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(dpa);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch DPA evaluations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newDpa = {
      ...body,
      teacherName: user.name || user.username || "Unknown",
      status: body.status || "draft",
      evaluatorScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("dpa_evaluations").insertOne(newDpa);

    // Notify directors and super_admins
    const targetUsers = await db.collection("users").find({
      role: { $in: ["director", "super_admin"] }
    }).project({ _id: 1 }).toArray();

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        userId: new ObjectId(u._id),
        title: "ประเมิน ว.PA/DPA ใหม่",
        message: `ครู ${newDpa.teacherName} ได้ส่งข้อมูลประเมิน ว.PA/DPA ใหม่`,
        type: "info",
        isRead: false,
        read: false,
        from: user.id || "system",
        fromName: user.name || "System",
        targetUrl: "/dashboard/director/dpa-evaluation",
        createdAt: new Date()
      }));
      await db.collection("notifications").insertMany(notifications);
    }

    return NextResponse.json({ ...newDpa, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create DPA evaluation" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    const { _id, status, evaluatorScore, evaluatorFeedback, videoUrls, studentOutcomeUrls, evidenceLinks, goals, academicYear } = body;
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    const isDirector = user.role === "director";
    const isSuperAdmin = user.role === "super_admin";
    
    if (isDirector || isSuperAdmin) {
      if (status) updateData.status = status;
      if (evaluatorScore !== undefined) updateData.evaluatorScore = evaluatorScore;
      if (evaluatorFeedback !== undefined) updateData.evaluatorFeedback = evaluatorFeedback;
    } 
    
    if (!isDirector || isSuperAdmin) {
      // Teacher or Super Admin updates
      if (videoUrls !== undefined) updateData.videoUrls = videoUrls;
      if (studentOutcomeUrls !== undefined) updateData.studentOutcomeUrls = studentOutcomeUrls;
      if (evidenceLinks !== undefined) updateData.evidenceLinks = evidenceLinks;
      if (goals !== undefined) updateData.goals = goals;
      if (academicYear !== undefined) updateData.academicYear = academicYear;
      if (status && !isDirector) updateData.status = status;
    }

    await db.collection("dpa_evaluations").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update DPA evaluation" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    
    if (user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("dpa_evaluations").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete DPA evaluation" }, { status: 500 });
  }
}
