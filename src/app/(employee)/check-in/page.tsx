"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  ScanFace,
  CheckCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  ShieldX,
  AlertCircle,
  Scan,
  X,
  Navigation,
  Info,
} from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";

type FaceStatus =
  | "idle"
  | "loading_models"
  | "loading_profile"
  | "no_profile"
  | "detecting"
  | "matched"
  | "not_matched"
  | "error";

import imageCompression from "browser-image-compression";
import { uploadFile } from "@/lib/upload";

// --- Types ---
interface RoleSetting {
  role: string;
  checkInLimit?: string;
  checkOutTime?: string;
  checkInStart?: string;
  lateThreshold?: string;
  checkOutStart?: string;
  checkOutEnd?: string;
  systemLockStart?: string;
  systemLockEnd?: string;
  closedDays?: number[];
}

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as any)?.role?.toLowerCase() || "user";

  const actionType = searchParams.get("action") || "in";
  const isCheckIn = actionType === "in";

  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<RoleSetting[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "searching" | "found" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("idle");
  const [faceMsg, setFaceMsg] = useState("");
  const [recordedTime, setRecordedTime] = useState<string>("");

  // --- Attendance Time Validation (Thai Time) ---
  const [timeState, setTimeState] = useState({
    isLocked: false,
    lockMsg: "",
    canProceed: true,
  });

  // Fetch Settings on Mount (Enabled Aggressive Cache Busting)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const timestamp = Date.now();
        const res = await fetch(`/api/admin/role-settings?t=${timestamp}`, {
          cache: "no-store", // ⚡ บังคับดึงใหม่จาก Server
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("[Attendance Settings] Loaded:", data);
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      if (loadingConfig) return;

      // 1. ดำเนินการหา Setting ที่เกี่ยวข้อง
      const global = settings.find((s) => s.role === "system_global");
      const roleSpecific = settings.find((s) => s.role === userRole);

      // 2. กำหนดค่า Config (ลำดับความสำคัญ: Role > Global > Fallback)
      // 🔥 ปรับปรุง: ดึงเวลาเริ่มออกงานตามกฎภาพรวม (12:30) มาใช้เป็นลำดับแรก
      const config = {
        checkInStart: roleSpecific?.checkInStart || global?.checkInStart || "05:00",
        lateLimit:
          roleSpecific?.checkInLimit || global?.lateThreshold || "08:00",
        checkOutStart:
          roleSpecific?.checkOutStart || roleSpecific?.checkOutTime || global?.checkOutStart || "16:30",
        checkOutEnd: roleSpecific?.checkOutEnd || global?.checkOutEnd || "18:00",
        lockStart: global?.systemLockStart || "18:01",
        lockEnd: global?.systemLockEnd || "04:59",
      };

      // 🔍 DEBUG LOG: ตรวจสอบค่าที่ระบบดึงมาได้จริง
      console.log(
        `[Config Sync] Role: ${userRole}, Global Out Start: ${global?.checkOutStart}, Final Out Start: ${config.checkOutStart}`,
      );

      // Helper: HH:mm -> Number
      const toNum = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 100 + m;
      };

      const rules = {
        inStart: toNum(config.checkInStart),
        outStart: toNum(config.checkOutStart),
        outEnd: toNum(config.checkOutEnd),
        lockStart: toNum(config.lockStart),
        lockEnd: toNum(config.lockEnd),
      };

      // Thailand Time calculation
      const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const val = thNow.getUTCHours() * 100 + thNow.getUTCMinutes();

      let locked = false;
      let msg = "";
      let canAction = true;

      // 0. Closed Days Check (วันปิดระบบ)
      const closedDays = global?.closedDays || [];
      const thDay = thNow.getUTCDay();
      if (closedDays.includes(thDay)) {
        const dayNames = [
          "อาทิตย์",
          "จันทร์",
          "อังคาร",
          "พุธ",
          "พฤหัสบดี",
          "ศุกร์",
          "เสาร์",
        ];
        locked = true;
        msg = `วันนี้เป็นวัน${dayNames[thDay]} ซึ่งเป็นวันปิดระบบ ไม่สามารถลงเวลาได้`;
        canAction = false;
      }
      // A. System Lockout (กรณีข้ามคืน หรือ ปกติ)
      else if (
        rules.lockStart > rules.lockEnd
          ? val >= rules.lockStart || val < rules.lockEnd
          : val >= rules.lockStart && val < rules.lockEnd
      ) {
        locked = true;
        msg = `ขณะนี้อยู่นอกเวลาให้บริการ (ระบบปิดระหว่าง ${config.lockStart} - ${config.lockEnd} น.)`;
        canAction = false;
      }
      // B. Early Check-In
      else if (isCheckIn && val < rules.inStart) {
        locked = true;
        msg = `ยังไม่ถึงเวลาลงเวลาเข้างาน (เริ่มให้ลงเวลาเข้า ${config.checkInStart} น. เป็นต้นไป)`;
        canAction = false;
      }
      // C. Early Check-Out
      else if (!isCheckIn && val < rules.outStart) {
        locked = true;
        msg = `ยังไม่ถึงเวลาลงเวลาออกงาน (เริ่มให้ลงเวลาออก ${config.checkOutStart} น. ถึง ${config.checkOutEnd} น.)`;
        canAction = false;
      }
      // D. Late Check-Out (Over limit)
      else if (!isCheckIn && val > rules.outEnd) {
        locked = true;
        msg = `เลยเวลาลงเวลาออกงานแล้ว (สิ้นสุด ${config.checkOutEnd} น.) โปรดติดต่อเจ้าหน้าที่`;
        canAction = false;
      }

      setTimeState({ isLocked: locked, lockMsg: msg, canProceed: canAction });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckIn, loadingConfig, settings, userRole]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceApiRef = useRef<any>(null);
  const profileDescriptorRef = useRef<Float32Array | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadFaceApiAndProfile = async () => {
    try {
      setFaceStatus("loading_models");
      setFaceMsg("กำลังโหลดโมเดลใบหน้า...");

      // Dynamic import เพื่อป้องกัน SSR error
      const faceApi = await import("@vladmandic/face-api");
      faceApiRef.current = faceApi;

      const MODEL_URL = "/models";
      await Promise.all([
        faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setFaceStatus("loading_profile");
      setFaceMsg("กำลังโหลดข้อมูลโปรไฟล์...");

      // ดึงรูปโปรไฟล์จาก API
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("ไม่สามารถโหลดโปรไฟล์ได้");
      const profile = await res.json();

      if (!profile.image) {
        setFaceStatus("no_profile");
        setFaceMsg("ไม่พบรูปโปรไฟล์ — ระบบข้ามการตรวจสอบใบหน้า");
        return;
      }

      // โหลดรูปโปรไฟล์และดึง descriptor
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = profile.image;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const detection = await faceApi
        .detectSingleFace(
          img,
          new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceMsg("ไม่พบใบหน้าในรูปโปรไฟล์ — ระบบข้ามการตรวจสอบใบหน้า");
        return;
      }

      profileDescriptorRef.current = detection.descriptor;
      setFaceStatus("detecting");
      setFaceMsg("กำลังตรวจสอบใบหน้า...");

      // เริ่ม Real-time detection
      startLiveDetection();
    } catch (err) {
      console.error("Face API Error:", err);
      setFaceStatus("error");
      setFaceMsg("ระบบตรวจสอบใบหน้ามีปัญหา — ข้ามการตรวจสอบ");
    }
  };

  const startLiveDetection = () => {
    if (detectionIntervalRef.current)
      clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (
        !videoRef.current ||
        !faceApiRef.current ||
        !profileDescriptorRef.current
      )
        return;
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
            setFaceMsg(
              `✅ ยืนยันตัวตนสำเร็จ (ความแม่นยำ ${Math.round((1 - distance) * 100)}%)`,
            );
          } else {
            setFaceStatus("not_matched");
            setFaceMsg("❌ ใบหน้าไม่ตรงกับข้อมูลในระบบ");
          }
        } else {
          setFaceStatus("detecting");
          setFaceMsg("ไม่พบใบหน้า — กรุณาหันหน้าเข้าหากล้อง");
        }
      } catch {}
    }, 1500);
  };

  const getLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) {
        setLocationStatus("error");
        setLocationError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS");
      }
      return;
    }
    setLocationStatus("searching");
    setLocationError("");
    
    const options = { 
      enableHighAccuracy: true, 
      timeout: 15000, 
      maximumAge: 0 
    };

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
            "กรุณาอนุญาตการเข้าถึงตำแหน่ง (Location Permission) ในเมนูตั้งค่าของเบราว์เซอร์",
          );
        else if (err.code === 2)
          setLocationError("ไม่สามารถระบุพิกัดได้ (ลองออกมาในที่โล่งแจ้ง)");
        else if (err.code === 3)
          setLocationError("ขอพิกัด GPS หมดเวลา (Timeout) กรุณากดลองใหม่อีกครั้ง");
        else setLocationError("เกิดข้อผิดพลาดในการโหลด GPS");
      },
      options
    );
  };

  // Improved Camera Initialization using useEffect to ensure video element is ready
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Explicitly call play to handle some browser restrictions
            await videoRef.current.play().catch(e => console.error("Play error:", e));
          }
          
          // Trigger GPS after camera is confirmed working
          getLocation(true);
        } catch (err: any) {
          console.error("Camera Error:", err);
          let errorMsg = "ไม่พบกล้องหรือไม่สามารถเข้าถึงได้";
          
          if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            errorMsg = "กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปอื่นแล้วลองใหม่ หรือรีเฟรชหน้าจอ";
          } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            errorMsg = "คุณบล็อกการเข้าถึงกล้อง กรุณาปลดล็อกในตั้งค่าเบราว์เซอร์";
          }
          
          alert(errorMsg);
          setIsCameraOpen(false);
        }
      }
    };

    if (isCameraOpen) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const openCameraForAction = () => {
    setIsCameraOpen(true);
    setStatusMsg("");
    // Camera and GPS logic moved to useEffect for reliability
  };

  const cancelAction = () => {
    if (detectionIntervalRef.current)
      clearInterval(detectionIntervalRef.current);
    setIsCameraOpen(false);
    setFaceStatus("idle");
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
  };

  // ตรวจสอบว่าสามารถลงเวลาได้หรือไม่
  const canSubmit = () => {
    // ปิดการตรวจสอบใบหน้าชั่วคราว (Disabled Face Check)
    return !!location && !isProcessing;
  };

  const submitAttendance = async () => {
    // ตรวจสอบใบหน้าก่อนส่ง (เข้มงวดเฉพาะ not_matched)
    if (faceStatus === "not_matched") {
      alert(
        "ไม่สามารถลงเวลาได้ เนื่องจากใบหน้าไม่ตรงกับโปรไฟล์ กรุณาลองใหม่อีกครั้ง",
      );
      return;
    }

    setIsProcessing(true);
    try {
      let cloudinaryUrl = "";

      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.9),
          );
          if (blob) {
            const imageFile = new File([blob], "attendance-photo.jpg", {
              type: "image/jpeg",
            });
            const options = {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 800,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(imageFile, options);
            const uploadedUrl = await uploadFile(
              compressedFile,
              "attendance_photos",
            );
            if (uploadedUrl?.secure_url) cloudinaryUrl = uploadedUrl.secure_url;
          }
        }
      }

      if (!cloudinaryUrl) {
        alert(
          "🚨 ไม่สามารถบันทึกรูปภาพได้ กรุณาตรวจสอบการตั้งค่ากล้องแล้วลองใหม่อีกครั้ง",
        );
        setIsProcessing(false);
        return;
      }

      const payload = {
        lat: location?.lat,
        lng: location?.lng,
        photoUrl: cloudinaryUrl,
        deviceId: "device-12345",
        address: "Location Address",
        faceVerified: true, // Face check disabled by user request
      };

      const endpoint = isCheckIn
        ? "/api/attendance/check-in"
        : "/api/attendance/check-out";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (detectionIntervalRef.current)
          clearInterval(detectionIntervalRef.current);

        // บันทึกเวลาที่ลงสำเร็จ (จาก Server)
        const serverTimeStr = isCheckIn
          ? data.data.checkIn.time
          : data.data.checkOut.time;
        if (serverTimeStr) {
          setRecordedTime(
            new Date(serverTimeStr).toLocaleTimeString("th-TH", {
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
          );
        }

        setStatusMsg(
          isCheckIn
            ? "บันทึกเวลาเข้างานเรียบร้อยแล้ว!"
            : "บันทึกเวลาออกงานเรียบร้อยแล้ว!",
        );
        setIsCameraOpen(false);
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((t) => t.stop());
        }

        // 🚀 Automatic Redirect for Check-Out
        if (!isCheckIn) {
          setTimeout(() => router.push("/work-report"), 3000);
        }
      } else {
        alert("ทำรายการไม่สำเร็จ กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFaceStatusUI = () => {
    switch (faceStatus) {
      case "loading_models":
      case "loading_profile":
        return {
          icon: <Loader2 size={18} className="animate-spin" />,
          color: "bg-slate-50 text-slate-500 border-slate-200",
        };
      case "detecting":
        return {
          icon: <Loader2 size={18} className="animate-spin" />,
          color: "bg-blue-50 text-blue-600 border-blue-100",
        };
      case "matched":
        return {
          icon: <ShieldCheck size={18} />,
          color: "bg-green-50 text-green-700 border-green-200",
        };
      case "not_matched":
        return {
          icon: <ShieldX size={18} />,
          color: "bg-red-50 text-red-600 border-red-200",
        };
      case "no_profile":
      case "error":
        return {
          icon: <AlertCircle size={18} />,
          color: "bg-yellow-50 text-yellow-600 border-yellow-200",
        };
      default:
        return null;
    }
  };

  const faceStatusUI = getFaceStatusUI();
  const submitDisabled =
    isProcessing ||
    !location ||
    faceStatus === "not_matched" ||
    faceStatus === "loading_models" ||
    faceStatus === "loading_profile";

  const theme = isCheckIn
    ? {
        primary: "emerald",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        accent: "text-emerald-500",
        btn: "bg-emerald-500 shadow-emerald-500/30",
      }
    : {
        primary: "rose",
        bg: "bg-rose-50 dark:bg-rose-950/20",
        accent: "text-rose-500",
        btn: "bg-rose-500 shadow-rose-500/30",
      };

  return (
    <div
      className={`h-dvh md:min-h-screen ${theme.bg} py-4 md:py-8 px-4 font-sans transition-colors duration-1000 overflow-hidden relative flex flex-col items-center`}
    >
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-[10%] -left-[10%] w-[70%] h-[70%] ${isCheckIn ? "bg-emerald-500/10" : "bg-rose-500/10"} blur-[120px] rounded-full transition-colors duration-1000`}
        />
        <div
          className={`absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] ${isCheckIn ? "bg-teal-500/10" : "bg-orange-500/10"} blur-[120px] rounded-full transition-colors duration-1000`}
        />
      </div>

      <div className="w-full max-w-lg relative z-10 flex flex-col h-full max-h-full">
        {/* Top Navigation Hub */}
        <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isCameraOpen ? cancelAction() : router.back())}
            className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-all border border-white dark:border-zinc-800"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
              {isCheckIn ? "ลงเวลาเข้างาน" : "ลงเวลาออกงาน"}
            </h1>
            <div className="flex items-center justify-end gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isCheckIn ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`}
              />
              <p
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme.accent}`}
              >
                {isCheckIn ? "Presence In" : "Presence Out"}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {statusMsg ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              className="mt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[3.5rem] p-8 md:p-12 flex flex-col items-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-zinc-800 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 inset-x-0 h-2 ${isCheckIn ? "bg-emerald-500" : "bg-rose-500"} opacity-50`}
              />

              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${isCheckIn ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"} flex items-center justify-center mb-6 relative`}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle size={40} className={theme.accent} />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3 leading-tight tracking-tight">
                {statusMsg}
              </h2>

              <div className="space-y-1 text-center mb-8 bg-slate-50 dark:bg-zinc-800/50 py-4 px-8 rounded-3xl border border-slate-100 dark:border-zinc-800 w-full">
                <p className="text-slate-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] leading-none mb-1">
                  Server Confirmation Time
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
                  {recordedTime ||
                    (mounted
                      ? time.toLocaleTimeString("th-TH", { hour12: false })
                      : "--:--")}
                </p>
              </div>

              <div className="w-full space-y-3 md:space-y-4 pt-4 md:pt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={isCheckIn ? "/wfh" : "/work-report"}
                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 md:py-6 rounded-3xl md:rounded-4xl font-black text-xs md:text-sm uppercase tracking-[0.2em] text-center shadow-2xl block border border-transparent dark:hover:bg-zinc-100 transition-all"
                  >
                    {isCheckIn ? "Go to Dashboard" : "Create Work Report"}
                  </Link>
                </motion.div>

                {!isCheckIn && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[10px] text-blue-500 font-black uppercase tracking-widest animate-pulse"
                  >
                    Redirecting to report page in 3s...
                  </motion.p>
                )}
                <div className="pt-4 flex flex-col items-center gap-1 opacity-20">
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
                    KTLTC System • v1.2
                  </p>
                </div>
              </div>
            </motion.div>
          ) : !isCameraOpen ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 flex flex-col items-center shadow-2xl shadow-black/10 border border-slate-100 dark:border-zinc-800 text-center"
            >
              <div
                className={`w-28 h-28 rounded-3xl ${isCheckIn ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-rose-50 dark:bg-rose-500/10 text-rose-500"} flex items-center justify-center mb-8 shadow-inner border border-white dark:border-zinc-800 transition-transform duration-500 hover:rotate-6`}
              >
                <ScanFace size={60} />
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                {isCheckIn ? "ลงเวลาเข้างาน" : "ลงเวลาออกงาน"}
              </h3>
              <p className="text-slate-400 dark:text-zinc-500 text-sm font-medium mb-10 max-w-[240px]">
                {isCheckIn
                  ? "ระบบจะทำการถ่ายรูปและบันทึกพิกัด GPS เพื่อยืนยันการเข้างาน"
                  : "บันทึกเวลาเลิกทำงานวันนี้ และอัปโหลดรูปภาพยืนยัน"}
              </p>

              <div className="w-full space-y-4">
                {timeState.isLocked ? (
                  <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl text-rose-600 dark:text-rose-400">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                      <AlertCircle size={14} /> System Restricted
                    </p>
                    <p className="text-xs font-bold leading-relaxed">
                      {timeState.lockMsg}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={openCameraForAction}
                    className={`w-full ${theme.btn} text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl`}
                  >
                    <Camera size={20} />
                    <span>เปิดกล้องถ่ายรูป</span>
                  </button>
                )}
                <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-zinc-600">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    ลงเวลาระบบความปลอดภัยสูง
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-2 md:mt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] p-4 md:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-white dark:border-zinc-800 flex-1 overflow-hidden flex flex-col"
            >
              {/* Video Feed Glass Container */}
              <div className="w-full aspect-square bg-slate-900 rounded-4xl md:rounded-[3rem] overflow-hidden relative mb-4 md:mb-8 shadow-2xl border-4 border-white dark:border-zinc-800 group shrink-0">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Scan Overlay UI */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[80%] h-[70%] border-2 border-dashed border-white/30 rounded-3xl relative">
                    <div
                      className={`absolute top-0 inset-x-0 h-1 bg-white/40 blur-sm animate-[scan_2s_infinite]`}
                    />
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-xl" />
                  </div>
                </div>

                <div className="absolute bottom-4 inset-x-4">
                  {faceStatusUI && (
                    <div
                      className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-2xl backdrop-blur-xl border ${faceStatusUI.color} shadow-2xl`}
                    >
                      {faceStatusUI.icon}
                      <span>{faceMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Controls Selection */}
              <div className="space-y-2 md:space-y-4 mb-4 md:mb-10">
                {/* GPS Telemetry Badge */}
                <div
                  className={`flex items-center justify-between p-3 md:p-5 rounded-3xl md:rounded-[2.5rem] border transition-all duration-500 ${locationStatus === "found" ? "bg-emerald-500/5 border-emerald-500/20 shadow-inner" : "bg-slate-50 dark:bg-zinc-800/30 border-slate-100 dark:border-zinc-800"}`}
                >
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="relative shrink-0">
                      <motion.div
                        animate={
                          locationStatus === "searching"
                            ? { scale: [1, 1.1, 1] }
                            : {}
                        }
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl ${locationStatus === "found" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-zinc-700 text-slate-400"}`}
                      >
                        <MapPin size={18} />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 mb-0.5">
                        Location Protocol
                      </p>
                      <p
                        className={`text-xs md:text-sm font-black uppercase ${locationStatus === "found" ? "text-emerald-600 dark:text-emerald-400 tracking-tight" : "text-slate-500 font-bold"}`}
                      >
                        {locationStatus === "found"
                          ? "พบพิกัดตำแหน่งแล้ว"
                          : locationStatus === "searching"
                            ? "กำลังค้นหาพิกัด..."
                            : "เกิดข้อผิดพลาดในการโหลด"}
                      </p>
                    </div>
                  </div>
                  {locationStatus === "found" ? (
                    <ShieldCheck size={20} className="text-emerald-500" />
                  ) : (
                    <button
                      onClick={() => getLocation(false)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                      <Navigation size={18} />
                    </button>
                  )}
                </div>

                {locationStatus === "error" && (
                  <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 text-[10px] font-black uppercase rounded-xl flex items-center gap-2">
                    <Info size={12} /> {locationError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={submitAttendance}
                  disabled={submitDisabled}
                  className={`w-full h-16 rounded-3xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-3 transition-all ${submitDisabled ? "bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed" : `${theme.btn} text-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl`}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />{" "}
                      กำลังทำรายการ...
                    </>
                  ) : isCheckIn ? (
                    "ยืนยันลงเวลาเข้างาน"
                  ) : (
                    "ยืนยันลงเวลาออกงาน"
                  )}
                </button>

                <button
                  onClick={cancelAction}
                  className="w-full py-4 text-slate-400 dark:text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <X size={14} /> ยกเลิกรายการนี้
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx global>{`
          @keyframes scan {
            0% {
              top: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function UnifiedCheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          กำลังโหลดระบบกรุณารอสักครู่...
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
