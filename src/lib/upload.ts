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
): Promise<string | null> => {
  // Client-side pre-checks using public env vars (NEXT_PUBLIC_*)
  const MAX_IMAGE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE) || 200 * 1024 * 1024;
  
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
            resolve(data.secure_url);
          } else {
            console.error("❌ Local Upload Error:", data.message);
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };

    xhr.onerror = () => {
      console.error("❌ Network/Upload error");
      resolve(null);
    };

    xhr.send(formData);
  });
};

// Alias สำหรับโค้ดเก่า
export const uploadToCloudinary = uploadFile;
