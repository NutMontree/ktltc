import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, imageUrl, meta, pageNumber } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (meta !== undefined) updateData.meta = meta;
    if (pageNumber !== undefined) updateData.pageNumber = pageNumber;

    const result = await db.collection("pages").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "อัปเดตหน้าสำเร็จ" });
  } catch (error: any) {
    console.error("PUT Page Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("pages").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "ลบหน้าสำเร็จ" });
  } catch (error: any) {
    console.error("DELETE Page Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
