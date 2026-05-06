import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// --- PATCH: Rename item ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    const userId = (session?.user as any)?.id;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, newParentId, isCollaborative } = await request.json(); // type: 'file' | 'folder'
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collectionName = type === "folder" ? "drive_folders" : "drive_files";

    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Check for collaborative context
    let isCollaborativeContext = false;
    if (type === "folder" && item.isCollaborative) {
      isCollaborativeContext = true;
    } else if (type === "file" && item.folderId) {
      const parentFolder = await db.collection("drive_folders").findOne({ _id: new ObjectId(item.folderId) });
      if (parentFolder?.isCollaborative) {
        isCollaborativeContext = true;
      }
    }

    // Permission check:
    // 1. Owner or Super Admin -> Always allowed
    // 2. Collaborative context -> Allowed for everyone EXCEPT students
    const isOwnerOrAdmin = item.ownerId === userId || ["super_admin", "admin"].includes(userRole);
    const canCollaborate = isCollaborativeContext && userRole !== "student";

    if (!isOwnerOrAdmin && !canCollaborate) {
      return NextResponse.json({ error: "No permission to modify this item" }, { status: 403 });
    }

    // SECURITY: Only Owner or Admin can change 'isCollaborative' status
    if (isCollaborative !== undefined && !isOwnerOrAdmin) {
      return NextResponse.json({ error: "Only the owner can change sharing settings" }, { status: 403 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (isCollaborative !== undefined && type === "folder") updateData.isCollaborative = isCollaborative;
    
    // Handle Moving
    if (newParentId !== undefined) {
      const parentId = newParentId === "null" || !newParentId ? null : new ObjectId(newParentId);
      
      // Prevent moving a folder into itself or its children
      if (type === "folder" && parentId) {
        if (parentId.toString() === id) {
          return NextResponse.json({ error: "Cannot move a folder into itself" }, { status: 400 });
        }
      }
      
      if (type === "folder") {
        updateData.parentId = parentId;
      } else {
        updateData.folderId = parentId;
      }
    }

    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drive API PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- DELETE: Remove item ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    const userId = (session?.user as any)?.id;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'file' | 'folder'

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collectionName = type === "folder" ? "drive_folders" : "drive_files";

    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Check for collaborative context
    let isCollaborativeContext = false;
    if (type === "folder" && item.isCollaborative) {
      isCollaborativeContext = true;
    } else if (type === "file" && item.folderId) {
      const parentFolder = await db.collection("drive_folders").findOne({ _id: new ObjectId(item.folderId) });
      if (parentFolder?.isCollaborative) {
        isCollaborativeContext = true;
      }
    }

    // Permission check:
    // 1. Owner or Super Admin -> Always allowed
    // 2. Collaborative context -> Allowed for everyone EXCEPT students
    const isOwnerOrAdmin = item.ownerId === userId || ["super_admin", "admin"].includes(userRole);
    const canCollaborate = isCollaborativeContext && userRole !== "student";

    if (!isOwnerOrAdmin && !canCollaborate) {
      return NextResponse.json({ error: "No permission to modify this item" }, { status: 403 });
    }

    if (type === "folder") {
      // Recursive deletion of sub-folders and files
      await deleteFolderRecursive(db, new ObjectId(id));
    } else {
      await db.collection("drive_files").deleteOne({ _id: new ObjectId(id) });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drive API DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper for recursive deletion
async function deleteFolderRecursive(db: any, folderId: ObjectId) {
  // Find sub-folders
  const subFolders = await db.collection("drive_folders").find({ parentId: folderId }).toArray();
  for (const sub of subFolders) {
    await deleteFolderRecursive(db, sub._id);
  }

  // Delete files in this folder
  await db.collection("drive_files").deleteMany({ folderId });

  // Delete the folder itself
  await db.collection("drive_folders").deleteOne({ _id: folderId });
}
