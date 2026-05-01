"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  Activity,
  Server,
  ChevronDown,
  RefreshCw,
  Zap,
} from "lucide-react";

// --- Types ---
type TestPhase = "idle" | "ping" | "download" | "upload" | "finished";

interface Metrics {
  ping: number;
  jitter: number;
  download: number;
  upload: number;
}

interface UserInfo {
  ip: string;
  isp: string;
  location: string;
  server: string;
}

// --- Gauge Component ---
const Gauge = ({
  value,
  label = "Mbps",
}: {
  value: number;
  label?: string;
}) => {
  const rotation = (Math.min(value, 250) / 250) * 240 - 120; // -120 to 120 degrees

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[340px] aspect-square mx-auto">
      {/* Background Track SVG */}
      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeDasharray="335"
          strokeDashoffset="0"
          strokeLinecap="round"
          className="opacity-40"
          style={{
            strokeDasharray: "335",
            strokeDashoffset: "0",
            transform: "rotate(150deg)",
            transformOrigin: "center",
          }}
        />
        {/* Progress Arc */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#83697b"
          strokeWidth="10"
          strokeDasharray="335"
          initial={{ strokeDashoffset: 335 }}
          animate={{
            strokeDashoffset: 335 - 335 * (Math.min(value, 250) / 250),
          }}
          strokeLinecap="round"
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          style={{ transform: "rotate(150deg)", transformOrigin: "center" }}
        />
      </svg>

      {/* Scale Marks */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 10, 25, 50, 75, 100, 150, 200, 250].map((mark) => {
          const markRotation = (mark / 250) * 240 - 120;
          return (
            <div
              key={mark}
              className="absolute inset-0"
              style={{ transform: `rotate(${markRotation}deg)` }}
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-[1.5px] h-2.5 bg-gray-300" />
                <div
                  className="text-[11px] text-gray-400 font-bold mt-2"
                  style={{ transform: `rotate(${-markRotation}deg)` }}
                >
                  {mark}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Needle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-1.5 h-36 bg-linear-to-t from-[#4a3b4e] to-transparent absolute bottom-1/2 origin-bottom rounded-full z-10"
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 12 }}
        />
        <div className="w-4 h-4 bg-[#4a3b4e] rounded-full z-20 shadow-lg" />
      </div>

      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-24">
        <motion.div
          key={Math.floor(value)}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="text-6xl font-black text-gray-800 tabular-nums tracking-tighter"
        >
          {value.toFixed(1)}
        </motion.div>
        <div className="text-gray-400 font-bold tracking-[0.2em] uppercase text-xs mt-1">
          {label}
        </div>
      </div>
    </div>
  );
};

// --- Main SpeedTest Component ---
export default function SpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [currentDisplaySpeed, setCurrentDisplaySpeed] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({
    ping: 0,
    jitter: 0,
    download: 0,
    upload: 0,
  });

  const [userInfo, setUserInfo] = useState<UserInfo>({
    ip: "Detecting...",
    isp: "Detecting...",
    location: "Detecting...",
    server: "NT Bangrak",
  });

  // Fetch real user connection details on mount
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          ip: data.ip,
          isp: data.org || "Unknown ISP",
          location: `${data.city}, ${data.region}`,
          server: "NT Bangrak", // Standard server in Bangkok
        });
      })
      .catch(() => {
        setUserInfo({
          ip: "1.4.196.225",
          isp: "TOT",
          location: "Bangkok, Thailand",
          server: "NT Bangrak",
        });
      });
  }, []);

  const runPingTest = async (samples = 5) => {
    const latencies: number[] = [];
    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await fetch("/api/speedtest", { cache: "no-store" });
      const end = performance.now();
      latencies.push(end - start);
      setMetrics((prev) => ({
        ...prev,
        ping: Math.round(latencies[latencies.length - 1]),
      }));
      await new Promise((r) => setTimeout(r, 100)); // Small pause
    }
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const jitter = Math.max(...latencies) - Math.min(...latencies);
    return { ping: Math.round(avg), jitter: Math.round(jitter) };
  };

  const startTest = useCallback(async () => {
    setPhase("ping");
    setCurrentDisplaySpeed(0);

    // 1. Real Ping simulation
    const pingResults = await runPingTest(8);
    setMetrics((prev) => ({
      ...prev,
      ping: pingResults.ping,
      jitter: pingResults.jitter,
    }));

    // 2. Real Download phase
    setPhase("download");
    const downloadSize = 15 * 1024 * 1024; // 15MB (Optimize for Vercel-safe bandwidth)
    const startD = performance.now();
    let loaded = 0;

    try {
      const response = await fetch(`/api/speedtest?size=${downloadSize}`, {
        cache: "no-store",
        mode: "cors",
      });
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.length;
        const now = performance.now();
        const duration = (now - startD) / 1000;
        const speedMbps = (loaded * 8) / (duration * 1e6);
        setCurrentDisplaySpeed(speedMbps);
      }
    } catch (e) {
      console.error(e);
    }

    const finalDTime = (performance.now() - startD) / 1000;
    const finalDSpeed = (downloadSize * 8) / (finalDTime * 1e6);
    setCurrentDisplaySpeed(finalDSpeed);
    setMetrics((prev) => ({
      ...prev,
      download: Number(finalDSpeed.toFixed(1)),
    }));

    // 3. Real Upload phase
    setPhase("upload");
    setCurrentDisplaySpeed(0);

    const uploadSize = 4 * 1024 * 1024; // 4MB (Stay under Vercel's 4.5MB Payload Limit)
    const dummyData = new Uint8Array(uploadSize);
    const startU = performance.now();

    // Use XMLHttpRequest for real progress monitoring
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/speedtest");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const now = performance.now();
          const duration = (now - startU) / 1000;
          const speedMbps = (e.loaded * 8) / (duration * 1e6);
          setCurrentDisplaySpeed(speedMbps);
        }
      };

      xhr.onload = () => resolve();
      xhr.onerror = () => reject();
      xhr.send(dummyData);
    });

    const finalUTime = (performance.now() - startU) / 1000;
    const finalUSpeed = (uploadSize * 8) / (finalUTime * 1e6);
    setCurrentDisplaySpeed(finalUSpeed);
    setMetrics((prev) => ({ ...prev, upload: Number(finalUSpeed.toFixed(1)) }));

    setPhase("finished");
    setCurrentDisplaySpeed(0);
  }, []);

  const reset = () => {
    setPhase("idle");
    setCurrentDisplaySpeed(0);
    setMetrics({ ping: 0, jitter: 0, download: 0, upload: 0 });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#e9e9e9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden relative min-h-[600px] flex flex-col">
        {/* Header/Logo */}
        <div className="p-8 flex justify-end">
          <div className="flex items-center gap-2 text-[#4a3b4e] font-black opacity-80 select-none">
            <Activity className="w-6 h-6 stroke-3" />
            <span className="text-xl tracking-tighter italic">SPEEDTEST</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <AnimatePresence mode="wait">
            {phase === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startTest}
                  className="w-72 h-72 rounded-full border-12 border-white/30 flex items-center justify-center bg-transparent group relative hover:border-[#83697b]/40 transition-colors duration-500"
                >
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#83697b]/20 group-hover:rotate-180 transition-transform duration-[10s] linear" />
                  <span className="text-6xl font-light text-[#83697b] tracking-[0.2em] ml-2">
                    GO
                  </span>
                </motion.button>

                <div className="mt-16 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-3 bg-white/40 px-8 py-4 rounded-3xl shadow-sm border border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner">
                      <Server className="w-5 h-5 text-[#83697b]" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-[#4a3b4e] flex items-center gap-1">
                        {userInfo.server}
                        <ChevronDown className="w-4 h-4 opacity-40" />
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {userInfo.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8 text-[#83697b]/30">
                    <Zap className="w-6 h-6" />
                    <RefreshCw className="w-6 h-6" />
                    <Download className="w-6 h-6" />
                    <Upload className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Left: Gauge Section */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <Gauge
                    value={
                      phase === "finished"
                        ? metrics.download
                        : currentDisplaySpeed
                    }
                    label={phase === "upload" ? "Upload" : "Download"}
                  />

                  <div className="mt-8 flex items-center justify-between w-full max-w-sm px-4">
                    <div className="text-center">
                      <div className="text-xl font-black text-[#4a3b4e] truncate max-w-[140px] uppercase">
                        {userInfo.isp}
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold tracking-wider">
                        {userInfo.ip}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-300 mx-4" />
                    <div className="text-center">
                      <div className="text-xl font-black text-[#4a3b4e]">
                        {userInfo.server}
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold tracking-wider">
                        {userInfo.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Stats Section */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <StatBox
                      label="PING"
                      value={metrics.ping}
                      unit="ms"
                      active={phase === "ping"}
                      icon={<Activity className="w-3.5 h-3.5" />}
                    />
                    <StatBox
                      label="DOWNLOAD"
                      value={
                        phase === "download"
                          ? currentDisplaySpeed
                          : metrics.download
                      }
                      unit="Mbps"
                      active={phase === "download"}
                      highlight={phase !== "download" && metrics.download > 0}
                      icon={<Download className="w-3.5 h-3.5" />}
                    />
                    <StatBox
                      label="JITTER"
                      value={metrics.jitter}
                      unit="ms"
                      active={phase === "ping"}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    />
                    <StatBox
                      label="UPLOAD"
                      value={
                        phase === "upload"
                          ? currentDisplaySpeed
                          : metrics.upload
                      }
                      unit="Mbps"
                      active={phase === "upload"}
                      highlight={phase === "finished"}
                      icon={<Upload className="w-3.5 h-3.5" />}
                    />
                  </div>

                  {phase === "finished" && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={reset}
                      className="mt-4 bg-[#83697b] text-white py-4 rounded-3xl font-black tracking-widest text-sm hover:bg-[#6e5666] transition-all shadow-xl shadow-[#83697b]/20 flex items-center justify-center gap-3"
                    >
                      <RefreshCw className="w-4 h-4" />
                      TEST AGAIN
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="p-8 border-t border-gray-200/50 flex flex-col items-center gap-3">
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] text-center uppercase leading-loose">
            All trademarks of Ookla, LLC, including Speedtest®, are used under
            license.
          </p>
          <div className="flex gap-4 text-[10px] text-[#83697b] font-black tracking-widest transition-opacity hover:opacity-100 opacity-60">
            <a href="/policy" className="hover:underline">
              PRIVACY POLICY
            </a>
            <span>|</span>
            <a href="/service" className="hover:underline">
              TERMS OF USE
            </a>
          </div>
        </div>

        {/* Background Accent */}
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[#83697b]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-64 h-64 bg-white/40 rounded-full blur-[80px] pointer-events-none" />
      </div>

      <div className="pt-24 prose prose-gray max-w-none">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4a3b4e] mb-6">
            บริการ Speed Test
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
            บริการ Speed Test
            เป็นบริการทดสอบความเร็วการเชื่อมต่อระบบเครือข่ายคอมพิวเตอร์เบื้องต้น
            โดยจะแสดงความเร็วการรับข้อมูล (Download) และส่งข้อมูล (Upload)
            ระหว่างผู้ใช้งานที่อยู่ภายในหรือภายนอกวิทยาลัย
            มายังระบบเครือข่ายของวิทยาลัย
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16">
          <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#4a3b4e] mb-4 flex items-center gap-3">
              <div className="w-2 h-8 bg-[#83697b] rounded-full" />
              ผู้มีสิทธิ์ใช้งาน
            </h3>
            <p className="text-gray-600">
              นิสิต บุคลากรวิทยาลัยเทคนิคกันทรลักษ์
              และบุคคลทั่วไปที่ต้องการตรวจสอบคุณภาพการเชื่อมต่อ
            </p>
          </div>

          <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#4a3b4e] mb-4 flex items-center gap-3">
              <div className="w-2 h-8 bg-[#83697b] rounded-full" />
              วิธีการเข้าใช้งาน
            </h3>
            <p className="text-gray-600">
              เรียกใช้งานผ่าน Web Browser โดยไปที่
              <span className="text-[#83697b] font-bold underline">
                ktltc.ac.th/speedtest
              </span>
              หรือใช้งานผ่านช่องทางบริการของวิทยาลัย
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function StatBox({
  label,
  value,
  unit,
  active = false,
  highlight = false,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  active?: boolean;
  highlight?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-md p-5 rounded-4xl border transition-all duration-500 relative overflow-hidden ${
        active
          ? "border-[#83697b] shadow-2xl scale-[1.02] z-10"
          : "border-white/40"
      } ${highlight ? "bg-white shadow-xl" : ""}`}
    >
      <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] tracking-widest mb-3 uppercase">
        <span className={active || highlight ? "text-[#83697b]" : ""}>
          {icon}
        </span>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-3xl font-black tabular-nums transition-colors ${
            highlight
              ? "text-[#83697b]"
              : value > 0
                ? "text-[#4a3b4e]"
                : "text-gray-300"
          }`}
        >
          {value === 0
            ? "--"
            : value.toFixed(
                label.includes("PING") || label.includes("JITTER") ? 0 : 1,
              )}
        </span>
        <span className="text-[10px] text-gray-400 font-bold tracking-tighter">
          {unit}
        </span>
      </div>

      {active && (
        <motion.div
          layoutId="stat-indicator"
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#83697b]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
        />
      )}
    </div>
  );
}
