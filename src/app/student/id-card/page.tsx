"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ShieldCheck, Download, GraduationCap } from "lucide-react";
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
      <div className="w-full flex justify-start mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold transition-colors w-fit">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
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
      <div className="mt-8 text-center text-xs font-medium text-zinc-400 bg-white/50 dark:bg-zinc-900/50 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-inner space-y-2">
        <p>QR Code นี้จะถูกใช้เพื่อสแกนอนุญาตให้ออกนอกวิทยาลัย<br />
          กรุณาเปิดแสงสว่างหน้าจอให้สุดเมื่อให้รปภ.สแกน</p>
        {gpsStatus === "active" && (
          <p className="text-rose-500 font-black animate-pulse">
            ⚠️ ห้ามปิดหน้านี้! ระบบกำลังส่งพิกัดติดตามตำแหน่ง
          </p>
        )}
        {wakeLockActive && (
          <p className="text-emerald-500 font-bold">🔒 หน้าจอถูกล็อกไม่ให้ดับ</p>
        )}
      </div>
    </div>
  );
}
