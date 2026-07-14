import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Global in-memory store for cursor positions
// In production, this should ideally be Redis, but for minimal server load on a single instance, memory is fastest.
// Using a Map: Map<userId, { x: number, y: number, path: string, timestamp: number, screenWidth: number, screenHeight: number }>
declare global {
  var globalCursorStore: Map<string, any>;
}

if (!global.globalCursorStore) {
  global.globalCursorStore = new Map();
}

const cursorStore = global.globalCursorStore;

// Map of active SSE connections for admins watching a specific user
// Map<adminId, { targetUserId: string, controller: ReadableStreamDefaultController }>
declare global {
  var globalSSEClients: Map<string, any>;
}

if (!global.globalSSEClients) {
  global.globalSSEClients = new Map();
}
const sseClients = global.globalSSEClients;

// Clean up stale data every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of cursorStore.entries()) {
    if (now - data.timestamp > 10000) { // Remove if older than 10 seconds
      cursorStore.delete(userId);
    }
  }
}, 10000);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();
    const { x, y, path, screenWidth, screenHeight, scrollX, scrollY } = body;
    const userId = session.user.id;

    // Save to memory (Very Fast, 0 DB queries)
    cursorStore.set(userId, {
      x,
      y,
      path,
      screenWidth,
      screenHeight,
      scrollX: scrollX || 0,
      scrollY: scrollY || 0,
      timestamp: Date.now(),
    });

    let isWatched = false;
    // Broadcast to any admin currently watching this user
    for (const [adminId, client] of sseClients.entries()) {
      if (client.targetUserId === userId) {
        isWatched = true;
        try {
          const payload = JSON.stringify({ x, y, path, screenWidth, screenHeight, scrollX: scrollX || 0, scrollY: scrollY || 0 });
          client.controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`));
        } catch (e) {
          // If error sending to client, remove the client
          sseClients.delete(adminId);
        }
      }
    }

    return NextResponse.json({ success: true, watched: isWatched });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);

    // 1. Status Check for Students (Polling)
    if (searchParams.get("checkStatus") === "true") {
      if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
      }
      const userId = session.user.id;
      let isWatched = false;
      for (const client of sseClients.values()) {
        if (client.targetUserId === userId) {
          isWatched = true;
          break;
        }
      }
      return NextResponse.json({ watched: isWatched });
    }

    const userRole = (session?.user?.role || "").toLowerCase();
    
    // Only allow admins
    if (!["super_admin", "admin", "director"].includes(userRole || "")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return new Response("Missing targetUserId", { status: 400 });
    }

    const adminId = session?.user?.id || Math.random().toString();

    // Setup SSE Stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial state if available
        const initialData = cursorStore.get(targetUserId);
        if (initialData) {
          const payload = JSON.stringify({ 
            x: initialData.x, 
            y: initialData.y, 
            path: initialData.path,
            screenWidth: initialData.screenWidth,
            screenHeight: initialData.screenHeight,
            scrollX: initialData.scrollX || 0,
            scrollY: initialData.scrollY || 0
          });
          controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`));
        }

        // Add to active clients
        sseClients.set(adminId, { targetUserId, controller });

        // Ping to keep connection alive
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
          } catch (e) {
            clearInterval(pingInterval);
            sseClients.delete(adminId);
          }
        }, 15000);
      },
      cancel() {
        sseClients.delete(adminId);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
