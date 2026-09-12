import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

function sanitizeForSpeech(raw: string): string {
  if (!raw) return "";
  let clean = raw;
  // Remove markdown code blocks
  clean = clean.replace(/```[\s\S]*?```/g, " โค้ดโปรแกรม ");
  // Remove inline code
  clean = clean.replace(/`([^`]+)`/g, "$1");
  // Remove links markdown [text](url) -> text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove markdown headings, bold, italic, bullets
  clean = clean.replace(/[#*_\-~>]/g, " ");
  // Remove URLs
  clean = clean.replace(/https?:\/\/\S+/gi, " ");
  // Remove excessive whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // Truncate to reasonable speaking length (first 650 chars is ideal for conversational voice)
  if (clean.length > 650) {
    clean = clean.slice(0, 650) + "...";
  }
  return clean;
}

async function getGoogleTTSBuffer(text: string): Promise<Buffer> {
  const words = text.split(/([\s,.\n!?]+)/);
  const chunks: string[] = [];
  let currentChunk = "";
  for (const w of words) {
    if ((currentChunk + w).length <= 140) {
      currentChunk += w;
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = w;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const url =
      "https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=" +
      encodeURIComponent(chunk);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const ab = await res.arrayBuffer();
      buffers.push(Buffer.from(ab));
    }
  }
  return Buffer.concat(buffers);
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.warn("[TTS] Request rejected: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text, voice = "th-TH-NiwatNeural" } = body;

    const speechText = sanitizeForSpeech(text);
    if (!speechText) {
      return NextResponse.json({ error: "No text to speak" }, { status: 400 });
    }

    console.log(`[TTS] Generating speech for voice "${voice}", text length: ${speechText.length}: "${speechText.slice(0, 50)}..."`);

    // Attempt 1: Microsoft Edge Neural TTS (Natural human voice)
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(
        voice,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
      );
      const { audioStream } = tts.toStream(speechText);

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("MsEdgeTTS timeout after 12s"));
        }, 12000);

        audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
        audioStream.on("end", () => {
          clearTimeout(timeout);
          resolve();
        });
        audioStream.on("error", (err: any) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length > 0) {
        console.log(`[TTS] MsEdgeTTS successfully generated ${audioBuffer.length} bytes`);
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch (edgeErr: any) {
      console.warn("[TTS] MsEdgeTTS failed, trying Google TTS fallback:", edgeErr?.message || edgeErr);
    }

    // Fallback: Google TTS
    const fallbackBuffer = await getGoogleTTSBuffer(speechText);
    if (fallbackBuffer.length > 0) {
      console.log(`[TTS] Google TTS fallback generated ${fallbackBuffer.length} bytes`);
      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": fallbackBuffer.length.toString(),
        },
      });
    }

    throw new Error("Both MsEdgeTTS and Google TTS produced empty audio");
  } catch (err: any) {
    console.error("[TTS API Error]:", err?.message || err);
    return NextResponse.json({ error: err.message || "Failed to generate speech" }, { status: 500 });
  }
}
