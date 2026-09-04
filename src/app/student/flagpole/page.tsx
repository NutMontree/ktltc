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
  X,
  QrCode,
  MonitorPlay,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { uploadFile } from "@/lib/upload";
import { getAccurateLocation } from "@/lib/geolocation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import StudentQRModal from "./StudentQRModal";
import StudentScannerModal from "./StudentScannerModal";

type FaceState = "idle" | "loading" | "detecting" | "no_face" | "unstable" | "ready";

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
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "searching" | "found" | "error">(
    "idle",
  );
  const [locationError, setLocationError] = useState("");
  const [faceState, setFaceState] = useState<FaceState>("idle");
  const [faceError, setFaceError] = useState("");
  const [recordedTime, setRecordedTime] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [timeState, setTimeState] = useState({
    isLocked: false,
    lockMsg: "",
    canProceed: true,
  });

  const [isStudentQRModalOpen, setIsStudentQRModalOpen] = useState(false);
  const [isStudentScannerModalOpen, setIsStudentScannerModalOpen] = useState(false);

  const [flagpoleConfig, setFlagpoleConfig] = useState({
    checkInStart: "07:00",
    lateThreshold: "08:00",
    checkInEnd: "08:45",
    inSiteDistance: 200,
    closedDays: [0, 6],
    lat: 14.754043,
    lng: 104.65807,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceApiRef = useRef<any>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFaceBoxRef = useRef<{ x: number; y: number } | null>(null);
  const stableFramesCountRef = useRef<number>(0);
  const nativeFileInputRef = useRef<HTMLInputElement>(null);

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


  const loadFaceApi = async () => {
    try {
      setFaceState("loading");
      const faceApi = await import("@vladmandic/face-api");
      faceApiRef.current = faceApi;
      const MODEL_URL = "/models";
      await faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      
      setFaceState("detecting");
      startLiveDetection();
    } catch (err: any) {
      console.error("Face API Error:", err);
      setFaceError(err.message || "โหลดโมเดลไม่สำเร็จ");
      setFaceState("idle");
    }
  };

  const startLiveDetection = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    stableFramesCountRef.current = 0;
    lastFaceBoxRef.current = null;

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceApiRef.current) return;
      if (videoRef.current.readyState < 2) return;

      try {
        const faceApi = faceApiRef.current;
        const detection = await faceApi.detectSingleFace(
          videoRef.current,
          new faceApi.SsdMobilenetv1Options({ minConfidence: 0.75 })
        );

        if (canvasRef.current && videoRef.current) {
          const dims = faceApi.matchDimensions(canvasRef.current, videoRef.current, true);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          if (detection) {
            const resizedDetections = faceApi.resizeResults(detection, dims);
            faceApi.draw.drawDetections(canvasRef.current, resizedDetections);
          }
        }

        if (detection) {
          setFaceState("ready");
        } else {
          setFaceState("detecting");
        }
      } catch (e) {
        console.error("Face detection error:", e);
      }
    }, 500);
  };

  const getDistanceToFlagpole = () => {
    if (!location || !flagpoleConfig.lat || !flagpoleConfig.lng) return null;
    const R = 6371e3; // meters
    const φ1 = (flagpoleConfig.lat * Math.PI) / 180;
    const φ2 = (location.lat * Math.PI) / 180;
    const Δφ = ((location.lat - flagpoleConfig.lat) * Math.PI) / 180;
    const Δλ = ((location.lng - flagpoleConfig.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const getLocation = async () => {
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
      setLocation({ lat: flagpoleConfig.lat, lng: flagpoleConfig.lng });
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: 640, height: 480 },
          });
          setCameraError("");
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((e) => console.error(e));
          loadFaceApi();
          getLocation();
        } catch (err: any) {
          console.error("Camera Error:", err);
          let errMsg = "ไม่สามารถเข้าถึงกล้องหน้าได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์";
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            errMsg = "กล้องถูกบล็อก! กรุณากดรูปแม่กุญแจ 🔒 บนแถบ URL เพื่อเปิดอนุญาตกล้อง (Camera) แล้วรีเฟรชหน้าเว็บ";
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            errMsg = "ไม่พบอุปกรณ์กล้องในเครื่องของคุณ";
          }
          setCameraError(errMsg);
        }
      }
    };

    if (isCameraOpen) startCamera();

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isCameraOpen]);

  const submitCheckIn = async () => {
    setIsProcessing(true);
    setStatusMsg("กำลังตรวจสอบพิกัด GPS ความแม่นยำสูง...");

    // ดึงพิกัด GPS แม่นยำสูง 100%
    const geo = await getAccurateLocation(6000);
    const finalLocation = { lat: geo.lat, lng: geo.lng };
    setLocation(finalLocation);

    // 1. ตรวจสอบว่ามีพิกัด GPS จริงหรือไม่
    if (!finalLocation || !finalLocation.lat || !finalLocation.lng) {
      alert("❌ ไม่พบพิกัด GPS ที่แม่นยำ!\n\nกรุณาเปิด ตำแหน่งที่ตั้ง (GPS) บนอุปกรณ์ แล้วลองใหม่อีกครั้ง");
      setIsProcessing(false);
      return;
    }

    // 2. ตรวจสอบระยะห่างจากหน้าเสาธงอย่างเข้มงวด (Strict Distance Enforcement)
    if (flagpoleConfig.lat && flagpoleConfig.lng) {
      const R = 6371e3; // meters
      const φ1 = (flagpoleConfig.lat * Math.PI) / 180;
      const φ2 = (finalLocation.lat * Math.PI) / 180;
      const Δφ = ((finalLocation.lat - flagpoleConfig.lat) * Math.PI) / 180;
      const Δλ = ((finalLocation.lng - flagpoleConfig.lng) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const currentDist = R * c;

      // คำนวณระยะห่างเพื่อส่งบันทึกอย่างแม่นยำ
    }

    setStatusMsg("กำลังถ่ายภาพและส่งข้อมูล...");
    try {
      let photoUrl = "";

      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
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
        alert("ไม่สามารถถ่ายหรืออัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/flagpole/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: finalLocation.lat,
          lng: finalLocation.lng,
          photoUrl,
          deviceId: navigator.userAgent.substring(0, 80),
          address: `พิกัด: ${finalLocation.lat.toFixed(6)}, ${finalLocation.lng.toFixed(6)}`,
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
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });
      const uploadRes = await uploadFile(compressed, "attendance_photos");
      const photoUrl = uploadRes?.secure_url;

      if (!photoUrl) {
        alert("ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/flagpole/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: finalLocation.lat,
          lng: finalLocation.lng,
          photoUrl,
          deviceId: navigator.userAgent.substring(0, 80),
          address: `พิกัด: ${finalLocation.lat.toFixed(6)}, ${finalLocation.lng.toFixed(6)}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        setIsCameraOpen(false);
        setStatusMsg("เช็คชื่อเข้าแถวเรียบร้อยแล้ว!");
        loadStudentData();
      } else {
        alert(data.message || "เช็คชื่อไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelCheckIn = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setIsCameraOpen(false);
  };

  const getFaceStateUI = () => {
    switch (faceState) {
      case "idle":
        if (faceError) return { icon: <AlertTriangle size={13} />, text: `AI: ${faceError}`, color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800" };
        return { icon: <AlertCircle size={13} />, text: "ระบบพร้อมใช้งาน", color: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700" };
      case "loading":
        return { icon: <Loader2 size={13} className="animate-spin" />, text: "กำลังเตรียม AI...", color: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700" };
      case "detecting":
        return { icon: <ScanFace size={13} className="animate-pulse" />, text: "กำลังสแกนใบหน้า...", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" };
      case "ready":
      default:
        return { icon: <CheckCircle2 size={13} />, text: "ตรวจพบใบหน้าพร้อมถ่ายรูป", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" };
    }
  };

  const faceUI = getFaceStateUI();

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
      <StudentQRModal 
        isOpen={isStudentQRModalOpen} 
        onClose={() => setIsStudentQRModalOpen(false)} 
        userId={user?.id || ""} 
        name={profileData.name} 
        studentId={profileData.studentId} 
      />
      <StudentScannerModal 
        isOpen={isStudentScannerModalOpen} 
        onClose={() => setIsStudentScannerModalOpen(false)} 
        onSuccess={() => loadStudentData()} 
      />

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
                      <div className="w-full space-y-3 flex flex-col items-center">
                        <button
                          onClick={() => setIsCameraOpen(true)}
                          className="w-full bg-linear-to-r from-indigo-500 to-blue-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/25"
                        >
                          <Camera size={18} />
                          สแกนใบหน้าและ GPS 🇹🇭
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 w-full mt-2">
                          <button
                            onClick={() => setIsStudentQRModalOpen(true)}
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all"
                          >
                            <QrCode size={18} className="text-indigo-500" />
                            เปิด QR ให้ครูสแกน
                          </button>
                          
                          <button
                            onClick={() => setIsStudentScannerModalOpen(true)}
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all"
                          >
                            <MonitorPlay size={18} className="text-emerald-500" />
                            สแกนจอทีวีครู
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Camera active check-in flow */
                  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 shadow-xl border border-slate-100 dark:border-zinc-800 flex flex-col">
                    <div className="w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden relative mb-4 shadow-inner border-2 border-slate-100 dark:border-zinc-800 flex items-center justify-center">
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
                              onClick={() => window.location.reload()} 
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

                      {/* Video Container (Pure Viewport - No blocking overlays on top of face) */}
                    </div>

                    {/* Status & Diagnostics Strip (Below Video) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                      {faceUI && (
                        <div
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl text-[11px] font-black uppercase tracking-wider ${faceUI.color} shadow-xs`}
                        >
                          {faceUI.icon}
                          <span>{faceUI.text}</span>
                        </div>
                      )}

                      <div
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl text-[11px] font-black uppercase tracking-wider ${
                          locationStatus === "found"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                            : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 animate-pulse"
                        } shadow-xs`}
                      >
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">
                          {locationStatus === "searching" && "กำลังตรวจพิกัด GPS..."}
                          {locationStatus === "found" &&
                            (() => {
                              const dist = getDistanceToFlagpole();
                              if (dist !== null) {
                                return `จับพิกัดแล้ว (ห่างจากเสาธง ${Math.round(dist)} ม.)`;
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

                    {(() => {
                      const dist = getDistanceToFlagpole();
                      if (dist !== null && dist > flagpoleConfig.inSiteDistance) {
                        return (
                          <div className="flex flex-col gap-2 mb-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-2xl text-[10px] font-bold flex gap-3 border border-amber-200 dark:border-amber-800/40 text-left shadow-sm">
                              <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black">📍 ห่างจากหน้าเสาธง {Math.round(dist)} เมตร</span>
                                <span className="leading-relaxed text-[10px]">ระบบจับพิกัดความแม่นยำสูงเรียบร้อยแล้ว สามารถกดถ่ายรูปเพื่อบันทึกประวัติได้ทันที</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={cancelCheckIn}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button
                        disabled={isProcessing}
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
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1. เผลอกด "ไม่อนุญาต"</h4>
                  <p className="text-[11px] leading-relaxed">
                    - <strong>iPhone/Safari:</strong> กด <span className="text-blue-500 font-bold bg-blue-50 px-1 rounded">aA</span> ที่ช่อง URL ด้านบนสุด &gt; เลือก "การตั้งค่าเว็บไซต์" &gt; อนุญาต กล้อง/ตำแหน่ง
                    <br />
                    - <strong>Android/Chrome:</strong> กดรูป <span className="font-bold bg-slate-200 px-1 rounded">🔒</span> ที่ช่อง URL &gt; เลือก "การอนุญาต" &gt; อนุญาต กล้อง/ตำแหน่ง
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 2. เปิดเว็บจากแอป LINE</h4>
                  <p className="text-[11px] leading-relaxed">
                    แอป LINE มักจะบล็อกกล้องอัตโนมัติ ให้กดจุด 3 จุด <span className="font-bold text-indigo-500 bg-indigo-50 px-1 rounded">⋮</span> ที่มุมขวาบนจอ แล้วเลือก <strong>"เปิดในเบราว์เซอร์ (Open in Browser)"</strong>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3. ไม่ได้เปิด GPS เครื่อง</h4>
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
  );
}
