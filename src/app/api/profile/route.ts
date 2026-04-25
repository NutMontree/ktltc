/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// ✅ Config Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }, // ✅ ดีมากครับ ช่วยลด Data Payload
    );

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (_error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  // ดึงชื่อจาก session หรือ fallback ไปที่ name ใน body
  const sessionUserName = session?.user?.name;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Profile Update Request Body:", body);
    const { name, username, email, phone, lineId, department, position, faction, description, password, image, coverImage, work, education, currentCity, hometown, relationship } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Check if user is super_admin to allow username update
    const currentUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const isSuperAdmin = currentUser?.role === "super_admin";

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are present in the body
    const fields = [
      'name', 'email', 'phone', 'lineId', 'department', 'position', 
      'faction', 'description', 'work', 'education', 'currentCity', 
      'hometown', 'relationship', 'program'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    console.log("Final Update Data:", updateData);

    if (isSuperAdmin && username) {
      const trimmedUsername = username.trim();
      const existingUser = await db.collection("users").findOne({ 
        username: { $regex: new RegExp(`^${trimmedUsername}$`, "i") },
        _id: { $ne: new ObjectId(userId) } 
      });
      if (!existingUser) {
        updateData.username = trimmedUsername;
      }
    }

    let logDetail = "อัปเดตข้อมูลส่วนตัว";

    // ✅ 1. Manage Profile Image
    if (image && image.startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "user_profiles",
          transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" },
          ], 
        });
        updateData.image = uploadResponse.secure_url;
        logDetail = "อัปเดตโปรไฟล์และเปลี่ยนรูปภาพใหม่";
      } catch (uploadError) {
        console.error("Cloudinary profile upload error:", uploadError);
      }
    }

    // ✅ 2. Manage Cover Image
    if (coverImage && coverImage.startsWith("data:image")) {
      try {
        const coverUploadResponse = await cloudinary.uploader.upload(coverImage, {
          folder: "user_covers",
          // Optimization for banner aspect ratio
          transformation: [
            { width: 1200, height: 400, crop: "fill" },
          ],
        });
        updateData.coverImage = coverUploadResponse.secure_url;
        logDetail += (logDetail.includes("อัปเดต") ? " และ" : "อัปเดต") + "ภาพหน้าปกใหม่";
      } catch (coverError) {
        console.error("Cloudinary cover upload error:", coverError);
      }
    }

    // ✅ 3. Manage Password
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      logDetail += " และเปลี่ยนรหัสผ่าน";
    }

    // ✅ 4. Update the user record
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    // ✅ 5. Record Activity Log
    try {
      await db.collection("logs").insertOne({
        userId: new ObjectId(userId),
        userName: name || sessionUserName || "User", 
        action: "UPDATE_PROFILE",
        details: logDetail,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      });
    } catch (logError) {
      console.error("Failed to record profile update log:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
      imageUrl: updateData.image,
      coverUrl: updateData.coverImage,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
