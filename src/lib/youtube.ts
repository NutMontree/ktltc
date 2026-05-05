const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const YOUTUBE_EMBED_BASE_URL = "https://www.youtube-nocookie.com/embed/";

export type YouTubeEmbedResult = {
  ok: boolean;
  input: string;
  videoId?: string;
  iframeSrc?: string;
  iframeHtml?: string;
  error?: string;
};

const TRACKING_PARAMS = ["si", "feature", "pp", "t", "list"];

function buildIframeHtml(iframeSrc: string) {
  return `<iframe src="${iframeSrc}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

function extractIframeSrc(input: string) {
  const srcMatch = input.match(/src=(['"])(.*?)\1/i);
  return srcMatch?.[2]?.trim() || null;
}

function extractFirstUrl(input: string) {
  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch?.[0] || null;
}

function extractVideoId(url: URL) {
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname;

  if (host === "youtu.be" || host === "www.youtu.be") {
    return pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  if (pathname.startsWith("/watch")) {
    return url.searchParams.get("v");
  }

  if (pathname.startsWith("/embed/")) {
    return pathname.split("/")[2] || null;
  }

  if (pathname.startsWith("/shorts/")) {
    return pathname.split("/")[2] || null;
  }

  if (pathname.startsWith("/live/")) {
    return pathname.split("/")[2] || null;
  }

  return null;
}

function normalizeVideoId(videoId: string | null) {
  if (!videoId) return null;
  const cleaned = videoId.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(cleaned) ? cleaned : null;
}

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
