import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

async function deletePhysicalFile(fileUrl: string) {
  try {
    if (!fileUrl || !fileUrl.startsWith("/api/media/")) return;
    const pathPart = fileUrl.replace("/api/media/", "");
    const cleanPath = pathPart.split('?')[0]; // Remove query params if any
    const pathSegments = cleanPath.split("/");
    
    const localBase = join(process.cwd(), 'public');
    const filePath = join(localBase, ...pathSegments);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error("Failed to delete physical file:", fileUrl, error);
  }
}

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
    // Permission check: only Owner or Super Admin / Admin -> Allowed
    const isOwnerOrAdmin = item.ownerId === userId || ["super_admin", "admin"].includes(userRole);

    if (!isOwnerOrAdmin) {
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
    // Permission check: only Owner or Super Admin / Admin -> Allowed
    const isOwnerOrAdmin = item.ownerId === userId || ["super_admin", "admin"].includes(userRole);

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "No permission to delete this item" }, { status: 403 });
    }

    if (type === "folder") {
      // Recursive deletion of sub-folders and files
      await deleteFolderRecursive(db, new ObjectId(id));
    } else {
      if (item.url) await deletePhysicalFile(item.url);
      if (item.thumbnailUrl) await deletePhysicalFile(item.thumbnailUrl);
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

  // Find files in this folder to delete physically
  const filesToDelete = await db.collection("drive_files").find({ folderId }).toArray();
  for (const file of filesToDelete) {
    if (file.url) await deletePhysicalFile(file.url);
    if (file.thumbnailUrl) await deletePhysicalFile(file.thumbnailUrl);
  }

  // Delete files in this folder from DB
  await db.collection("drive_files").deleteMany({ folderId });

  // Delete the folder itself
  await db.collection("drive_folders").deleteOne({ _id: folderId });
}
