import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { IBook } from "@/models/Book";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const books = await db.collection("books").find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ success: true, data: books });
  } catch (error: any) {
    console.error("GET Books Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, coverImageUrl, themeColor } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check if slug exists
    const existing = await db.collection("books").findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: "URL Slug already exists" }, { status: 400 });
    }

    const newBook: Omit<IBook, '_id'> = {
      title,
      slug,
      description: description || "",
      coverImageUrl: coverImageUrl || "",
      themeColor: themeColor || "blue",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("books").insertOne(newBook);

    return NextResponse.json({ 
      success: true, 
      message: "สร้างหนังสือสำเร็จ", 
      data: { _id: result.insertedId, ...newBook } 
    });
  } catch (error: any) {
    console.error("POST Books Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
