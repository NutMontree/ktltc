import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { title, slug, description, coverImageUrl, themeColor } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check slug uniqueness
    if (slug) {
      const existing = await db.collection("books").findOne({ slug, _id: { $ne: new ObjectId(id) } });
      if (existing) {
        return NextResponse.json({ success: false, error: "URL Slug already exists" }, { status: 400 });
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (themeColor !== undefined) updateData.themeColor = themeColor;

    const result = await db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "อัปเดตหนังสือสำเร็จ" });
  } catch (error: any) {
    console.error("PUT Book Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Delete the book
    const result = await db.collection("books").deleteOne({ _id: new ObjectId(id) });
    
    // Also delete all pages in this book
    await db.collection("pages").deleteMany({ bookId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "ลบหนังสือสำเร็จ" });
  } catch (error: any) {
    console.error("DELETE Book Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
