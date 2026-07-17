import GeneralMemo, { connectDB } from "@/app/models/GeneralMemo";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();

    await connectDB();

    // Attach user auth data
    data.userId = session.user.id;
    data.authorName = session.user.name;
    data.authorImage = session.user.image;
    data.authorRole = session.user.role;

    const memo = await GeneralMemo.create(data);
    return NextResponse.json({ message: "General Memo Created", memo }, { status: 201 });
  } catch (err) {
    console.error("GeneralMemo POST error:", err);
    return NextResponse.json(
      { message: "Error creating General Memo", error: err.message },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const memos = await GeneralMemo.find().sort({ createdAt: -1 });
    return NextResponse.json({ memos }, { status: 200 });
  } catch (err) {
    console.error("GeneralMemo GET error:", err);
    return NextResponse.json(
      { message: "Error fetching General Memos", error: err.message },
      { status: 500 },
    );
  }
}
