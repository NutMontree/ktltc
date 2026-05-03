import imageCompression from "browser-image-compression";

/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพ (เปลี่ยนมาใช้ Local Storage บน Lenovo Server)
 */
export const uploadFile = async (
  file: File,
  folder: string = "uploads", // ค่า Default ถ้าไม่ระบุโฟลเดอร์
): Promise<string | null> => {
  // Client-side pre-checks using public env vars (NEXT_PUBLIC_*)
  const MAX_IMAGE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE) || 200 * 1024 * 1024;
  // ✅ บีบอัดรูปภาพก่อนอัปโหลด (ยกเว้น GIF)
  let fileToUpload = file;
  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
  const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);

  if (!isImage && !isVideo) {
    console.error("Unsupported file type:", file.type, file.name);
    return null;
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    console.error("Image file too large:", file.name, file.size);
    return null;
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    console.error("Video file too large:", file.name, file.size);
    return null;
  }

  // Skip image compression for GIFs and videos
  if (!isGif && !isVideo) {
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    } catch (compressionError) {
      console.error("❌ Image compression error:", compressionError);
    }
  }

  // เตรียมข้อมูลสำหรับส่งไป API ของเราเอง
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("folder", folder);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      console.error("❌ Local Upload Error:", data.message);
      return null;
    }

    // ส่งคืน URL ของรูปภาพ (ซึ่งจะเป็นพาธในเครื่อง เช่น /uploads/xxx.jpg)
    return data.secure_url;
  } catch (error) {
    console.error("❌ Network/Upload error:", error);
    return null;
  }
};

// Alias สำหรับโค้ดเก่าที่ยังเรียกใช้ชื่อเดิม
export const uploadToCloudinary = uploadFile;
