import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// --- POST: Save file metadata ---
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    if (!session || ["user", "student"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, url, thumbnailUrl, folderId: folderIdStr, size, type } = await request.json();
    if (!name || !url) return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });

    const folderId = folderIdStr ? new ObjectId(folderIdStr) : null;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newFile = {
      name,
      url,
      thumbnailUrl,
      folderId,
      size,
      type,
      ownerId: (session.user as any).id,
      ownerName: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("drive_files").insertOne(newFile);

    return NextResponse.json({ success: true, fileId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Drive API POST File Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
