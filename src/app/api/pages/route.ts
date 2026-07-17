import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const pages = await db.collection("pages").find({}).toArray();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, title, content } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ตรวจสอบว่า slug ซ้ำไหม
    const existing = await db.collection("pages").findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 },
      );
    }

    await db.collection("pages").insertOne({
      slug,
      title,
      content,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, slug, title, content } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("pages").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          slug,
          title,
          content,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ลบข้อมูล
    const result = await db.collection("pages").deleteOne({
      _id: new ObjectId(id), // หรือ id ตามรูปแบบที่คุณเก็บ
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลที่ต้องการลบ" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    // ต้อง Return JSON เสมอ เพื่อไม่ให้หน้าบ้าน Error
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
