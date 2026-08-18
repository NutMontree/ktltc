import imageCompression from "browser-image-compression";

/**
 * upload.ts: ไฟล์ตัวช่วยสำหรับจัดการการอัปโหลดไฟล์จากฝั่ง Client
 * 
 * หน้าที่: 
 * 1. บีบอัดรูปภาพก่อนอัปโหลด (Safety net — บาง Page บีบอัดเองแล้ว บางที่ยังไม่ได้บีบ)
 * 2. ส่งไฟล์ไปยัง API /api/upload ของ Server
 * 3. ติดตามสถานะความคืบหน้า (Progress) การอัปโหลด
 */

/**
 * uploadFile: ฟังก์ชันหลักสำหรับอัปโหลดไฟล์
 * @param file ไฟล์ที่ต้องการอัปโหลด
 * @param folder โฟลเดอร์ปลายทาง (ค่าเริ่มต้นคือ uploads)
 * @param onProgress Callback ฟังก์ชันสำหรับติดตามสถานะ (%)
 */
export const uploadFile = async (
  file: File,
  folder: string = "uploads",
  onProgress?: (percent: number, loaded: number, total: number) => void
): Promise<{ secure_url: string | null; thumbnail_url: string | null }> => {
  
  let fileToUpload = file;
  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
  const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);
  const isCompressibleImage = isImage && !isGif && !file.type?.includes("svg");

  // 1. บีบอัดรูปภาพ (Safety net สำหรับ caller ที่ไม่ได้บีบอัดเอง)
  // ถ้าไฟล์เล็กกว่า maxSizeMB อยู่แล้ว lib จะ skip ไม่ทำอะไร — ไม่เสียเวลาซ้ำ
  if (isCompressibleImage) {
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

  // 2. เตรียมข้อมูลสำหรับส่งไป API
  const finalFile = fileToUpload instanceof File && fileToUpload.name !== "blob" 
    ? fileToUpload 
    : new File([fileToUpload], file.name, { type: file.type });
  
  const formData = new FormData();
  formData.append("file", finalFile);
  formData.append("folder", folder);

  // ใช้ XMLHttpRequest แทน fetch เพื่อให้สามารถติดตาม Progress ได้
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open("POST", "/api/upload", true);

    // 3. ติดตามสถานะการอัปโหลด (Upload Progress)
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent, e.loaded, e.total);
        }
      };
    }

    // เมื่ออัปโหลดเสร็จสิ้น
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            resolve({ secure_url: data.secure_url || data.url, thumbnail_url: data.thumbnail_url || data.url });
          } else {
            console.error("❌ Local Upload Error:", data.message);
            resolve({ secure_url: null, thumbnail_url: null });
          }
        } catch (e) {
          resolve({ secure_url: null, thumbnail_url: null });
        }
      } else {
        resolve({ secure_url: null, thumbnail_url: null });
      }
    };

    // กรณีเกิดข้อผิดพลาดทาง Network
    xhr.onerror = () => {
      console.error("❌ Network/Upload error");
      resolve({ secure_url: null, thumbnail_url: null });
    };

    xhr.send(formData);
  });
};

/**
 * Alias สำหรับรองรับโค้ดเก่าที่ยังเรียกชื่อ uploadToCloudinary
 * (ปัจจุบันระบบเปลี่ยนมาใช้ Local Storage แทน Cloudinary แล้ว)
 */
export const uploadToCloudinary = uploadFile;

