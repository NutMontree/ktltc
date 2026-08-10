import { NextResponse } from "next/server";
import { connectDB } from "@/app/models/InternalPdca";
import TeachingRecord from "@/app/models/TeachingRecord";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const type = searchParams.get("type"); // "teacher" | "head"

    if (!name || !type) {
      return NextResponse.json({ error: "Missing name or type parameter" }, { status: 400 });
    }

    await connectDB();

    let query = {};
    if (type === "teacher") {
      query = { signerName: name, teacherSignature: { $ne: "" }, $and: [{ teacherSignature: { $exists: true } }] };
    } else if (type === "head") {
      query = { headName: name, headSignature: { $ne: "" }, $and: [{ headSignature: { $exists: true } }] };
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const latestRecord = await TeachingRecord.findOne(query)
      .sort({ createdAt: -1 })
      .select(type === "teacher" ? "teacherSignature" : "headSignature")
      .lean();

    if (!latestRecord) {
      return NextResponse.json({ signature: null }, { status: 200 });
    }

    const signature = type === "teacher" ? latestRecord.teacherSignature : latestRecord.headSignature;

    return NextResponse.json({ signature }, { status: 200 });
  } catch (error) {
    console.error("Error fetching last signature:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
