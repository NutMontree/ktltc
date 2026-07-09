import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { IPage } from "@/models/Page";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const pages = await db.collection("pages").find({ bookId: id }).sort({ pageNumber: 1 }).toArray();
    
    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error("GET Pages Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, imageUrl, meta, pageNumber } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Default to adding to the end
    let finalPageNumber = pageNumber;
    if (finalPageNumber === undefined) {
      const lastPage = await db.collection("pages").find({ bookId: id }).sort({ pageNumber: -1 }).limit(1).toArray();
      finalPageNumber = lastPage.length > 0 ? lastPage[0].pageNumber + 1 : 1;
    }

    const newPage: Omit<IPage, '_id'> = {
      bookId: id,
      pageNumber: finalPageNumber,
      title: title || "",
      content: content || "",
      imageUrl: imageUrl || "",
      meta: meta || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("pages").insertOne(newPage);

    return NextResponse.json({ 
      success: true, 
      message: "สร้างหน้าใหม่สำเร็จ", 
      data: { _id: result.insertedId, ...newPage } 
    });
  } catch (error: any) {
    console.error("POST Pages Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
