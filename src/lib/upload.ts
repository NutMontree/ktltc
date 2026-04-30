import imageCompression from "browser-image-compression";

/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพ (เปลี่ยนมาใช้ Local Storage บน Lenovo Server)
 */
export const uploadFile = async (
  file: File,
  folder: string = "uploads", // ค่า Default ถ้าไม่ระบุโฟลเดอร์
): Promise<string | null> => {
  // ✅ บีบอัดรูปภาพก่อนอัปโหลด (ยกเว้น GIF)
  let fileToUpload = file;
  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");

  if (!isGif) {
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
