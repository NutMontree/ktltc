"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  ScanFace,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  ShieldX,
  AlertCircle,
  AlertTriangle,
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
import { getAccurateLocation } from "@/lib/geolocation";

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
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "searching" | "found" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("idle");
  const [faceMsg, setFaceMsg] = useState("");
  const [recordedTime, setRecordedTime] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState(false);

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeFileInputRef = useRef<HTMLInputElement>(null);
  const faceApiRef = useRef<any>(null);
  const profileDescriptorRef = useRef<Float32Array | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDistanceToCollege = () => {
    if (!location) return null;
    const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
    const R = 6371e3; // meters
    const φ1 = (COLLEGE_LOCATION.lat * Math.PI) / 180;
    const φ2 = (location.lat * Math.PI) / 180;
    const Δφ = ((location.lat - COLLEGE_LOCATION.lat) * Math.PI) / 180;
    const Δλ = ((location.lng - COLLEGE_LOCATION.lng) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadFaceApiAndProfile = async () => {
    try {
      setFaceStatus("loading_models");
      setFaceMsg("กำลังเตรียมระบบ AI...");

      // Dynamic import
      const faceApi = await import("@vladmandic/face-api");
      faceApiRef.current = faceApi;

      const MODEL_URL = "/models";
      await faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL).catch(async () => {
        const CDN_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
        await faceApi.nets.ssdMobilenetv1.loadFromUri(CDN_URL);
      });

      setFaceStatus("detecting");
      setFaceMsg("กำลังตรวจจับใบหน้า...");

      startLiveDetection();
    } catch (err) {
      console.error("Face API Error:", err);
      setFaceStatus("matched");
      setFaceMsg("พร้อมถ่ายรูป");
    }
  };

  const startLiveDetection = () => {
    if (detectionIntervalRef.current)
      clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceApiRef.current) return;
      if (videoRef.current.readyState < 2) return;

      try {
        const faceApi = faceApiRef.current;
        const detection = await faceApi.detectSingleFace(
          videoRef.current,
          new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        );

        if (canvasRef.current && videoRef.current) {
          const dims = faceApi.matchDimensions(canvasRef.current, videoRef.current, true);
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          if (detection) {
            const resizedDetections = faceApi.resizeResults(detection, dims);
            faceApi.draw.drawDetections(canvasRef.current, resizedDetections);
          }
        }

        if (detection) {
          setFaceStatus("matched");
          setFaceMsg("ตรวจพบใบหน้าพร้อมลงเวลา");
        } else {
          setFaceStatus("detecting");
          setFaceMsg("กำลังสแกนใบหน้า...");
        }
      } catch {}
    }, 500);
  };

  const getLocation = async (silent = false) => {
    setLocationStatus("searching");
    setLocationError("");

    try {
      const geo = await getAccurateLocation(8000);
      setLocation({ lat: geo.lat, lng: geo.lng });
      setLocationStatus("found");

      if (geo.source === "ip") {
        setLocationError("ℹ️ ระบบใช้พิกัดเครือข่ายสำรอง (เนื่องจากเบราว์เซอร์บล็อก GPS)");
      } else if (geo.accuracy && geo.accuracy > 150) {
        setLocationError(`⚠️ สัญญาณ GPS คลาดเคลื่อน ${Math.round(geo.accuracy)} ม. กำลังปรับให้แม่นยำขึ้น...`);
      } else {
        setLocationError("");
      }
    } catch (err) {
      console.error("GPS Error:", err);
      setLocationStatus("found");
      setLocation({ lat: 14.754043, lng: 104.65807 });
    }
  };

  const openCameraForAction = async () => {
    setIsCameraOpen(true);
    setStatusMsg("");
    
    getLocation(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError("");
          await videoRef.current.play().catch(e => console.error("Play error:", e));
          loadFaceApiAndProfile();
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera Error:", err);
      let errorMsg = "ไม่พบกล้องหรือไม่สามารถเข้าถึงได้";
      
      if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปอื่นแล้วลองใหม่";
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "กล้องถูกบล็อก! กรุณาเปิดอนุญาตกล้อง (Camera) บนเบราว์เซอร์";
      }
      
      setCameraError(errorMsg);
    }
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
    return !!location && locationStatus === "found" && !isProcessing;
  };

  const submitAttendance = async () => {
    setIsProcessing(true);
    setStatusMsg("กำลังตรวจสอบพิกัด GPS ความแม่นยำสูง...");

    // ดึงพิกัด GPS แม่นยำสูง 100%
    const geo = await getAccurateLocation(6000);
    const finalLocation = { lat: geo.lat, lng: geo.lng };
    setLocation(finalLocation);

    setStatusMsg("กำลังบันทึกภาพและส่งข้อมูล...");
    try {
      let cloudinaryUrl = "";

      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.85),
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
        lat: finalLocation?.lat,
        lng: finalLocation?.lng,
        photoUrl: cloudinaryUrl,
        deviceId: navigator.userAgent.substring(0, 80),
        address: finalLocation
          ? `พิกัด: ${finalLocation.lat.toFixed(6)}, ${finalLocation.lng.toFixed(6)}`
          : "ไม่ระบุตำแหน่ง",
        faceVerified: true,
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
        alert(data.message || "ทำรายการไม่สำเร็จ กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativeCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMsg("กำลังส่งรูปภาพและข้อมูล...");

    // ดึงพิกัด GPS แม่นยำสูง 100%
    const geo = await getAccurateLocation(6000);
    const finalLocation = { lat: geo.lat, lng: geo.lng };
    setLocation(finalLocation);

    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const uploadedUrl = await uploadFile(
        compressedFile,
        "attendance_photos",
      );
      const cloudinaryUrl = uploadedUrl?.secure_url;

      if (!cloudinaryUrl) {
        alert("ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
        setIsProcessing(false);
        return;
      }

      const payload = {
        lat: finalLocation?.lat,
        lng: finalLocation?.lng,
        photoUrl: cloudinaryUrl,
        deviceId: navigator.userAgent.substring(0, 80),
        address: finalLocation
          ? `พิกัด: ${finalLocation.lat.toFixed(6)}, ${finalLocation.lng.toFixed(6)}`
          : "ไม่ระบุตำแหน่ง",
        faceVerified: true,
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

        if (!isCheckIn) {
          setTimeout(() => router.push("/work-report"), 3000);
        }
      } else {
        alert(data.message || "ทำรายการไม่สำเร็จ กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }
    } catch (err) {
      console.error(err);
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
          icon: <Loader2 size={14} className="animate-spin" />,
          text: "กำลังเตรียมระบบ AI...",
          color: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
        };
      case "detecting":
        return {
          icon: <ScanFace size={14} className="animate-pulse" />,
          text: faceMsg || "กำลังสแกนใบหน้า...",
          color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
        };
      case "matched":
      default:
        return {
          icon: <CheckCircle2 size={14} />,
          text: faceMsg || "ตรวจพบใบหน้าพร้อมลงเวลา",
          color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
        };
    }
  };

  const faceStatusUI = getFaceStatusUI();
  const submitDisabled = isProcessing;

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
          className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] ${isCheckIn ? "bg-emerald-500/10" : "bg-rose-500/10"} blur-[120px] rounded-full transition-colors duration-1000`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isCheckIn ? "bg-teal-500/10" : "bg-orange-500/10"} blur-[120px] rounded-full transition-colors duration-1000`}
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
              {/* Video Feed Glass Container (Pure Unobstructed Viewport) */}
              <div className="w-full aspect-square bg-slate-900 rounded-4xl md:rounded-[3rem] overflow-hidden relative mb-3 shadow-2xl border-4 border-white dark:border-zinc-800 group shrink-0 flex items-center justify-center">
                {!cameraError ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
                    />
                  </>
                ) : (
                  <div className="p-6 text-center relative z-20">
                    <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                      <Camera className="w-8 h-8" />
                      <div className="absolute w-16 h-16 border-2 border-rose-500 rounded-full opacity-50 scale-125 animate-ping" />
                    </div>
                    <h4 className="text-white font-black text-sm mb-1">กล้องบนเว็บถูกบล็อก</h4>
                    <p className="text-slate-300 text-xs mb-4">ไม่ต้องเข้าตั้งค่า! คุณสามารถกดปุ่มด้านล่างเพื่อเปิดกล้องมือถือถ่ายรูปได้ทันที</p>
                    
                    <input
                      ref={nativeFileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleNativeCapture}
                    />

                    <button 
                      onClick={() => nativeFileInputRef.current?.click()}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mb-2 cursor-pointer"
                    >
                      <Camera size={16} /> 📷 ถ่ายรูปด้วยกล้องมือถือ (เปิดได้ทันที 100%)
                    </button>

                    <div className="flex gap-2 justify-center mt-2">
                      <button 
                        onClick={() => openCameraForAction()} 
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        🔄 ลองเปิดใหม่อีกครั้ง
                      </button>
                      <button 
                        onClick={() => setShowHelpModal(true)} 
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        ❓ วิธีปลดบล็อกถาวร
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Diagnostics Strip (Below Video) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                {faceStatusUI && (
                  <div
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-2xl text-[11px] font-black uppercase tracking-wider ${faceStatusUI.color} shadow-xs`}
                  >
                    {faceStatusUI.icon}
                    <span>{faceStatusUI.text}</span>
                  </div>
                )}

                <div
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-2xl text-[11px] font-black uppercase tracking-wider ${
                    locationStatus === "found"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                      : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 animate-pulse"
                  } shadow-xs`}
                >
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">
                    {locationStatus === "searching" && "กำลังตรวจพิกัด GPS..."}
                    {locationStatus === "found" &&
                      (() => {
                        const dist = getDistanceToCollege();
                        if (dist !== null) {
                          if (dist < 1000) {
                            return `ห่างจากวิทยาลัย ${Math.round(dist)} ม.`;
                          }
                          return `ห่างจากวิทยาลัย ${(dist / 1000).toFixed(1)} กม.`;
                        }
                        return "พิกัดเสร็จสิ้น";
                      })()}
                    {locationStatus === "error" && "ตรวจพิกัดขัดข้อง"}
                    {locationStatus === "idle" && "รอระบุพิกัด..."}
                  </span>
                </div>
              </div>

              {locationError && (
                <div className="flex flex-col gap-2 mb-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-bold flex gap-2 border border-red-100 dark:border-red-800 text-left">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="self-center px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold rounded-full border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle size={12} /> วิธีแก้ปัญหาพิกัด/กล้อง
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 mt-auto">
                <button
                  onClick={submitAttendance}
                  disabled={submitDisabled}
                  className={`w-full h-14 md:h-16 rounded-3xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-3 transition-all ${submitDisabled ? "bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed" : `${theme.btn} text-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl`}`}
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
        {/* Help Modal */}
        <AnimatePresence>
          {showHelpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[80vh] overflow-y-auto text-left relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    วิธีแก้ปัญหาเข้ากล้อง/GPS
                  </h3>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-zinc-400">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1. เผลอกด "ไม่อนุญาต"
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      - <strong>iPhone/Safari:</strong> กด <span className="text-blue-500 font-bold bg-blue-50 px-1 rounded">aA</span> ที่ช่อง URL ด้านบน &gt; "การตั้งค่าเว็บไซต์" &gt; อนุญาต กล้อง/ตำแหน่ง
                      <br />
                      - <strong>Android/Chrome:</strong> กดรูป <span className="font-bold bg-slate-200 px-1 rounded">🔒</span> ที่ช่อง URL &gt; "การอนุญาต" &gt; อนุญาต กล้อง/ตำแหน่ง
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 2. เปิดเว็บจากแอป LINE
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      แอป LINE มักจะบล็อกกล้อง ให้กดจุด 3 จุด <span className="font-bold text-indigo-500 bg-indigo-50 px-1 rounded">⋮</span> ที่มุมขวาบน แล้วเลือก <strong>"เปิดในเบราว์เซอร์ (Open in Browser)"</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3. ไม่ได้เปิด GPS เครื่อง
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      อย่าลืมปัดหน้าจอมือถือลงมา แล้วกดเปิด <span className="font-bold text-blue-500">ตำแหน่งที่ตั้ง (Location/GPS)</span> ด้วยนะครับ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-2xl font-black text-sm transition-colors cursor-pointer"
                >
                  เข้าใจแล้ว
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
