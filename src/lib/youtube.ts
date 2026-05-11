/**
 * youtube.ts: ไฟล์ตัวช่วยสำหรับจัดการและแปลงลิงก์ YouTube
 * 
 * หน้าที่: 
 * - รับค่าจากผู้ใช้ (อาจเป็นลิงก์ปกติ, Shorts, Live หรือ Code iframe)
 * - สกัดเอา Video ID ออกมา
 * - สร้าง URL สำหรับ Embed (ฝังวิดีโอ) ที่ปลอดภัย (nocookie) และไม่มีพารามิเตอร์ติดตาม (Tracking)
 */

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

// URL พื้นฐานสำหรับการฝังวิดีโอแบบไม่ใช้คุกกี้ (เพื่อความส่วนตัวและลดการติดตาม)
const YOUTUBE_EMBED_BASE_URL = "https://www.youtube-nocookie.com/embed/";

export type YouTubeEmbedResult = {
  ok: boolean;
  input: string;
  videoId?: string;
  iframeSrc?: string;
  iframeHtml?: string;
  error?: string;
};

// รายการพารามิเตอร์ที่ไม่จำเป็นและควรลบทิ้งเพื่อความสะอาดของลิงก์
const TRACKING_PARAMS = ["si", "feature", "pp", "t", "list"];

/**
 * buildIframeHtml: สร้าง Tag <iframe> สำหรับนำไปแสดงผลบนหน้าเว็บ
 */
function buildIframeHtml(iframeSrc: string) {
  return `<iframe src="${iframeSrc}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

/**
 * extractIframeSrc: ดึงค่า URL จากแอตทริบิวต์ src ใน Tag iframe
 */
function extractIframeSrc(input: string) {
  const srcMatch = input.match(/src=(['"])(.*?)\1/i);
  return srcMatch?.[2]?.trim() || null;
}

/**
 * extractFirstUrl: ค้นหา URL แรกที่พบในข้อความ
 */
function extractFirstUrl(input: string) {
  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch?.[0] || null;
}

/**
 * extractVideoId: ตรรกะการดึง Video ID จาก URL รูปแบบต่างๆ
 */
function extractVideoId(url: URL) {
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname;

  // กรณีลิงก์แบบย่อ youtu.be/ID
  if (host === "youtu.be" || host === "www.youtu.be") {
    return pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  // กรณีลิงก์ปกติ youtube.com/watch?v=ID
  if (pathname.startsWith("/watch")) {
    return url.searchParams.get("v");
  }

  // กรณีลิงก์แบบ embed youtube.com/embed/ID
  if (pathname.startsWith("/embed/")) {
    return pathname.split("/")[2] || null;
  }

  // กรณีลิงก์ Shorts youtube.com/shorts/ID
  if (pathname.startsWith("/shorts/")) {
    return pathname.split("/")[2] || null;
  }

  // กรณีลิงก์ Live youtube.com/live/ID
  if (pathname.startsWith("/live/")) {
    return pathname.split("/")[2] || null;
  }

  return null;
}

/**
 * normalizeVideoId: ตรวจสอบความถูกต้องของ Video ID (ต้องเป็นตัวอักษร/ตัวเลข และมีความยาวที่เหมาะสม)
 */
function normalizeVideoId(videoId: string | null) {
  if (!videoId) return null;
  const cleaned = videoId.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(cleaned) ? cleaned : null;
}

/**
 * parseYouTubeVideoInput: ฟังก์ชันหลักที่ส่งออกไปใช้งาน
 * รับ input จากผู้ใช้แล้วคืนค่าเป็นออบเจกต์ที่มีข้อมูล Video ID และ Iframe HTML
 */
export function parseYouTubeVideoInput(
  rawInput: string,
): YouTubeEmbedResult {
  const input = rawInput.trim();

  if (!input) {
    return {
      ok: false,
      input,
      error: "กรุณาวางลิงก์หรือ iframe ของ YouTube ก่อน",
    };
  }

  // พยายามดึง URL ออกมาจาก input (เผื่อผู้ใช้ก๊อปโค้ด iframe มาวางทั้งหมด)
  const candidate = input.includes("<iframe")
    ? extractIframeSrc(input)
    : extractFirstUrl(input) || input;

  if (!candidate) {
    return {
      ok: false,
      input,
      error: "ไม่พบ URL ที่ใช้แปลงเป็น YouTube embed",
    };
  }

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    return {
      ok: false,
      input,
      error: "ลิงก์ไม่ถูกต้อง",
    };
  }

  // ล้างพารามิเตอร์ติดตามทิ้ง
  TRACKING_PARAMS.forEach((key) => url.searchParams.delete(key));

  const videoId = normalizeVideoId(extractVideoId(url));

  if (!videoId) {
    return {
      ok: false,
      input,
      error: "ลิงก์นี้ยังไม่ใช่รูปแบบวิดีโอ YouTube ที่รองรับ",
    };
  }

  const iframeSrc = `${YOUTUBE_EMBED_BASE_URL}${videoId}`;

  return {
    ok: true,
    input,
    videoId,
    iframeSrc,
    iframeHtml: buildIframeHtml(iframeSrc),
  };
}

