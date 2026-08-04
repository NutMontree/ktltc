import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

// Thai title prefixes to strip (order matters: longer prefixes first)
const THAI_TITLE_PREFIXES = ["นางสาว", "นาง", "นาย", "ด.ญ.", "ด.ช.", "เด็กหญิง", "เด็กชาย"];

function stripThaiTitle(name: string): string {
  const trimmed = name.trim();
  for (const prefix of THAI_TITLE_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }
  return trimmed;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ students: [] });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Strip Thai title prefix from query for flexible matching
    const strippedQ = stripThaiTitle(q);

    // Build search patterns: original query + stripped version (if different)
    const namePatterns: { name: { $regex: string; $options: string } }[] = [
      { name: { $regex: q, $options: "i" } },
    ];
    if (strippedQ !== q && strippedQ.length >= 2) {
      namePatterns.push({ name: { $regex: strippedQ, $options: "i" } });
    }

    const students = await db
      .collection("users")
      .find({
        role: "student",
        $or: [
          ...namePatterns,
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
