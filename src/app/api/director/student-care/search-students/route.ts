import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ students: [] });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const students = await db
      .collection("users")
      .find({
        role: "student",
        $or: [
          { name: { $regex: q, $options: "i" } },
          { studentIdNum: { $regex: q, $options: "i" } },
          { classroomName: { $regex: q, $options: "i" } },
          { classGroupId: { $regex: q, $options: "i" } },
          { department: { $regex: q, $options: "i" } },
        ],
      })
      .limit(20)
      .project({
        name: 1,
        studentIdNum: 1,
        classroomName: 1,
        classGroupId: 1,
        department: 1,
        image: 1,
        imageUrl: 1,
      })
      .toArray();

    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search students" }, { status: 500 });
  }
}
