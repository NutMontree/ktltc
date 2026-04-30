// src\app\api\admin\upload\route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFileLocally } from "@/lib/upload-server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    
    if (
      !session ||
      !["super_admin", "admin", "editor"].includes(userRole)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let dataToUpload: string | Buffer | undefined;
    let folder = "uploads";

    if (contentType.includes("application/json")) {
      const { image, folder: targetFolder } = await req.json();
      dataToUpload = image;
      if (targetFolder) folder = targetFolder;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        dataToUpload = Buffer.from(bytes);
      }
      const targetFolder = formData.get("folder") as string;
      if (targetFolder) folder = targetFolder;
    }

    if (!dataToUpload) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ✅ Save to Local Storage
    const secure_url = await saveFileLocally(dataToUpload, folder, "admin-upload");

    if (!secure_url) {
      throw new Error("Failed to save file locally");
    }

    return NextResponse.json({
      success: true,
      url: secure_url,
      imageUrl: secure_url, // for backward compatibility
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
