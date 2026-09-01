import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { DepartmentGroup } from "@/models/DepartmentGroup";
import { DEPARTMENT_GROUPS } from "@/constants/departments";

export async function GET(req: NextRequest) {
  try {
    await connectMongoose();
    let groups = await DepartmentGroup.find({}).sort({ order: 1 });

    // Auto-seed if empty
    if (groups.length === 0) {
      const seedData = DEPARTMENT_GROUPS.map((g, idx) => ({
        label: g.label,
        options: g.options,
        order: idx + 1,
      }));
      await DepartmentGroup.insertMany(seedData);
      groups = await DepartmentGroup.find({}).sort({ order: 1 });
    }

    return NextResponse.json(groups);
  } catch (error: any) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { groups } = await req.json();
    if (!Array.isArray(groups)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    await connectMongoose();
    
    // Clear existing and replace to keep it simple and preserve order exactly
    await DepartmentGroup.deleteMany({});
    
    const newGroups = groups.map((g: any, idx: number) => ({
      label: g.label,
      options: g.options,
      order: idx + 1,
    }));
    
    await DepartmentGroup.insertMany(newGroups);

    return NextResponse.json({ success: true, message: "Departments updated successfully." });
  } catch (error: any) {
    console.error("PUT /api/departments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
