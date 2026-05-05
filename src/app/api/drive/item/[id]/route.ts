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

    if (!session || ["user", "student"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, type } = await request.json(); // type: 'file' | 'folder'
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collectionName = type === "folder" ? "drive_folders" : "drive_files";

    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Permission check: Owner or Super Admin
    if (item.ownerId !== userId && userRole !== "super_admin") {
      return NextResponse.json({ error: "No permission to rename this item" }, { status: 403 });
    }

    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, updatedAt: new Date() } }
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

    if (!session || ["user", "student"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'file' | 'folder'

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collectionName = type === "folder" ? "drive_folders" : "drive_files";

    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Permission check: Owner or Super Admin
    if (item.ownerId !== userId && userRole !== "super_admin") {
      return NextResponse.json({ error: "No permission to delete this item" }, { status: 403 });
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
