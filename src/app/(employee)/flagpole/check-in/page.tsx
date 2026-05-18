"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { uploadFile } from "@/lib/upload";

type FaceStatus =
  | "idle"
  | "loading_models"
  | "loading_profile"
  | "no_profile"
  | "detecting"
  | "matched"
  | "not_matched"
  | "error";

export default function FlagpoleCheckInPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

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

  // --- Attendance Time Validation (Thai Time) ---
  const [timeState, setTimeState] = useState({
    isLocked: false,
    lockMsg: "",
    canProceed: true,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      if (loadingConfig) return;

      // กฎเกณฑ์เวลาเข้าแถวหน้าเสาธง
      const config = {
        flagStart: "07:00",
        flagLate: "08:00",
        flagClose: "08:45",
      };

      const toNum = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 100 + m;
      };

      const rules = {
        start: toNum(config.flagStart),
        close: toNum(config.flagClose),
      };

      // เวลาประเทศไทย (ICT)
      const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const val = thNow.getUTCHours() * 100 + thNow.getUTCMinutes();

      let locked = false;
      let msg = "";
      let canAction = true;

      // วันเสาร์-อาทิตย์ ปิดระบบการเข้าแถวโดยอัตโนมัติ
      const thDay = thNow.getUTCDay();
      if (thDay === 0 || thDay === 6) {
        locked = true;
        msg = "วันนี้เป็นวันหยุดสุดสัปดาห์ ไม่ต้องเช็คชื่อเข้าแถวหน้าเสาธง";
        canAction = false;
      } else if (val < rules.start) {
        locked = true;
        msg = `ยังไม่ถึงเวลากิจกรรมเช็คชื่อเข้าแถว (ระบบเปิดเช็คชื่อเวลา ${config.flagStart} น.)`;
        canAction = false;
      } else if (val > rules.close) {
        locked = true;
        msg = `หมดช่วงเวลาเช็คชื่อเข้าแถวหน้าเสาธงแล้ว (ระบบปิดให้บริการเมื่อเวลา ${config.flagClose} น.)`;
        canAction = false;
      }

      setTimeState({ isLocked: locked, lockMsg: msg, canProceed: canAction });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadingConfig]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceApiRef = useRef<any>(null);
  const profileDescriptorRef = useRef<Float32Array | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setFaceMsg("กำลังโหลดข้อมูลโปรไฟล์...");

      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("ไม่สามารถโหลดโปรไฟล์ได้");
      const profile = await res.json();

      if (!profile.image) {
        setFaceStatus("no_profile");
        setFaceMsg("ไม่พบรูปโปรไฟล์ — ระบบข้ามการตรวจสอบใบหน้า");
        return;
      }

      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = profile.image;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const detection = await faceApi
        .detectSingleFace(img, new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceMsg("ไม่พบใบหน้าในรูปโปรไฟล์ — ระบบข้ามการตรวจสอบใบหน้า");
        return;
      }

      profileDescriptorRef.current = detection.descriptor;
      setFaceStatus("detecting");
      setFaceMsg("กำลังตรวจสอบใบหน้า...");

      startLiveDetection();
    } catch (err) {
      console.error("Face API Error:", err);
      setFaceStatus("error");
      setFaceMsg("ระบบตรวจสอบใบหน้ามีปัญหา — ข้ามการตรวจสอบ");
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
            setFaceMsg(`✅ ยืนยันตัวตนสำเร็จ (ความแม่นยำ ${Math.round((1 - distance) * 100)}%)`);
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
      maximumAge: 0,
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
        else if (err.code === 2) setLocationError("ไม่สามารถระบุพิกัดได้ (ลองออกมาในที่โล่งแจ้ง)");
        else if (err.code === 3)
          setLocationError("ขอพิกัด GPS หมดเวลา (Timeout) กรุณากดลองใหม่อีกครั้ง");
        else setLocationError("เกิดข้อผิดพลาดในการโหลด GPS");
      },
      options,
    );
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch((e) => console.error("Play error:", e));
          }

          // โหลด Face API ทันที
          loadFaceApiAndProfile();
          getLocation(true);
        } catch (err: any) {
          console.error("Camera Error:", err);
          let errorMsg = "ไม่พบกล้องหรือไม่สามารถเข้าถึงได้";
          if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            errorMsg = "กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปอื่นแล้วลองใหม่";
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
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen]);

  const openCameraForAction = () => {
    setIsCameraOpen(true);
    setStatusMsg("");
  };

  const cancelAction = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setIsCameraOpen(false);
    setFaceStatus("idle");
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
  };

  const submitAttendance = async () => {
    if (faceStatus === "not_matched") {
      alert("ไม่สามารถบันทึกได้ เนื่องจากใบหน้าไม่ตรงกับโปรไฟล์ กรุณาลองใหม่อีกครั้ง");
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
            const imageFile = new File([blob], "flagpole-photo.jpg", { type: "image/jpeg" });
            const options = {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 800,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(imageFile, options);
            const uploadedUrl = await uploadFile(compressedFile, "attendance_photos");
            if (uploadedUrl?.secure_url) cloudinaryUrl = uploadedUrl.secure_url;
          }
        }
      }

      if (!cloudinaryUrl) {
        alert("🚨 ไม่สามารถบันทึกรูปภาพได้ กรุณาตรวจสอบการตั้งค่ากล้องแล้วลองใหม่อีกครั้ง");
        setIsProcessing(false);
        return;
      }

      const payload = {
        lat: location?.lat,
        lng: location?.lng,
        photoUrl: cloudinaryUrl,
        deviceId: "device-flagpole",
        address: "บริเวณหน้าเสาธง KTLTC",
      };

      const res = await fetch("/api/flagpole/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        const serverTimeStr = data.data.checkIn.time;
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

        setStatusMsg("บันทึกข้อมูลการเข้าแถวหน้าเสาธงเรียบร้อยแล้ว!");
        setIsCameraOpen(false);
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((t) => t.stop());
        }

        // นำทางไปยังหน้าประวัติกิจกรรมเสาธงใน 3 วินาที
        setTimeout(() => router.push("/flagpole/history"), 3000);
      } else {
        alert(data.message || "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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

  return (
    <div className="h-dvh md:min-h-screen bg-indigo-50/50 dark:bg-zinc-950 py-4 md:py-8 px-4 font-sans overflow-hidden relative flex flex-col items-center">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10 flex flex-col h-full max-h-full">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isCameraOpen ? cancelAction() : router.back())}
            className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 text-slate-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-white border border-white dark:border-zinc-800"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
              ลงชื่อเข้าแถวเสาธง
            </h1>
            <div className="flex items-center justify-end gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500">
                Flagpole Presence
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
              <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600 opacity-50" />
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle size={40} className="text-indigo-500" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3 leading-tight tracking-tight">
                {statusMsg}
              </h2>

              <div className="space-y-1 text-center mb-8 bg-slate-50 dark:bg-zinc-800/50 py-4 px-8 rounded-3xl border border-slate-100 dark:border-zinc-800 w-full font-mono">
                <p className="text-slate-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] leading-none mb-1">
                  Server Confirmation Time
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {recordedTime ||
                    (mounted ? time.toLocaleTimeString("th-TH", { hour12: false }) : "--:--")}
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <Link
                  href="/flagpole/history"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 md:py-6 rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] text-center shadow-xl shadow-indigo-600/20 block transition-all"
                >
                  ไปหน้าประวัติกิจกรรม
                </Link>
                <p className="text-center text-[10px] text-indigo-500 font-black uppercase tracking-widest animate-pulse mt-2">
                  ระบบกำลังนำทางไปหน้าประวัติใน 3 วินาที...
                </p>
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
              <div className="w-28 h-28 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-8 shadow-inner border border-white dark:border-zinc-800 hover:rotate-6 transition-all duration-300">
                <ScanFace size={60} />
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                ลงเวลาเข้าร่วมกิจกรรม
              </h3>
              <p className="text-slate-400 dark:text-zinc-500 text-sm font-medium mb-10 max-w-[240px]">
                โปรดเปิดกล้องและ GPS เพื่อยืนยันพิกัดเข้าแถวบริเวณหน้าเวทีโดมอเนกประสงค์
              </p>

              <div className="w-full space-y-4">
                {timeState.isLocked ? (
                  <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl text-rose-600 dark:text-rose-400">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                      <AlertCircle size={14} /> ระบบเข้าแถวปิดบริการ
                    </p>
                    <p className="text-xs font-bold leading-relaxed">{timeState.lockMsg}</p>
                  </div>
                ) : (
                  <button
                    onClick={openCameraForAction}
                    className="w-full bg-linear-to-r from-indigo-500 to-blue-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20"
                  >
                    <Camera size={20} />
                    <span>เปิดกล้องถ่ายรูปเช็คชื่อ</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-2 md:mt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] p-4 md:p-8 shadow-2xl border border-white dark:border-zinc-800 flex-1 overflow-hidden flex flex-col"
            >
              {/* Video container */}
              <div className="w-full aspect-square bg-slate-900 rounded-4xl overflow-hidden relative mb-4 md:mb-6 shadow-xl border-4 border-white dark:border-zinc-800 shrink-0">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Status Overlays */}
                <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 pointer-events-none">
                  {/* Face detection tag */}
                  {faceStatusUI && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md ${faceStatusUI.color}`}
                    >
                      {faceStatusUI.icon}
                      <span>{faceMsg}</span>
                    </div>
                  )}

                  {/* Geolocation Tag */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                      locationStatus === "found"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : locationStatus === "searching"
                          ? "bg-slate-50 text-slate-500 border-slate-200 animate-pulse"
                          : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    <MapPin size={16} />
                    <span>
                      {locationStatus === "searching" && "กำลังค้นหาตำแหน่ง GPS..."}
                      {locationStatus === "found" && `พิกัดระบุตำแหน่งเรียบร้อย`}
                      {locationStatus === "error" && "พิกัดขัดข้อง"}
                      {locationStatus === "idle" && "รอพิกัด..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Instructions and Action */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {locationError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold flex gap-2 border border-red-100">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{locationError}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-zinc-850 p-4 rounded-3xl border border-slate-100 dark:border-zinc-850 flex items-center justify-between text-left">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
                        ระบบเข้าแถวเสาธงอ้างอิง WFH
                      </p>
                      <p className="text-xs font-black text-slate-800 dark:text-zinc-300">
                        มาสายหลัง: 08:00 น. | ปิดระบบ: 08:45 น.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={cancelAction}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-3xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    ยกเลิก
                  </button>

                  <button
                    disabled={submitDisabled}
                    onClick={submitAttendance}
                    className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <span>เช็คชื่อเข้าแถว 🇹🇭</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
