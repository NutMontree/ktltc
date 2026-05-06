import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// --- GET: List folders and files in a specific directory ---
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session?.user as any)?.role?.toLowerCase();
    const { searchParams } = new URL(request.url);
    const parentIdStr = searchParams.get("parentId");
    const parentId = parentIdStr && parentIdStr !== "null" ? new ObjectId(parentIdStr) : null;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Define access filter based on role
    const isAdmin = !["user", "student"].includes(userRole);
    const userId = (session.user as any).id;

    // Check if parent folder is collaborative
    let isCurrentFolderCollaborative = false;
    if (parentId) {
      const currentFolder = await db.collection("drive_folders").findOne({ _id: parentId });
      if (currentFolder?.isCollaborative) {
        isCurrentFolderCollaborative = true;
      }
    }

    const baseFilter = isAdmin 
      ? { parentId } 
      : { 
          parentId, 
          $or: [
            { ownerId: userId },
            { isCollaborative: true }
          ]
        };

    const fileFilter = (isAdmin || isCurrentFolderCollaborative)
      ? { folderId: parentId }
      : { folderId: parentId, ownerId: userId };

    // Fetch Folders
    const folders = await db.collection("drive_folders")
      .find(baseFilter)
      .sort({ name: 1 })
      .toArray();

    // Fetch Files
    const files = await db.collection("drive_files")
      .find(fileFilter)
      .sort({ name: 1 })
      .toArray();

    // Fetch All Folders (for move picker - limited to owned/collab for users)
    const allFolders = await db.collection("drive_folders")
      .find(isAdmin ? {} : { $or: [{ ownerId: userId }, { isCollaborative: true }] })
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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, parentId: parentIdStr, isCollaborative } = await request.json();
    if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

    const parentId = parentIdStr && parentIdStr !== "null" ? new ObjectId(parentIdStr) : null;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Permission check for parent folder
    if (parentId) {
      const parentFolder = await db.collection("drive_folders").findOne({ _id: parentId });
      if (!parentFolder) return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
      
      const userRole = (session?.user as any)?.role?.toLowerCase();
      const isAdmin = !["user", "student"].includes(userRole);
      const userId = (session.user as any).id;

      if (!isAdmin && parentFolder.ownerId !== userId && !parentFolder.isCollaborative) {
        return NextResponse.json({ error: "No permission to create items in this folder" }, { status: 403 });
      }
    }

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
