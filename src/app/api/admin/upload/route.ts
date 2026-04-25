// src\app\api\admin\upload\route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// ✅ Config Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user as any).role ||
      !["super_admin", "admin", "editor"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let imageToUpload: string | Buffer | undefined;
    let folder = "uploads";

    if (contentType.includes("application/json")) {
      const { image, folder: targetFolder } = await req.json();
      imageToUpload = image;
      if (targetFolder) folder = targetFolder;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        imageToUpload = Buffer.from(bytes);
      }
      const targetFolder = formData.get("folder") as string;
      if (targetFolder) folder = targetFolder;
    }

    if (!imageToUpload) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ✅ Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ktltc/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      if (Buffer.isBuffer(imageToUpload)) {
        uploadStream.end(imageToUpload);
      } else {
        // If it's a base64 string
        cloudinary.uploader.upload(imageToUpload as string, {
          folder: `ktltc/${folder}`,
          resource_type: "auto",
        }).then(resolve).catch(reject);
      }
    });

    const result = uploadResponse as any;

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      imageUrl: result.secure_url, // for backward compatibility
      message: "อัปโหลดเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "การอัปโหลดล้มเหลว" },
      { status: 500 },
    );
  }
}
