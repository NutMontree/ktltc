"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  ScanFace,
  CheckCircle,
  Clock,
  History,
  User,
  Loader2,
  ShieldCheck,
  ShieldX,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { uploadFile } from "@/lib/upload";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type FaceStatus =
  | "idle"
  | "loading_models"
  | "loading_profile"
  | "no_profile"
  | "detecting"
  | "matched"
  | "not_matched"
  | "error";

export default function StudentFlagpolePortal() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<"checkin" | "history">("checkin");
  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    name: "",
    image: null,
    studentId: "",
    academicLevel: "",
    role: "student",
  });

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [checkingToday, setCheckingToday] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "searching" | "found" | "error">(
    "idle",
  );
  const [locationError, setLocationError] = useState("");
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("idle");
  const [faceMsg, setFaceMsg] = useState("");
  const [recordedTime, setRecordedTime] = useState<string>("");

  const [timeState, setTimeState] = useState({
    isLocked: false,
    lockMsg: "",
    canProceed: true,
  });

  const [flagpoleConfig, setFlagpoleConfig] = useState({
    checkInStart: "07:00",
    lateThreshold: "08:00",
    checkInEnd: "08:45",
    inSiteDistance: 200,
    closedDays: [0, 6],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceApiRef = useRef<any>(null);
  const profileDescriptorRef = useRef<Float32Array | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch student profile, history, and today check-in status
  const loadStudentData = async () => {
    try {
      // 1. Fetch Profile Info
      const resProfile = await fetch("/api/profile");
      if (resProfile.ok) {
        const data = await resProfile.json();
        setProfileData({
          name: data.name || data.username || "",
          image: data.image || null,
          studentId: data.studentId || "ไม่พบรหัสประจำตัว",
          academicLevel: data.academicLevel || "ระดับชั้นเรียน",
          role: data.role || "student",
        });
      }

      // 2. Fetch History
      const resHistory = await fetch("/api/flagpole/history");
      if (resHistory.ok) {
        const result = await resHistory.json();
        const records = result.data || [];
        setHistory(records);

        // Analyze if today check-in is complete
        const thNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        const todayStr = format(thNow, "yyyy-MM-dd");

        const foundToday = records.find((rec: any) => {
          const recDate = new Date(rec.date);
          const recDateTh = new Date(recDate.getTime() + 7 * 60 * 60 * 1000);
          return format(recDateTh, "yyyy-MM-dd") === todayStr;
        });

        if (foundToday) {
          setTodayAttendance(foundToday);
        }
      }

      // 3. Fetch Flagpole Settings
      try {
        const resConfig = await fetch("/api/admin/flagpole-settings");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setFlagpoleConfig(configData);
        }
      } catch (errConfig) {
        console.error("Failed to load flagpole settings", errConfig);
      }
    } catch (err) {
      console.error("Failed to load student portal data", err);
    } finally {
      setLoadingHistory(false);
      setCheckingToday(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      loadStudentData();
    }
  }, [status]);

  // Main Timer & Boundary Evaluation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const [startH, startM] = (flagpoleConfig.checkInStart || "07:00").split(":").map(Number);
      const [closeH, closeM] = (flagpoleConfig.checkInEnd || "08:45").split(":").map(Number);

      const flagStart = startH * 100 + startM;
      const flagClose = closeH * 100 + closeM;

      // เวลาประเทศไทย (ICT)
      const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const val = thNow.getUTCHours() * 100 + thNow.getUTCMinutes();

      let locked = false;
      let msg = "";
      let canAction = true;

      // วันเสาร์-อาทิตย์ ปิดระบบการเข้าแถวโดยอัตโนมัติ (หรือตามที่ผู้ดูแลตั้งค่าไว้)
      const thDay = thNow.getUTCDay();
      const closedDays = flagpoleConfig.closedDays || [0, 6];
      if (closedDays.includes(thDay)) {
        locked = true;
        msg = "วันนี้เป็นวันหยุดทำกิจกรรม ไม่ต้องเช็คชื่อเข้าแถวหน้าเสาธง";
        canAction = false;
      } else if (val < flagStart) {
        locked = true;
        msg = `ยังไม่ถึงเวลากิจกรรมเช็คชื่อเข้าแถว (ระบบเปิดเช็คชื่อเวลา ${flagpoleConfig.checkInStart || "07:00"} น.)`;
        canAction = false;
      } else if (val > flagClose) {
        locked = true;
        msg = `หมดช่วงเวลาเช็คชื่อเข้าแถวหน้าเสาธงแล้ว (ระบบปิดให้บริการเมื่อเวลา ${flagpoleConfig.checkInEnd || "08:45"} น.)`;
        canAction = false;
      }

      setTimeState({ isLocked: locked, lockMsg: msg, canProceed: canAction });
    }, 1000);
    return () => clearInterval(timer);
  }, [flagpoleConfig]);

  const loadFaceApiAndProfile = async () => {
    try {
      setFaceStatus("loading_models");
      setFaceMsg("กำลังโหลดโมเดลใบหน้า...");

      const faceApi = await import("@vladmandic/face-api");
      faceApiRef.current = faceApi;

      const MODEL_URL = "/models";
      await Promise.all([
        faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setFaceStatus("loading_profile");
      setFaceMsg("กำลังโหลดรูปข้อมูลสิทธิ์ใบหน้า...");

      if (!profileData.image) {
        setFaceStatus("no_profile");
        setFaceMsg("ไม่พบรูปถ่ายโปรไฟล์ — ข้ามการตรวจสิทธิ์ใบหน้า");
        return;
      }

      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = profileData.image;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const detection = await faceApi
        .detectSingleFace(img, new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceMsg("ภาพโปรไฟล์ไม่สมบูรณ์ — ข้ามการตรวจใบหน้า");
        return;
      }

      profileDescriptorRef.current = detection.descriptor;
      setFaceStatus("detecting");
      setFaceMsg("กำลังวิเคราะห์สแกนใบหน้า...");

      startLiveDetection();
    } catch (err) {
      console.error("Face API Error:", err);
      setFaceStatus("error");
      setFaceMsg("ตรวจใบหน้าขัดข้อง — ข้ามการประมวลผล");
    }
  };

  const startLiveDetection = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceApiRef.current || !profileDescriptorRef.current) return;
      if (videoRef.current.readyState < 2) return;

      try {
        const faceApi = faceApiRef.current;
        const detection = await faceApi
          .detectSingleFace(
            videoRef.current,
            new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const distance = faceApi.euclideanDistance(
            profileDescriptorRef.current,
            detection.descriptor,
          );
          if (distance <= 0.5) {
            setFaceStatus("matched");
            setFaceMsg(`✅ ยืนยันใบหน้านักศึกษาสำเร็จ (${Math.round((1 - distance) * 100)}%)`);
          } else {
            setFaceStatus("not_matched");
            setFaceMsg("❌ ใบหน้าไม่ตรงกับรหัสบัญชีโปรไฟล์");
          }
        } else {
          setFaceStatus("detecting");
          setFaceMsg("กรุณาจ้องมองตรงมาที่เลนส์กล้องหน้า");
        }
      } catch {}
    }, 1500);
  };

  const getLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) {
        setLocationStatus("error");
        setLocationError("อุปกรณ์ของคุณไม่รอบรับพิกัดระบบนำทาง GPS");
      }
      return;
    }
    setLocationStatus("searching");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("found");
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocationStatus("error");
        if (err.code === 1)
          setLocationError(
            "กรุณาเปิดสิทธิ์ระบุตำแหน่ง (Location Access) ในเมนูของอุปกรณ์เบราว์เซอร์",
          );
        else setLocationError("ไม่พบพิกัดตำแหน่งสแกน ลองออกมานอกที่ร่ม/อาคารเรียน");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: 640, height: 480 },
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((e) => console.error(e));
          loadFaceApiAndProfile();
          getLocation(true);
        } catch (err: any) {
          console.error("Camera Error:", err);
          alert("ไม่สามารถเข้าถึงกล้องหน้าได้ กรุณาปลดบล็อกในตั้งค่าเบราว์เซอร์");
          setIsCameraOpen(false);
        }
      }
    };

    if (isCameraOpen) startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isCameraOpen]);

  const submitCheckIn = async () => {
    if (faceStatus === "not_matched") {
      alert("ใบหน้าไม่ตรงกับรูปโปรไฟล์บัญชี ไม่สามารถเช็คชื่อแทนกันได้");
      return;
    }

    setIsProcessing(true);
    try {
      let photoUrl = "";

      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/jpeg", 0.85),
          );
          if (blob) {
            const file = new File([blob], "student-flagpole.jpg", { type: "image/jpeg" });
            const compressed = await imageCompression(file, {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 800,
            });
            const uploadRes = await uploadFile(compressed, "attendance_photos");
            if (uploadRes?.secure_url) photoUrl = uploadRes.secure_url;
          }
        }
      }

      if (!photoUrl) {
        alert("ไม่สามารถอัปโหลดรูปภาพเช็คชื่อได้ กรุณาลองใหม่อีกครั้ง");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/flagpole/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location?.lat,
          lng: location?.lng,
          photoUrl,
          deviceId: navigator.userAgent.substring(0, 80),
          address: location
            ? `พิกัด: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
            : "ไม่ระบุตำแหน่ง",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        setIsCameraOpen(false);
        setStatusMsg("เช็คชื่อเข้าแถวเรียบร้อยแล้ว!");
        loadStudentData(); // Reload stats and history
      } else {
        alert(data.message || "เช็คชื่อไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่ายอินเทอร์เน็ต");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelCheckIn = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setIsCameraOpen(false);
    setFaceStatus("idle");
  };

  const getFaceStatusUI = () => {
    switch (faceStatus) {
      case "loading_models":
      case "loading_profile":
        return {
          icon: <Loader2 className="animate-spin" />,
          color: "bg-slate-100 text-slate-600 border-slate-200",
        };
      case "detecting":
        return {
          icon: <Loader2 className="animate-spin" />,
          color: "bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse",
        };
      case "matched":
        return {
          icon: <ShieldCheck />,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "not_matched":
        return { icon: <ShieldX />, color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return null;
    }
  };

  const faceUI = getFaceStatusUI();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
        <p className="text-xs font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
          กำลังเตรียมระบบพอร์ทัลนักเรียน...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 px-4 font-sans relative overflow-hidden text-left flex flex-col items-center">
      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10 flex-1 flex flex-col">
        {/* User Badge - Premium Student look */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-indigo-100 dark:border-zinc-700 shadow-md flex items-center justify-center bg-indigo-50 dark:bg-zinc-800">
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-slate-400" size={28} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center shadow-lg text-white">
                <CheckCircle2 size={12} />
              </div>
            </div>
            <div>
              <h1
                className="text-xl font-black text-slate-800 dark:text-white leading-none mb-2 truncate max-w-[200px]"
                title={profileData.name}
              >
                {profileData.name || "นักเรียน/นักศึกษา"}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest shadow-sm">
                  {profileData.studentId}
                </span>
                <span className="text-[10px] text-slate-400 font-bold dark:text-zinc-500 truncate max-w-[120px]">
                  {profileData.academicLevel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                // 1. ลบคุกกี้ความปลอดภัย "token" ผ่าน API
                await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
                // 2. เรียกใช้ signOut แบบปิด redirect
                await signOut({ redirect: false });
              } catch (err) {
                console.error("Logout error:", err);
              }
              // 3. ใช้ window.location.href ทำ Hard Redirect
              window.location.href = "/login";
            }}
            className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all border border-slate-100 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-rose-950/20"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="bg-slate-200/50 dark:bg-zinc-900/80 p-1.5 rounded-full flex gap-1 shadow-inner border border-slate-100 dark:border-zinc-800/30">
          <button
            onClick={() => setActiveTab("checkin")}
            className={`flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "checkin"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-md shadow-black/5"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Camera size={14} />
            สแกนเข้าแถว
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-md shadow-black/5"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <History size={14} />
            ประวัติการเข้าแถว
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {activeTab === "checkin" ? (
              <motion.div
                key="checkin-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full flex flex-col space-y-6"
              >
                {/* 1. Clock display */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800 relative group overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 to-blue-600" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-400 shrink-0">
                      <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                      {mounted
                        ? time.toLocaleDateString("th-TH", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : "LODING..."}
                    </span>
                  </div>

                  <div className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white font-mono flex items-baseline justify-start gap-1 select-none">
                    {mounted
                      ? time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
                      : "--:--"}
                    <span className="text-lg text-indigo-500 font-bold ml-1 animate-pulse">
                      {mounted ? time.getSeconds().toString().padStart(2, "0") : "--"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-4 pl-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      ระบบลงเวลา {flagpoleConfig.checkInStart} - {flagpoleConfig.checkInEnd} น. |
                      สายหลัง {flagpoleConfig.lateThreshold} น.
                    </span>
                  </div>
                </div>

                {/* 2. Today check-in status or check-in flow */}
                {checkingToday ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-zinc-800 flex items-center justify-center h-48 shadow-xl">
                    <Loader2 className="animate-spin text-slate-300 w-8 h-8" />
                  </div>
                ) : todayAttendance ? (
                  /* Check-in Done today */
                  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800 relative overflow-hidden text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                      <CheckCircle className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
                      เช็คชื่อเสาธงเรียบร้อยแล้ว!
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                      Successfully Registered Today
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full text-left bg-slate-50 dark:bg-zinc-950 p-4 rounded-3xl border border-slate-100 dark:border-zinc-850 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">
                          Time Checked
                        </span>
                        <span className="text-base font-black text-slate-800 dark:text-zinc-100">
                          {todayAttendance.checkIn?.time
                            ? format(new Date(todayAttendance.checkIn.time), "HH:mm:ss")
                            : "--:--"}{" "}
                          น.
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">
                          Status Badge
                        </span>
                        <span
                          className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md border inline-block ${
                            todayAttendance.status === "Present"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {todayAttendance.status === "Present" ? "มาตรงเวลา" : "สาย"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : !isCameraOpen ? (
                  /* Start scanning trigger */
                  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6 shadow-inner border border-white dark:border-zinc-800">
                      <ScanFace size={44} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">
                      เช็คชื่อกิจกรรมเสาธง
                      <br />
                      {/* <p>Test System 1</p> */}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 max-w-[240px] mx-auto">
                      โปรดสแกนใบหน้าและบันทึกตำแหน่ง GPS
                      บริเวณหน้าเสาธงเพื่อลงทะเบียนเช็คชื่อเข้าร่วม
                    </p>

                    {timeState.isLocked ? (
                      <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl text-rose-600 dark:text-rose-400 w-full">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 flex items-center justify-center gap-1.5">
                          <AlertCircle size={12} /> ระบบเข้าแถวเสาธงปิด
                        </p>
                        <p className="text-xs font-bold leading-relaxed">{timeState.lockMsg}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full bg-linear-to-r from-indigo-500 to-blue-600 text-white py-4.5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/25"
                      >
                        <Camera size={18} />
                        เริ่มสแกนเช็คชื่อเข้าแถว 🇹🇭
                      </button>
                    )}
                  </div>
                ) : (
                  /* Camera active check-in flow */
                  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 shadow-xl border border-slate-100 dark:border-zinc-800 flex flex-col">
                    <div className="w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden relative mb-4 shadow-inner border-2 border-slate-100 dark:border-zinc-800">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />

                      {/* Video Tags overlay */}
                      <div className="absolute top-3 left-3 right-3 flex flex-col gap-1.5 pointer-events-none">
                        {faceUI && (
                          <div
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${faceUI.color}`}
                          >
                            {faceUI.icon}
                            <span>{faceMsg}</span>
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                            locationStatus === "found"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-500 border-slate-200 animate-pulse"
                          }`}
                        >
                          <MapPin size={12} />
                          <span>
                            {locationStatus === "searching" && "กำลังตรวจพิกัด GPS..."}
                            {locationStatus === "found" && "พิกัดเสร็จสิ้น"}
                            {locationStatus === "error" && "ตรวจพิกัดขัดข้อง"}
                            {locationStatus === "idle" && "รอระบุพิกัด..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {locationError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold flex gap-2 border border-red-100 mb-3 text-left">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={cancelCheckIn}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button
                        disabled={isProcessing || !location || faceStatus === "not_matched"}
                        onClick={submitCheckIn}
                        className="flex-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <span>ลงเวลาเข้าแถว 🇹🇭</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full flex flex-col space-y-4"
              >
                {loadingHistory ? (
                  [1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-900 rounded-4xl p-4 border border-slate-100 dark:border-zinc-800 animate-pulse h-24 shadow-sm"
                    />
                  ))
                ) : history.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-inner">
                    <CalendarDays className="w-12 h-12 text-slate-200 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">
                      ไม่พบประวัติการเข้าแถวเสาธง
                    </p>
                    <p className="text-[9px] text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                      ประวัติจะแสดงเมื่อผ่านการเช็คชื่อ
                    </p>
                  </div>
                ) : (
                  history.map((record, index) => {
                    const isLate = record.status === "Late";
                    const dateVal = record.checkIn?.time
                      ? new Date(record.checkIn.time)
                      : new Date(record.date);
                    return (
                      <motion.div
                        key={record._id || index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-zinc-900 rounded-4xl p-4 border border-slate-100 dark:border-zinc-800 shadow-lg flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini Date Badge */}
                          <div className="bg-slate-50 dark:bg-zinc-950 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-zinc-850">
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-wider">
                              {format(dateVal, "MMM", { locale: th })}
                            </span>
                            <span className="text-xl font-black text-slate-800 dark:text-white leading-none mt-0.5 tracking-tighter">
                              {format(dateVal, "dd")}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                                {format(dateVal, "EEEE", { locale: th })}
                              </h4>
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                  isLate
                                    ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                                }`}
                              >
                                {isLate ? "สาย" : "ตรงเวลา"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                              <span>เช็คชื่อเมื่อ: {format(dateVal, "HH:mm:ss")} น.</span>
                              {record.checkIn?.statusTag && (
                                <span className="border-l border-slate-200 dark:border-zinc-800 pl-2 ml-2">
                                  {record.checkIn.statusTag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {record.checkIn?.photoUrl && (
                          <a
                            href={record.checkIn.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-11 bg-slate-100 rounded-md overflow-hidden border border-slate-200 shadow-sm shrink-0 block hover:scale-105 transition-all"
                          >
                            <img
                              src={record.checkIn.photoUrl}
                              alt="Scan"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-6 pb-2 text-center border-t border-slate-100 dark:border-zinc-900/40">
          <p className="text-[9px] text-slate-300 dark:text-zinc-700 font-black uppercase tracking-[0.3em] leading-loose">
            Simplified Student Flagpole Portal <br />
            KTL by AllMaster • Workplace Education
          </p>
        </div>
      </div>
    </div>
  );
}
