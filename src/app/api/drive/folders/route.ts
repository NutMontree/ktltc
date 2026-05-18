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

// --- GET: List folders and files in a specific directory ---
export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    const userId = (session?.user as any)?.id;
    const { searchParams } = new URL(request.url);
    const parentIdStr = searchParams.get("parentId");
    const parentId = parentIdStr && parentIdStr !== "null" ? new ObjectId(parentIdStr) : null;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Self-healing database check for the public academic/research folder
    if ((parentIdStr === "6a0a90990f09681854ea47d6" || parentIdStr === "6a0a91550f09681854ea47d7") && parentId) {
      const publicFolder = await db.collection("drive_folders").findOne({ _id: parentId });
      if (!publicFolder) {
        await db.collection("drive_folders").insertOne({
          _id: parentId,
          name: parentIdStr === "6a0a90990f09681854ea47d6" ? "เผยแพร่ผลงานวิจัย/วิชาการ" : "คลังเอกสารเผยแพร่",
          isCollaborative: true,
          parentId: null,
          ownerId: "system",
          ownerName: "ระบบ",
          createdAt: new Date(),
          updatedAt: new Date(),
          views: 0,
        });
      } else if (!publicFolder.isCollaborative) {
        await db.collection("drive_folders").updateOne(
          { _id: parentId },
          { $set: { isCollaborative: true } }
        );
      }
    }

    const isStaff = !!(session && !["user", "student"].includes(userRole || ""));
    const isAdmin = !!(session && ["super_admin", "admin"].includes(userRole || ""));

    // Check if the current parent folder is collaborative or a descendant of one
    const isSharedAccess = parentId ? await isCollaborativeOrDescendant(db, parentId) : false;

    // If they are not staff, they are only allowed if they are viewing a collaborative/shared folder
    if (!isStaff && !isSharedAccess) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check if parent folder is collaborative (directly)
    let isCurrentFolderCollaborative = false;
    let currentFolder = null;
    if (parentId) {
      currentFolder = await db.collection("drive_folders").findOne({ _id: parentId });
      if (currentFolder?.isCollaborative) {
        isCurrentFolderCollaborative = true;
      }
    }

    const baseFilter = (isStaff && isAdmin)
      ? { parentId } 
      : (isStaff || isSharedAccess)
      ? { parentId }
      : { 
          parentId, 
          $or: [
            { ownerId: userId },
            { isCollaborative: true }
          ]
        };
 
    const fileFilter = (isStaff && (isAdmin || isCurrentFolderCollaborative))
      ? { folderId: parentId }
      : (isStaff || isSharedAccess)
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

    // Fetch All Folders (only for staff, for move picker)
    const allFolders = isStaff
      ? await db.collection("drive_folders")
          .find(isAdmin ? {} : { $or: [{ ownerId: userId }, { isCollaborative: true }] })
          .project({ _id: 1, name: 1, parentId: 1 })
          .toArray()
      : [];

    return NextResponse.json({ folders, files, allFolders, currentFolder });
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

    const userRole = (session?.user as any)?.role?.toLowerCase();
    const isStaff = !["user", "student"].includes(userRole || "");
    if (!isStaff) return NextResponse.json({ error: "No permission to create folders" }, { status: 403 });

    const { name, parentId: parentIdStr, isCollaborative } = await request.json();
    if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

    const parentId = parentIdStr && parentIdStr !== "null" ? new ObjectId(parentIdStr) : null;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Permission check for parent folder
    if (parentId) {
      const parentFolder = await db.collection("drive_folders").findOne({ _id: parentId });
      if (!parentFolder) return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
      
      const isAdmin = ["super_admin", "admin"].includes(userRole);
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
