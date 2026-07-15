"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ShieldCheck, Download, GraduationCap, BookOpen, X } from "lucide-react";
import { QRCode } from "antd";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function StudentIdCardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"pending" | "active" | "error" | "denied">("pending");
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [webrtcEnabled, setWebrtcEnabled] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings/tracking")
      .then(res => {
        if (!res.ok) throw new Error("API tracking not found");
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.data) {
          setWebrtcEnabled(data.data.webrtc_hack_enabled);
          setPipEnabled(data.data.pip_hack_enabled);
        }
      })
      .catch((err) => console.log("Tracking settings ignored:", err.message));
  }, []);

  // === Screen Wake Lock: Keep screen ON ===
  useEffect(() => {
    if (status !== "authenticated") return;
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          setWakeLockActive(true);
          wakeLock.addEventListener("release", () => setWakeLockActive(false));
        }
      } catch (err) {
        console.log("Wake Lock not supported or failed:", err);
      }
    };

    requestWakeLock();

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (wakeLock) wakeLock.release().catch(() => { });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  // === Warn before closing tab ===
  useEffect(() => {
    if (status !== "authenticated") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "ระบบติดตาม GPS กำลังทำงานอยู่ คุณแน่ใจหรือว่าต้องการปิดหน้านี้?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // === Silent Audio Hack (Keep browser active) ===
  useEffect(() => {
    if (status !== "authenticated") return;
    
    // Tiny 1-sample silent WAV
    const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    const audio = new Audio(silentWav);
    audio.loop = true;

    const startAudio = () => {
      audio.play().catch(e => console.log("Silent audio blocked:", e));
      document.removeEventListener("click", startAudio);
      document.removeEventListener("touchstart", startAudio);
    };

    // Needs user interaction to start
    document.addEventListener("click", startAudio);
    document.addEventListener("touchstart", startAudio);

    return () => {
      audio.pause();
      document.removeEventListener("click", startAudio);
      document.removeEventListener("touchstart", startAudio);
    };
  }, [status]);

  // === Service Worker & Background Sync Registration ===
  useEffect(() => {
    if (status !== "authenticated") return;
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        console.log('SW registered:', registration.scope);
        // Request sync if supported
        if ('sync' in registration) {
          try {
            await (registration as any).sync.register('gps-sync');
          } catch (err) {
            console.log('Background Sync not supported:', err);
          }
        }
      }).catch(err => console.log('SW registration failed:', err));
    }
  }, [status]);

  // === WebRTC Mic Hack ===
  useEffect(() => {
    if (status !== "authenticated" || !webrtcEnabled) return;
    
    let mediaStream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    const startWebRTC = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0; // Mute it
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      } catch (err) {
        console.log("WebRTC Hack denied or failed:", err);
      }
    };

    const initHack = () => {
      startWebRTC();
      document.removeEventListener("click", initHack);
      document.removeEventListener("touchstart", initHack);
    };

    document.addEventListener("click", initHack);
    document.addEventListener("touchstart", initHack);

    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
      document.removeEventListener("click", initHack);
      document.removeEventListener("touchstart", initHack);
    };
  }, [status, webrtcEnabled]);

  // === PiP Hack ===
  useEffect(() => {
    if (status !== "authenticated" || !pipEnabled) return;

    let videoElement: HTMLVideoElement | null = null;
    let canvasStream: MediaStream | null = null;

    const startPiP = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, 160, 90);
          ctx.fillStyle = "#71717a";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("GPS Tracking", 80, 50);
        }

        canvasStream = (canvas as any).captureStream(1);
        videoElement = document.createElement("video");
        videoElement.srcObject = canvasStream;
        videoElement.muted = true;
        videoElement.playsInline = true;
        await videoElement.play();

        if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
          await videoElement.requestPictureInPicture();
        }
      } catch (err) {
        console.log("PiP Hack failed:", err);
      }
    };

    const initPiP = () => {
      startPiP();
      document.removeEventListener("click", initPiP);
      document.removeEventListener("touchstart", initPiP);
    };

    document.addEventListener("click", initPiP);
    document.addEventListener("touchstart", initPiP);

    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
      document.removeEventListener("click", initPiP);
      document.removeEventListener("touchstart", initPiP);
    };
  }, [status, pipEnabled]);

  // === GPS Tracking Logic (watchPosition + interval fallback) ===
  useEffect(() => {
    if (status !== "authenticated" || !navigator.geolocation) return;

    let watchId: number;
    let intervalId: ReturnType<typeof setInterval>;

    const sendLocation = async (latitude: number, longitude: number) => {
      try {
        await fetch("/api/tracking/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });
      } catch (error) {
        console.error("Failed to send GPS data", error);
      }
    };

    // Primary: watchPosition (fires on every movement)
    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        setGpsStatus("active");
        await sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // Fallback: interval-based GPS push every 15 seconds
    // This ensures data keeps flowing even if watchPosition stalls (common on mobile)
    intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setGpsStatus("active");
          await sendLocation(position.coords.latitude, position.coords.longitude);
        },
        () => { },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
      );
    }, 15000);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [status]);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">กำลังโหลดบัตรประจำตัว...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const user = session?.user as any;
  const isStudent = user?.role === "student" || user?.role === "Student";
  const studentId = user?.id || "";

  return (
    <div className="max-w-[500px] mx-auto w-full px-4 py-8 md:py-12 relative min-h-screen flex flex-col pt-24 items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold transition-colors w-fit">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
        <button onClick={() => setManualOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 text-amber-600 hover:bg-amber-100 rounded-lg font-bold transition-colors text-xs border border-amber-100">
          <BookOpen size={14} /> คู่มือ
        </button>
      </div>

      <div className="text-center mb-8 w-full">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase mb-2">
          บัตรประจำตัวดิจิทัล
        </h1>
        <p className="text-sm font-medium text-zinc-500">
          แสดงหน้านี้ให้ครูเวร/รปภ. สแกนเพื่อเข้า-ออกวิทยาลัย
        </p>
      </div>

      {/* ID Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full aspect-2/3 max-h-[600px] bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[2.5rem] p-1 shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
      >
        {/* Holographic effect */}
        <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

        {/* Card Inner */}
        <div className="w-full h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[2.3rem] flex flex-col items-center relative z-20 overflow-hidden">

          {/* Top Banner */}
          <div className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <GraduationCap size={32} className="mb-2 opacity-90" />
            <h2 className="text-sm font-black uppercase tracking-widest opacity-90">Kantharalak Technical College</h2>
            <h3 className="text-xs font-medium opacity-75 mt-1 tracking-widest">Digital Student ID</h3>
          </div>

          {/* Profile Area */}
          <div className="relative -mt-10 mb-4">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden relative border border-slate-200 dark:border-zinc-700">
                {user?.image ? (
                  <Image src={user.image} alt={user?.name || "Profile"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300 dark:text-zinc-600 uppercase">
                    {(user?.name || "U")[0]}
                  </div>
                )}
              </div>
            </div>
            {!isStudent && (
              <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                STAFF
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center px-6 mb-6">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-1">
              {user?.name || "ไม่ทราบชื่อ"}
            </h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              ID: {user?.username || user?.email || "N/A"}
            </p>
          </div>

          {/* QR Code Section */}
          <div className="flex-1 flex flex-col items-center justify-center w-full bg-slate-50/50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800/50 p-6 relative">

            {/* GPS Tracking Indicator */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/80 px-2 py-1 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800">
              {gpsStatus === "active" ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">GPS ทำงาน</span>
                </>
              ) : gpsStatus === "denied" ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">ปิด GPS</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">กำลังหาพิกัด</span>
                </>
              )}
            </div>

            <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 mt-2">
              <QRCode
                value={studentId}
                size={160}
                color="#09090b"
                bgColor="#ffffff"
                bordered={false}
              />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verified Digital Pass
            </p>
          </div>
        </div>
      </motion.div>

      {/* Helper text below card */}
      <div className="mt-8 text-center text-xs font-medium text-zinc-400 bg-white/50 dark:bg-zinc-900/50 px-4 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-inner space-y-3 max-w-sm mx-auto">
        <p className="text-zinc-600 dark:text-zinc-300 font-bold leading-relaxed">
          "เมื่อสแกนเสร็จแล้ว ให้หรี่แสงหน้าจอลง แต่อย่ากดปุ่มล็อกหน้าจอ (ปุ่ม Power) และห้ามปิดหน้าเว็บนี้ ให้ใส่กระเป๋าไว้ได้เลย หน้าจอจะไม่ดับเอง และ GPS จะส่งตำแหน่งได้ตลอดเวลา"
        </p>
        {gpsStatus === "active" && (
          <p className="text-rose-500 font-black animate-pulse bg-rose-50 dark:bg-rose-950/30 py-2 rounded-xl border border-rose-100 dark:border-rose-900/50">
            ⚠️ ห้ามปิดหน้านี้! ระบบกำลังส่งพิกัดติดตามตำแหน่ง
          </p>
        )}
        {wakeLockActive && (
          <p className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
            🔒 ระบบได้ล็อกหน้าจอไม่ให้ดับอัตโนมัติแล้ว
          </p>
        )}
      </div>

      {/* Manual Modal */}
      {manualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setManualOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 relative max-h-[80vh] overflow-y-auto"
          >
             <button onClick={() => setManualOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1">
               <X size={20} />
             </button>
             <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
               <BookOpen className="text-amber-500" /> คู่มือ: บัตรดิจิทัล
             </h3>
             <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl">
               <ol className="list-decimal list-inside space-y-3 font-medium">
                 <li><strong>แสดงหน้านี้</strong> ให้ครูเวรหรือ รปภ. สแกน QR Code ก่อนออกนอกวิทยาลัย</li>
                 <li>เมื่อสแกนสำเร็จ <strong>ระบบ GPS จะเริ่มทำงาน</strong> (ไฟสถานะขึ้นสีเขียว)</li>
                 <li><strong className="text-rose-600 dark:text-rose-400">ห้ามปิดหน้านี้เด็ดขาด!</strong> (สามารถหรี่แสงหน้าจอได้ แต่ห้ามล็อกจอหรือพับจอทิ้งไว้)</li>
                 <li>เมื่อกลับเข้าวิทยาลัย <strong>แสดงหน้านี้ให้ครูสแกนอีกครั้ง</strong> เพื่อยกเลิกการติดตามและหยุด GPS</li>
               </ol>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
