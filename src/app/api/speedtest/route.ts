import { NextResponse } from "next/server";

// Generate a 1MB uncompressible random chunk once at module initialization
const randomChunk = new Uint8Array(1024 * 1024);
for (let i = 0; i < randomChunk.length; i++) {
  randomChunk[i] = Math.floor(Math.random() * 256);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get("size") || "0");

  if (size > 0) {
    // Generate uncompressible data to prevent proxy/middleware gzipping which ruins speed tests
    const bufferSize = Math.min(size, 20 * 1024 * 1024);
    const data = new Uint8Array(bufferSize);
    
    // Fill the data buffer with the pre-generated random chunk
    for (let i = 0; i < bufferSize; i += randomChunk.length) {
      data.set(randomChunk.subarray(0, Math.min(randomChunk.length, bufferSize - i)), i);
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, no-transform",
        "Content-Disposition": "attachment; filename=speedtest.bin",
      },
    });
  }

  // Small response for Ping/RTT
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

export async function POST(request: Request) {
  // Read the body to ensure it's fully uploaded
  await request.arrayBuffer();
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}
