import imageCompression from "browser-image-compression";

/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพ (เปลี่ยนมาใช้ Local Storage บน Lenovo Server)
 */
/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพ/วิดีโอ (รองรับ Progress)
 */
export const uploadFile = async (
  file: File,
  folder: string = "uploads",
  onProgress?: (percent: number, loaded: number, total: number) => void
): Promise<{ secure_url: string | null; thumbnail_url: string | null }> => {
  // Client-side pre-checks using public env vars (NEXT_PUBLIC_*)
  const MAX_IMAGE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE) || 200 * 1024 * 1024;
  
  let fileToUpload = file;
  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
  const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);
  const isCompressibleImage = isImage && !isGif && !file.type?.includes("svg");

  // Only compress images that are not GIFs or SVGs
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

  // เตรียมข้อมูลสำหรับส่งไป API
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("folder", folder);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open("POST", "/api/upload", true);

    // ติดตามสถานะการอัปโหลด
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent, e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            resolve({ secure_url: data.secure_url, thumbnail_url: data.thumbnail_url });
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

    xhr.onerror = () => {
      console.error("❌ Network/Upload error");
      resolve({ secure_url: null, thumbnail_url: null });
    };

    xhr.send(formData);
  });
};

// Alias สำหรับโค้ดเก่า
export const uploadToCloudinary = uploadFile;
