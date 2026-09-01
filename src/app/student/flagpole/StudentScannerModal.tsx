"use client";

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, Loader2, CheckCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAccurateLocation } from "@/lib/geolocation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentScannerModal({ isOpen, onClose, onSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      getAccurateLocation(5000).then((loc) => {
        setLocation({ lat: loc.lat, lng: loc.lng });
        if (loc.errorMsg) setLocationError(loc.errorMsg);
      }).catch(err => {
        setLocationError("ไม่สามารถหาพิกัดได้");
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = async (data: any) => {
    if (isProcessing || isSuccess || !data || data.length === 0) return;
    
    try {
      const token = data[0].rawValue;
      if (!token) return;
      
      setIsProcessing(true);

      if (!location) {
        toast.error("กำลังหาตำแหน่ง GPS หรือคุณไม่ได้เปิด GPS ไว้");
        setIsProcessing(false);
        return;
      }
      
      const res = await fetch("/api/flagpole/qr-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, lat: location.lat, lng: location.lng }),
      });

      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
        toast.success(json.message || "เช็คชื่อสำเร็จ!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        toast.error(json.message || "เกิดข้อผิดพลาดในการเช็คชื่อ");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-900 rounded-4xl overflow-hidden shadow-2xl w-full max-w-sm border border-slate-100 dark:border-zinc-800"
        >
          <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
            <h3 className="font-black text-lg uppercase tracking-tight">สแกน QR Code บนจอทีวี</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 relative">
            <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative shadow-inner border border-zinc-200 dark:border-zinc-700">
              {isSuccess ? (
                <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center text-emerald-500 z-10 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <CheckCircle className="w-16 h-16 mb-2" />
                  </motion.div>
                  <p className="font-black text-lg tracking-widest uppercase">เช็คชื่อสำเร็จ</p>
                </div>
              ) : (
                <>
                  <Scanner
                    onScan={handleScan}
                    formats={['qr_code']}
                    components={{
                      finder: true,
                    }}
                    styles={{
                      container: { width: '100%', height: '100%' },
                    }}
                  />
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-2" />
                      <p className="font-bold text-sm tracking-widest uppercase">กำลังบันทึกข้อมูล...</p>
                    </div>
                  )}

                  {!location && !isProcessing && (
                    <div className="absolute top-4 inset-x-4 bg-amber-500/90 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md z-10 shadow-lg border border-amber-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังหาพิกัด GPS ของคุณ...
                    </div>
                  )}
                  {location && !isProcessing && (
                    <div className="absolute top-4 inset-x-4 bg-emerald-500/90 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md z-10 shadow-lg border border-emerald-400">
                      <MapPin className="w-4 h-4" />
                      พบพิกัดแล้ว พร้อมสแกน
                    </div>
                  )}
                </>
              )}
            </div>
            
            <p className="text-center text-xs font-bold text-slate-500 mt-6 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
              หันกล้องไปที่ QR Code ที่ครูเปิดให้บนหน้าจอทีวี
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
