import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// --- GET: List folders and files in a specific directory ---
export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    if (!session || ["user", "student"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parentIdStr = searchParams.get("parentId");
    const parentId = parentIdStr && parentIdStr !== "null" ? new ObjectId(parentIdStr) : null;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Fetch Folders
    const folders = await db.collection("drive_folders")
      .find({ parentId })
      .sort({ name: 1 })
      .toArray();

    // Fetch Files
    const files = await db.collection("drive_files")
      .find({ folderId: parentId })
      .sort({ name: 1 })
      .toArray();

    // Fetch All Folders (for move picker)
    const allFolders = await db.collection("drive_folders")
      .find({})
      .project({ _id: 1, name: 1, parentId: 1 })
      .toArray();

    return NextResponse.json({ folders, files, allFolders });
  } catch (error) {
    console.error("Drive API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- POST: Create a new folder ---
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    if (!session || ["user", "student"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, parentId: parentIdStr, isCollaborative } = await request.json();
    if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

    const parentId = parentIdStr ? new ObjectId(parentIdStr) : null;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newFolder = {
      name,
      parentId,
      isCollaborative: !!isCollaborative,
      ownerId: (session.user as any).id,
      ownerName: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("drive_folders").insertOne(newFolder);

    return NextResponse.json({ success: true, folderId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Drive API POST Folder Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
