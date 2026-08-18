"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  LogOut,
  Clock,
  CalendarDays,
  User,
  FileText,
  Camera,
  MapPin,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ShieldX,
  History,
  ClipboardList,
  AlertTriangle,
  X,
  AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { uploadFile } from "@/lib/upload";

type FaceStatus =
  | "idle"
  | "loading"
  | "detecting"
  | "no_face"
  | "unstable"
  | "ready";

export default function WFHHubPage() {
  const { data: session } = useSession();

  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    image: string | null;
  }>({
    name: "",
    image: null,
  });

  // Camera & Check-in state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [actionType, setActionType] = useState<"in" | "out" | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
  const [locationError, setLocationError] = useState("");
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("idle");
  const [faceMsg, setFaceMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceApiRef = useRef<any>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stableFramesCountRef = useRef(0);
  const lastFaceBoxRef = useRef<{ x: number; y: number } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [faceError, setFaceError] = useState("");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            name: data.name || data.username || "",
            image: data.image || null,
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();

    return () => clearInterval(timer);
  }, []);

  const userName = profileData.name || session?.user?.name || "พนักงาน (คุณ)";
  const userImage = profileData.image || session?.user?.image || null;

  const loadFaceApi = async () => {
    try {
      setFaceStatus("loading");
      setFaceMsg("กำลังเตรียมระบบ...");
      
      const faceApi = await import("@vladmandic/face-api");
      faceApiRef.current = faceApi;
      
      const MODEL_URL = "/models";
      await faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      
      setFaceStatus("detecting");
      setFaceMsg("กำลังสแกนใบหน้า...");
      startLiveDetection();
    } catch (err: any) {
      console.error("Face API Error:", err);
      setFaceError(err.message || "โหลดโมเดลไม่สำเร็จ");
      setFaceStatus("idle");
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
          setFaceStatus("ready");
          setFaceMsg("พร้อมถ่ายรูป");
        } else {
          setFaceStatus("detecting");
          setFaceMsg("กำลังสแกนใบหน้า...");
        }
      } catch (e) {
        console.error("Face detection error:", e);
      }
    }, 500);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("อุปกรณ์ไม่รองรับ GPS");
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
        setLocationStatus("error");
        setLocationError("ไม่สามารถจับพิกัดได้");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const openCamera = async (type: "in" | "out") => {
    setActionType(type);
    setIsCameraOpen(true);
    setStatusMsg("");
    getLocation();
    
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError("");
          await videoRef.current.play().catch(console.error);
          loadFaceApi();
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        setCameraError("ไม่สามารถเข้าถึงกล้องได้");
      }
    }, 100);
  };

  const cancelCamera = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setIsCameraOpen(false);
    setActionType(null);
    setFaceStatus("idle");
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  };

  const submitCheckIn = async () => {
    if (!location) {
      alert("❌ ไม่พบข้อมูลพิกัด GPS!\n\nกรุณารอให้ระบบค้นหาพิกัด หรือตรวจสอบว่าคุณได้เปิดตำแหน่ง (Location/GPS) ที่มือถือแล้ว");
      return;
    }
    
    // แจ้งเตือนเรื่องใบหน้า (ถ้ามี) แต่ยอมให้เช็คชื่อผ่านได้
    if (faceStatus !== "ready") {
      console.warn("Face not ready but proceeding:", faceStatus);
    }

    setIsProcessing(true);
    setStatusMsg("กำลังประมวลผล...");

    try {
      let photoUrl = "";
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
          if (blob) {
            const file = new File([blob], "wfh-photo.jpg", { type: "image/jpeg" });
            const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 800 });
            const uploadRes = await uploadFile(compressed, "attendance_photos");
            if (uploadRes?.secure_url) photoUrl = uploadRes.secure_url;
          }
        }
      }

      if (!photoUrl) {
        alert("ไม่สามารถอัปโหลดรูปภาพได้");
        setIsProcessing(false);
        return;
      }

      const endpoint = actionType === "in" ? "/api/attendance/check-in" : "/api/attendance/check-out";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location?.lat,
          lng: location?.lng,
          photoUrl,
          deviceId: navigator.userAgent.substring(0, 80),
          address: location ? `พิกัด: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "ไม่ระบุตำแหน่ง",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        setStatusMsg(`บันทึกเวลา${actionType === "in" ? "เข้างาน" : "ออกงาน"}สำเร็จ!`);
        setTimeout(() => {
          cancelCamera();
        }, 2000);
      } else {
        alert(data.message || "เช็คชื่อไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setIsProcessing(false);
    }
  };

  const faceUI = (() => {
    switch (faceStatus) {
      case "idle":
        if (faceError) return { icon: <AlertTriangle size={14} />, color: "bg-rose-50 text-rose-600" };
        return { icon: <AlertCircle size={14} />, color: "bg-slate-100 text-slate-500" };
      case "loading":
        return { icon: <Loader2 className="animate-spin" size={14} />, color: "bg-slate-100 text-slate-600" };
      case "detecting":
        return { icon: <Loader2 className="animate-spin" size={14} />, color: "bg-blue-100 text-blue-700 animate-pulse" };
      case "no_face":
      case "unstable":
      case "ready":
        return { icon: <ShieldCheck size={14} />, color: "bg-emerald-50 text-emerald-700 shadow-emerald-500/50 shadow-lg scale-110 transition-transform" };
      default:
        return null;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 px-2 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10 space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden border border-slate-100 dark:border-zinc-800 p-6 relative group"
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative group/avatar">
              <div className="h-20 w-20 rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-zinc-800 shadow-md flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <User size={32} className="text-slate-300 dark:text-zinc-700" />
                )}
              </div>
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-800 dark:text-white leading-none tracking-tight">{userName}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> WFH ACTIVE
              </span>
            </div>
          </div>
        </motion.div>

        {!isCameraOpen ? (
          <>
            {/* Clock Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-zinc-800 p-8 text-center"
            >
              <div className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white font-mono flex items-baseline justify-center gap-1">
                {mounted ? time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                <span className="text-2xl text-blue-500/40 font-bold ml-1">
                  {mounted ? time.getSeconds().toString().padStart(2, "0") : "--"}
                </span>
              </div>
              <div className="flex items-center justify-center text-slate-400 dark:text-zinc-500 gap-2 mt-4">
                <CalendarDays size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {mounted ? time.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "LOADING..."}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-1 px-6">
                ลงเวลาการปฏิบัติงาน
              </h3>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openCamera("in")} className="block group w-full text-left">
                <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 rounded-4xl flex items-center justify-between shadow-xl shadow-emerald-500/20">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner"><LogIn size={28} /></div>
                    <div>
                      <h2 className="font-black text-2xl text-white uppercase tracking-tight">ลงเวลาเข้างาน</h2>
                      <p className="text-emerald-50/70 text-[10px] font-bold uppercase tracking-widest">Punch in for today session</p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md group-hover:translate-x-1 transition-transform">
                    <Camera size={20} />
                  </div>
                </div>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openCamera("out")} className="block group w-full text-left">
                <div className="bg-linear-to-r from-orange-500 to-rose-600 p-6 rounded-4xl flex items-center justify-between shadow-xl shadow-orange-500/20">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner"><LogOut size={28} /></div>
                    <div>
                      <h2 className="font-black text-2xl text-white uppercase tracking-tight">ลงเวลาออกงาน</h2>
                      <p className="text-rose-50/70 text-[10px] font-bold uppercase tracking-widest">Punch out and end shift</p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md group-hover:translate-x-1 transition-transform">
                    <Camera size={20} />
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Feature Grid */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-1 px-6 mt-4">
                เมนูเพิ่มเติม (Management)
              </h3>
              
              <Link href="/wfh/history" className="block h-full">
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center gap-4 transition shadow-md hover:border-pink-200 dark:hover:border-pink-900/40">
                  <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-2xl text-pink-500"><History size={24} /></div>
                  <div>
                    <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">ประวัติของฉัน</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">My History</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/leave-request" className="block h-full">
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center gap-4 transition shadow-md hover:border-indigo-200">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl text-indigo-500"><CalendarDays size={24} /></div>
                  <div>
                    <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">แจ้งลางาน</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Leave Request</p>
                  </div>
                </div>
              </Link>

              <Link href="/work-report" className="block h-full">
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center gap-4 transition shadow-md hover:border-blue-200">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl text-blue-500"><ClipboardList size={24} /></div>
                  <div>
                    <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">แบบสรุปรายงานผลการปฏิบัติงาน</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Work Report</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        ) : (
          /* Camera UI */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 shadow-xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  {actionType === "in" ? "ลงเวลาเข้างาน" : "ลงเวลาออกงาน"}
                </h3>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${actionType === "in" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {actionType === "in" ? "CHECK-IN" : "CHECK-OUT"}
                </div>
              </div>
              
              <div className="w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden relative mb-4 shadow-inner border-2 border-slate-100 dark:border-zinc-800">
                {!cameraError ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />
                  </>
                ) : (
                  <div className="p-6 text-center text-rose-500 mt-20">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs mb-4">{cameraError}</p>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold"
                    >
                      วิธีแก้ปัญหา
                    </button>
                  </div>
                )}
                
                {/* Overlays */}
                <div className="absolute top-3 left-3 right-3 flex flex-col gap-1.5 pointer-events-none">
                  {faceUI && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${faceUI.color}`}>
                      {faceUI.icon} <span>{faceMsg}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${locationStatus === "found" ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500 animate-pulse"}`}>
                    <MapPin size={12} />
                    <span>{locationStatus === "searching" ? "กำลังตรวจพิกัด GPS..." : locationStatus === "found" ? "จับพิกัดแล้ว" : "ตรวจพิกัดขัดข้อง"}</span>
                  </div>
                </div>
                
                {statusMsg && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-center flex-col z-20">
                    <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
                    <h2 className="text-white text-xl font-bold">{statusMsg}</h2>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button onClick={cancelCamera} className="flex-1 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest">
                  ยกเลิก
                </button>
                <button 
                  disabled={isProcessing} 
                  onClick={submitCheckIn} 
                  className={`flex-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 ${actionType === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <span>ยืนยัน{actionType === "in" ? "เข้างาน" : "ออกงาน"}</span>}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
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
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <p className="font-bold text-amber-800 dark:text-amber-500 mb-2">1. สำหรับ iPhone / iPad (Safari)</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-700 dark:text-amber-400/80">
                    <li>แตะที่สัญลักษณ์ <strong>AA</strong> หรือรูป <strong>แม่กุญแจ</strong> บนแถบ URL ด้านบน หรือด้านล่าง</li>
                    <li>เลือก <strong>การตั้งค่าเว็บไซต์ (Website Settings)</strong></li>
                    <li>ตรง <strong>กล้อง (Camera)</strong> และ <strong>ตำแหน่ง (Location)</strong> ให้เปลี่ยนเป็น <strong>อนุญาต (Allow)</strong></li>
                    <li>กด <strong>เสร็จสิ้น (Done)</strong> แล้วโหลดหน้านี้ใหม่</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <p className="font-bold text-blue-800 dark:text-blue-500 mb-2">2. สำหรับ Android (Chrome)</p>
                  <ul className="list-disc pl-4 space-y-1 text-blue-700 dark:text-blue-400/80">
                    <li>แตะที่รูป <strong>แม่กุญแจ</strong> หรือ <strong>จุด 3 จุด</strong> มุมขวาบน</li>
                    <li>เลือก <strong>สิทธิ์ (Permissions)</strong></li>
                    <li>เปิดสวิตช์ <strong>กล้อง (Camera)</strong> และ <strong>ตำแหน่งที่ตั้ง (Location)</strong></li>
                    <li>รีเฟรชหน้าเว็บใหม่</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
