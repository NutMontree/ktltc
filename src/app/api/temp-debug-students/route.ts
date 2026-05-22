import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const students = await db.collection("users").find({ role: "student" }).toArray();
    
    const classGroupsMap: Record<string, { count: number; samples: string[] }> = {};
    students.forEach(s => {
      const group = s.classGroupId || "undefined";
      if (!classGroupsMap[group]) {
        classGroupsMap[group] = { count: 0, samples: [] };
      }
      classGroupsMap[group].count++;
      if (classGroupsMap[group].samples.length < 3) {
        classGroupsMap[group].samples.push(`${s.name} (${s.department})`);
      }
    });

    const result = {
      success: true,
      totalStudents: students.length,
      classGroups: classGroupsMap,
    };

    fs.writeFileSync(
      "d:\\ktltc\\debug-classgroups.json",
      JSON.stringify(result, null, 2),
      "utf8"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
