"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, MousePointer2, Loader2, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LiveViewPage() {
  const { data: session, status } = useSession();
  const { userId } = useParams();
  const router = useRouter();

  const [cursorData, setCursorData] = useState<{ x: number; y: number; path: string; screenWidth: number; screenHeight: number; scrollX?: number; scrollY?: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && cursorData?.scrollX !== undefined && cursorData?.scrollY !== undefined) {
      try {
        iframeRef.current.contentWindow?.scrollTo({
          left: cursorData.scrollX,
          top: cursorData.scrollY,
          behavior: 'instant'
        });
      } catch (e) {
        // Ignore cross-origin errors if any
      }
    }
  }, [cursorData?.scrollX, cursorData?.scrollY]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const userRole = (session?.user?.role || "").toLowerCase();
    if (!["super_admin", "admin", "director"].includes(userRole || "")) {
      router.push("/dashboard");
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }
      
      eventSource = new EventSource(`/api/admin/live-cursor?targetUserId=${userId}`);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        if (event.data === "ping") return;
        try {
          const data = JSON.parse(event.data);
          setCursorData(data);
        } catch (error) {
          console.error("Failed to parse SSE data", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error (Attempting manual reconnect in 3s...):", error);
        setIsConnected(false);
        eventSource?.close();
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectSSE, 3000); // Robust manual reconnect
      };
    };

    connectSSE();

    return () => {
      clearTimeout(reconnectTimer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId, session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // Calculate actual position on Admin's screen based on percentage from User's screen
  // Since we're rendering this in a scaled down container, we need to map the percentages
  const containerWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 1000;
  const containerHeight = typeof window !== "undefined" ? window.innerHeight * 0.7 : 700;

  const cursorX = cursorData ? (cursorData.x / 100) * containerWidth : 0;
  const cursorY = cursorData ? (cursorData.y / 100) * containerHeight : 0;

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 py-8 relative min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/telemetry" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              Live Monitor <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
            </h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              กำลังเฝ้าดูการใช้งานของ User ID: {userId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            {isConnected ? "Connected (Real-time)" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
            <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">สถานะปัจจุบัน</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">กำลังดูหน้าเว็บ (Path)</p>
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                    {cursorData?.path || "รอข้อมูล..."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">ขนาดจอของผู้ใช้</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl">
                  <MonitorSmartphone className="w-4 h-4 text-zinc-400" />
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {cursorData ? `${cursorData.screenWidth} x ${cursorData.screenHeight} px` : "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">พิกัดเมาส์ (X, Y %)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-center">
                    <p className="text-[10px] text-zinc-400 font-black">X</p>
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">{cursorData?.x.toFixed(1) || 0}%</p>
                  </div>
                  <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-center">
                    <p className="text-[10px] text-zinc-400 font-black">Y</p>
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">{cursorData?.y.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Screen Area */}
        <div className="xl:col-span-3">
          <div className="bg-zinc-100 dark:bg-zinc-950 border-4 border-zinc-200 dark:border-zinc-800 rounded-4xl w-full relative overflow-hidden flex items-center justify-center shadow-inner" style={{ height: "70vh" }}>
            
            {!cursorData ? (
              <div className="text-center">
                <MousePointer2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4 animate-bounce" />
                <p className="text-zinc-500 font-bold">รอการเคลื่อนไหวจากผู้ใช้...</p>
                <p className="text-xs text-zinc-400 mt-2">หากผู้ใช้อยู่หน้าเว็บและขยับเมาส์ ข้อมูลจะแสดงที่นี่</p>
              </div>
            ) : (
              <>
                {/* Simulated Screen Outline matching user's aspect ratio */}
                <div 
                  className="absolute border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm pointer-events-none"
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    aspectRatio: `${cursorData.screenWidth} / ${cursorData.screenHeight}`
                  }}
                >
                  {/* The Actual Page Background in Iframe */}
                  <iframe 
                    ref={iframeRef}
                    src={cursorData.path} 
                    className="absolute inset-0 w-full h-full border-none opacity-60 dark:opacity-40 grayscale-30 select-none overflow-hidden"
                    style={{ pointerEvents: "none" }}
                    title="User Mockup Background"
                  />
                  
                  {/* Overlay to ensure nothing intercepts the pointer events and adds a slight tint */}
                  <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 pointer-events-none mix-blend-multiply" />
                  
                  {/* The Live Cursor */}
                  <motion.div
                    animate={{
                      x: cursorX,
                      y: cursorY,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      mass: 0.5
                    }}
                    className="absolute top-0 left-0 pointer-events-none z-50 flex items-center justify-center"
                  >
                    {/* The Cursor Graphic */}
                    <div className="relative">
                      <MousePointer2 className="w-8 h-8 text-rose-500 fill-rose-500 -translate-x-[2px] -translate-y-[2px]" />
                      <div className="absolute top-8 left-4 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg flex flex-col gap-0.5 whitespace-nowrap">
                        <span>User</span>
                      </div>
                    </div>
                    {/* Click Ripple Effect Simulation (Optional future feature if we track clicks) */}
                  </motion.div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
