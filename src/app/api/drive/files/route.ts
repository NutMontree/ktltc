import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function isCollaborativeOrDescendant(db: any, folderId: ObjectId | null): Promise<boolean> {
  if (!folderId) return false;
  const folder = await db.collection("drive_folders").findOne({ _id: folderId });
  if (!folder) return false;
  if (folder.isCollaborative) return true;
  if (folder.parentId) {
    return isCollaborativeOrDescendant(db, folder.parentId);
  }
  return false;
}

// --- POST: Save file metadata ---
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, url, thumbnailUrl, folderId: folderIdStr, size, type } = await request.json();
    if (!name || !url) return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });

    const folderId = folderIdStr && folderIdStr !== "null" ? new ObjectId(folderIdStr) : null;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const userRole = (session?.user as any)?.role?.toLowerCase();
    const isStaff = !["user", "student"].includes(userRole || "");
    if (!isStaff) {
      return NextResponse.json({ error: "No permission to upload files" }, { status: 403 });
    }

    // Permission check for target folder
    if (folderId) {
      const parentFolder = await db.collection("drive_folders").findOne({ _id: folderId });
      if (!parentFolder) return NextResponse.json({ error: "Target folder not found" }, { status: 404 });
      
      const isAdmin = ["super_admin", "admin"].includes(userRole);
      const userId = (session.user as any).id;

      // Check if target folder or any ancestor is collaborative
      const isFolderShared = await isCollaborativeOrDescendant(db, folderId);

      if (!isAdmin && parentFolder.ownerId !== userId && !isFolderShared) {
        return NextResponse.json({ error: "No permission to upload files to this folder" }, { status: 403 });
      }
    }

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
