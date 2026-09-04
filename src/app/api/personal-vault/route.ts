import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVaultCollection } from "@/models/VaultItem";
import { encrypt, decrypt } from "@/lib/encryption";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const viewAll = searchParams.get("viewAll") === "true";
    const vaultCol = await getVaultCollection();
    
    let folders = [];

  if (viewAll && session.user.role?.toLowerCase() === "super_admin") {
      // ดึงทั้งหมดและ Join กับตาราง users เพื่อเอาชื่อเจ้าของ
      folders = await vaultCol.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "owner"
          }
        },
        {
          $unwind: {
            path: "$owner",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            ownerName: "$owner.name",
            ownerEmail: "$owner.email"
          }
        },
        {
          $project: {
            owner: 0 // ไม่ต้องส่ง object owner กลับไปเต็มๆ
          }
        }
      ]).toArray();
    } else {
      folders = await vaultCol.find({ userId: new ObjectId(session.user.id) }).sort({ createdAt: -1 }).toArray();
    }

    // กรองเอาเฉพาะข้อมูลที่เป็นแฟ้มจริงๆ (ข้ามของเก่าที่ไม่มี credentials) และถอดรหัส
    const decryptedFolders = folders
      .filter((folder: any) => folder.folderName)
      .map((folder: any) => ({
        ...folder,
        credentials: (folder.credentials || []).map((cred: any) => ({
          ...cred,
          password: decrypt(cred.encryptedPassword),
          encryptedPassword: undefined
        }))
      }));

    return NextResponse.json({ success: true, folders: decryptedFolders });
  } catch (error) {
    console.error("Vault GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST สำหรับสร้าง Folder ใหม่
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderName } = await req.json();
    if (!folderName) {
      return NextResponse.json({ error: "Missing folderName" }, { status: 400 });
    }

    const vaultCol = await getVaultCollection();
    const result = await vaultCol.insertOne({
      userId: new ObjectId(session.user.id),
      folderName,
      credentials: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Vault POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT สำหรับเพิ่มข้อมูล Credential เข้าไปใน Folder
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderId, title, username, password } = await req.json();

    if (!folderId || !title || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encryptedPassword = encrypt(password);
    if (!encryptedPassword) {
      return NextResponse.json({ error: "Encryption failed" }, { status: 500 });
    }

    const vaultCol = await getVaultCollection();
    const result = await vaultCol.updateOne(
      { _id: new ObjectId(folderId), userId: new ObjectId(session.user.id) },
      {
        $push: {
          credentials: {
            id: randomUUID(),
            title,
            username,
            encryptedPassword,
            createdAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vault PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH สำหรับแก้ไขข้อมูล Credential ภายใน Folder
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderId, credId, title, username, password, folderName } = await req.json();

    const vaultCol = await getVaultCollection();

    // กรณีแก้ไขชื่อโฟลเดอร์
    if (folderName && !credId) {
      const result = await vaultCol.updateOne(
        { _id: new ObjectId(folderId), userId: new ObjectId(session.user.id) },
        { $set: { folderName, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    // กรณีแก้ไข Credential
    if (!folderId || !credId || !title || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encryptedPassword = encrypt(password);
    if (!encryptedPassword) {
      return NextResponse.json({ error: "Encryption failed" }, { status: 500 });
    }

    const result = await vaultCol.updateOne(
      { 
        _id: new ObjectId(folderId), 
        userId: new ObjectId(session.user.id),
        "credentials.id": credId 
      },
      {
        $set: { 
          "credentials.$.title": title,
          "credentials.$.username": username,
          "credentials.$.encryptedPassword": encryptedPassword,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Credential not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vault PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE รองรับ 2 โหมด: ลบ Folder (มีแต่ id) หรือลบ Credential (มี id และ credId)
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // folderId
    const credId = searchParams.get("credId");

    if (!id) {
      return NextResponse.json({ error: "Missing folder ID" }, { status: 400 });
    }

    const vaultCol = await getVaultCollection();
    
    if (credId) {
      // โหมด 2: ลบเฉพาะ credential ใน array
      const result = await vaultCol.updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
        { 
          $pull: { credentials: { id: credId } },
          $set: { updatedAt: new Date() } 
        }
      );
      if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else {
      // โหมด 1: ลบทั้งโฟลเดอร์
      const result = await vaultCol.deleteOne({ 
        _id: new ObjectId(id),
        userId: new ObjectId(session.user.id)
      });
      if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vault DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
