import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { InternshipScreening } from "@/app/models/InternshipScreening";
import { auth } from "@/lib/auth";

// ลบข้อมูลคัดกรอง (DELETE) - เฉพาะ super_admin
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = session?.user?.role || (session as any)?.role;

    if (!session || role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Super Admin only." },
        { status: 403 }
      );
    }

    await connectMongoose();
    const resolvedParams = await params;
    const deleted = await InternshipScreening.findByIdAndDelete(resolvedParams.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "ลบข้อมูลเรียบร้อยแล้ว" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE InternshipScreening Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// แก้ไขข้อมูลคัดกรอง (PUT) - เฉพาะ super_admin
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = session?.user?.role || (session as any)?.role;

    if (!session || role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Super Admin only." },
        { status: 403 }
      );
    }

    await connectMongoose();
    const resolvedParams = await params;
    const body = await req.json();

    // อนุญาตให้แก้ไขเฉพาะ field เหล่านี้
    const allowedFields = [
      "name", "studentId", "department", "classroom", "age", "gender",
      "st5Total", "twoQTotal", "q9Total", "q8Total",
      "softSkillsScore", "softSkillsTotal", "mentalHealthRisk", "softSkillsPercentage"
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updated = await InternshipScreening.findByIdAndUpdate(
      resolvedParams.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, message: "แก้ไขข้อมูลเรียบร้อยแล้ว" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT InternshipScreening Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
