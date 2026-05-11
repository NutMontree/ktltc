/**
 * facebook.ts: ไฟล์ตัวช่วยสำหรับจัดการและแปลงลิงก์วิดีโอ Facebook
 * 
 * หน้าที่: 
 * - รับค่าลิงก์วิดีโอ Facebook, Reels หรือโค้ด Iframe
 * - ทำความสะอาด URL (ลบพารามิเตอร์ติดตาม)
 * - แปลงเป็นรูปแบบ URL สำหรับ Plugin วิดีโอของ Facebook เพื่อนำไปฝังในหน้าเว็บ
 */

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
  "web.facebook.com",
  "fb.watch",
]);

// รูปแบบ Path ของ Facebook ที่ระบุว่าเป็นวิดีโอ
const FACEBOOK_VIDEO_PATHS = ["/videos/", "/watch/", "/reel/", "/share/v/"];
const EMBED_BASE_URL = "https://www.facebook.com/plugins/video.php";

export type FacebookEmbedResult = {
  ok: boolean;
  input: string;
  normalizedUrl?: string;
  iframeSrc?: string;
  iframeHtml?: string;
  warning?: string;
  error?: string;
};

// พารามิเตอร์ของ Facebook ที่มักติดมากับการแชร์และควรลบทิ้ง
const TRACKING_PARAMS = [
  "fbclid",
  "mibextid",
  "rdid",
  "share_url",
  "sfnsn",
  "refsrc",
];

/**
 * normalizeFacebookUrl: ปรับแต่ง URL ให้เป็นมาตรฐานเดียวกัน
 */
function normalizeFacebookUrl(url: URL) {
  const normalized = new URL(url.toString());

  // กรณีลิงก์ย่อ fb.watch ให้คงไว้ตามเดิมเพื่อให้ Facebook จัดการต่อ
  if (normalized.hostname === "fb.watch") {
    return normalized.toString();
  }

  normalized.protocol = "https:";
  normalized.hostname = "www.facebook.com";

  // ลบพารามิเตอร์ขยะ
  TRACKING_PARAMS.forEach((key) => normalized.searchParams.delete(key));

  if (!normalized.pathname.endsWith("/")) {
    normalized.pathname = `${normalized.pathname}/`;
  }

  return normalized.toString();
}

/**
 * buildIframeHtml: สร้าง Tag <iframe> สำหรับวิดีโอ Facebook
 */
function buildIframeHtml(iframeSrc: string) {
  return `<iframe src="${iframeSrc}" width="560" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
}

/**
 * extractIframeSrc: ดึงค่า src จากโค้ด iframe
 */
function extractIframeSrc(input: string) {
  const srcMatch = input.match(/src=(['"])(.*?)\1/i);
  return srcMatch?.[2]?.trim() || null;
}

/**
 * extractFirstUrl: ค้นหา URL แรกในข้อความ
 */
function extractFirstUrl(input: string) {
  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch?.[0] || null;
}

/**
 * isFacebookUrl: ตรวจสอบว่าเป็นโดเมนของ Facebook หรือไม่
 */
function isFacebookUrl(url: URL) {
  return FACEBOOK_HOSTS.has(url.hostname.toLowerCase());
}

/**
 * looksLikeFacebookVideo: ตรวจสอบเบื้องต้นจาก Path ว่าน่าจะเป็นวิดีโอหรือไม่
 */
function looksLikeFacebookVideo(url: URL) {
  const pathname = url.pathname.toLowerCase();
  return FACEBOOK_VIDEO_PATHS.some((segment) => pathname.includes(segment));
}

/**
 * parseFacebookVideoInput: ฟังก์ชันหลักสำหรับแปลง Input เป็นข้อมูลสำหรับฝังวิดีโอ
 */
export function parseFacebookVideoInput(
  rawInput: string,
): FacebookEmbedResult {
  const input = rawInput.trim();

  if (!input) {
    return {
      ok: false,
      input,
      error: "กรุณาวางลิงก์หรือ iframe ของ Facebook ก่อน",
    };
  }

  const candidate = input.includes("<iframe")
    ? extractIframeSrc(input)
    : extractFirstUrl(input) || input;

  if (!candidate) {
    return {
      ok: false,
      input,
      error: "ไม่พบ URL ที่ใช้แปลงเป็น Facebook embed",
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

  // กรณีส่งลิงก์ที่เป็น embed มาอยู่แล้ว
  if (url.pathname.toLowerCase().includes("/plugins/video.php")) {
    const iframeSrc = url.toString();
    return {
      ok: true,
      input,
      normalizedUrl: url.searchParams.get("href") || iframeSrc,
      iframeSrc,
      iframeHtml: buildIframeHtml(iframeSrc),
    };
  }

  if (!isFacebookUrl(url)) {
    return {
      ok: false,
      input,
      error: "ลิงก์นี้ไม่ใช่ Facebook video URL",
    };
  }

  const normalizedUrl = normalizeFacebookUrl(url);

  // ตรวจสอบว่าหลังจากทำความสะอาดแล้ว ยังเป็นวิดีโออยู่ไหม
  if (!looksLikeFacebookVideo(new URL(normalizedUrl))) {
    return {
      ok: false,
      input,
      error: "ลิงก์นี้ยังไม่ใช่รูปแบบวิดีโอ Facebook ที่รองรับ",
    };
  }

  // สร้าง URL สำหรับใช้งานกับ Facebook Video Plugin
  const iframeSrc = `${EMBED_BASE_URL}?href=${encodeURIComponent(normalizedUrl)}&show_text=0&width=560`;
  
  // แจ้งเตือนเพิ่มเติมกรณีเป็นลิงก์แชร์ส่วนตัว
  const warning = normalizedUrl.includes("/share/v/")
    ? "ลิงก์ share/v ถูกแปลงแบบ best-effort แล้ว แต่บางโพสต์อาจต้องใช้ลิงก์วิดีโอจริงหรือวิดีโอ Public จึงจะแสดงได้"
    : undefined;

  return {
    ok: true,
    input,
    normalizedUrl,
    iframeSrc,
    iframeHtml: buildIframeHtml(iframeSrc),
    warning,
  };
}

