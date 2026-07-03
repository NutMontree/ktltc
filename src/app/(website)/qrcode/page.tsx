"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QRCode } from "antd"; // Keep antd QRCode for the matrix generator
import { Input, Button, Tabs, Tab, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PictureOutlined, BgColorsOutlined, CheckCircleFilled } from "@ant-design/icons";

// --- Icons ---
const LinkIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

// --- Custom Download Logic ---
const downloadStylizedQRCode = (
  text: string,
  displayTitle: string
) => {
  const canvas = document
    .getElementById("myqrcode")
    ?.querySelector<HTMLCanvasElement>("canvas");

  if (!canvas) return;

  const padding = 60;
  const bottomSpace = 60;
  const qrSize = canvas.width;
  const width = qrSize + padding * 2;
  const height = qrSize + padding * 2 + bottomSpace;

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = height;

  const ctx = finalCanvas.getContext("2d");
  if (!ctx) return;

  // 1. White Background
  const radius = 40;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // 2. QR Code
  ctx.drawImage(canvas, padding, padding);

  // 3. Gold Corners
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  const cornerLength = 40;
  const offset = 30;

  ctx.beginPath();
  ctx.moveTo(offset, offset + cornerLength);
  ctx.lineTo(offset, offset);
  ctx.lineTo(offset + cornerLength, offset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width - offset - cornerLength, offset);
  ctx.lineTo(width - offset, offset);
  ctx.lineTo(width - offset, offset + cornerLength);
  ctx.stroke();
  const bottomY = height - bottomSpace + 20;
  ctx.beginPath();
  ctx.moveTo(offset, bottomY - cornerLength);
  ctx.lineTo(offset, bottomY);
  ctx.lineTo(offset + cornerLength, bottomY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width - offset - cornerLength, bottomY);
  ctx.lineTo(width - offset, bottomY);
  ctx.lineTo(width - offset, bottomY - cornerLength);
  ctx.stroke();

  // 4. Text
  ctx.textAlign = "center";
  ctx.fillStyle = "#6B7280";
  ctx.font = "16px sans-serif";
  let finalDisplay =
    displayTitle.length > 35
      ? displayTitle.substring(0, 35) + "..."
      : displayTitle;
  if (!finalDisplay) finalDisplay = "https://ktltc.ac.th";
  ctx.fillText(finalDisplay, width / 2, height - 25);

  // 5. Download
  const safeFileName = displayTitle
    .replace(/[^a-zA-Z0-9ก-๙\s-]/g, "")
    .trim()
    .substring(0, 30);
  const finalFileName = safeFileName
    ? `${safeFileName}.png`
    : "KTLTC-QRCode.png";

  const url = finalCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.download = finalFileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function CreateQRCode() {
  const [text, setText] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [renderType, setRenderType] = useState<"canvas" | "svg">("canvas");

  // Fetch title when user types URL
  useEffect(() => {
    if (!text || !text.startsWith("http")) {
      setDescription(text);
      setIsFetchingTitle(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsFetchingTitle(true);
      try {
        const response = await fetch(
          `/api/get-title?url=${encodeURIComponent(text)}`
        );
        const data = await response.json();
        if (data.title) {
          setDescription(data.title);
        } else {
          setDescription(text);
        }
      } catch (error) {
        console.error("Failed to fetch title", error);
        setDescription(text);
      } finally {
        setIsFetchingTitle(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [text]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogo(null);
    }
  };

  const handleDownload = () => {
    if (!text) {
      toast.error("กรุณากรอกข้อความหรือ URL ก่อนดาวน์โหลด");
      return;
    }

    if (renderType === "canvas") {
      downloadStylizedQRCode(text, description || text);
    } else {
      const svg = document
        .getElementById("myqrcode")
        ?.querySelector<SVGElement>("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeFileName = (description || text)
          .replace(/[^a-zA-Z0-9ก-๙\s-]/g, "")
          .trim()
          .substring(0, 30);
        a.download = safeFileName ? `${safeFileName}.svg` : "QRCode.svg";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-neutral-950 overflow-hidden font-sans selection:bg-[#DAA520] selection:text-white">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#DAA520]/20 dark:bg-[#DAA520]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Controls (Glassmorphism Card) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 flex flex-col gap-8"
          >
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                สร้าง{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DAA520] to-yellow-400">
                  QR Code
                </span>{" "}
                <br className="hidden lg:block" />
                ของคุณได้อย่างรวดเร็ว
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                รองรับการดาวน์โหลดพร้อมกรอบ KTLTC สุดพรีเมียม
              </p>
            </div>

            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl p-8 rounded-4xl border border-white/50 dark:border-white/10 shadow-xl shadow-blue-900/5 space-y-8">
              {/* URL Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  ข้อมูล / ลิงก์สำหรับสร้าง QR Code
                </label>
                <Input
                  size="lg"
                  isClearable
                  placeholder="https://example.com"
                  startContent={<LinkIcon />}
                  maxLength={250}
                  value={text}
                  onValueChange={setText}
                  radius="lg"
                  classNames={{
                    input: "text-slate-900 dark:text-white",
                    inputWrapper: "bg-slate-100 dark:bg-neutral-800 border-transparent hover:border-[#DAA520] focus-within:!border-[#DAA520] transition-colors",
                  }}
                />

                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    โลโก้ตรงกลาง (Logo)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-slate-500 mt-2
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50 transition-colors cursor-pointer"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    ข้อความอธิบายด้านล่าง (Description)
                  </label>
                  <Input
                    size="lg"
                    isClearable
                    placeholder="ใส่ข้อความอธิบายด้านล่าง QR Code"
                    maxLength={50}
                    value={description}
                    onValueChange={setDescription}
                    radius="lg"
                    classNames={{
                      input: "text-slate-900 dark:text-white",
                      inputWrapper: "bg-slate-100 dark:bg-neutral-800 border-transparent hover:border-[#DAA520] focus-within:!border-[#DAA520] transition-colors mt-2",
                    }}
                  />
                </div>

                {/* Fetching Status Indicator */}
                <div className="text-sm px-2 h-6 flex items-center">
                  {isFetchingTitle ? (
                    <span className="text-blue-500 flex items-center gap-2">
                      <Spinner size="sm" color="primary" /> กำลังตรวจสอบลิงก์...
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Format Selection & Download */}
              <div className="space-y-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  รูปแบบไฟล์ที่ต้องการ
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {/* PNG Option */}
                  <div
                    onClick={() => setRenderType("canvas")}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      renderType === "canvas"
                        ? "border-[#DAA520] bg-yellow-50 dark:bg-[#DAA520]/10 shadow-lg shadow-[#DAA520]/10"
                        : "border-slate-200 dark:border-neutral-800 hover:border-[#DAA520]/50 bg-white dark:bg-neutral-900/50"
                    }`}
                  >
                    {renderType === "canvas" && (
                      <CheckCircleFilled className="absolute top-3 right-3 text-xl text-[#DAA520]" />
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
                      <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700">
                        <PictureOutlined className="text-2xl text-[#DAA520]" />
                      </div>
                      <div className="mt-1">
                        <p className={`font-bold ${renderType === "canvas" ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          PNG (ลงกรอบ)
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          พร้อมขอบทองพรีเมียม
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SVG Option */}
                  <div
                    onClick={() => setRenderType("svg")}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      renderType === "svg"
                        ? "border-[#DAA520] bg-yellow-50 dark:bg-[#DAA520]/10 shadow-lg shadow-[#DAA520]/10"
                        : "border-slate-200 dark:border-neutral-800 hover:border-[#DAA520]/50 bg-white dark:bg-neutral-900/50"
                    }`}
                  >
                    {renderType === "svg" && (
                      <CheckCircleFilled className="absolute top-3 right-3 text-xl text-[#DAA520]" />
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
                      <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700">
                        <BgColorsOutlined className="text-2xl text-[#DAA520]" />
                      </div>
                      <div className="mt-1">
                        <p className={`font-bold ${renderType === "svg" ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          SVG (โปร่งใส)
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          พื้นหลังโปร่งใส คมชัดสูง
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                color="primary"
                size="lg"
                fullWidth
                startContent={<DownloadIcon />}
                onPress={handleDownload}
                isDisabled={isFetchingTitle}
                className="bg-linear-to-r from-[#DAA520] to-yellow-500 hover:from-[#c2931a] hover:to-yellow-400 text-white font-bold text-lg h-16 rounded-2xl shadow-lg shadow-[#DAA520]/30 transition-all hover:-translate-y-1"
              >
                ดาวน์โหลด QR Code
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-6 bg-linear-to-r from-blue-500/20 to-[#DAA520]/30 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div
                id="myqrcode"
                className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-neutral-800 transform transition-transform duration-500 hover:scale-[1.03] hover:-rotate-1"
              >
                <div className="relative">
                  {/* Decorative Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DAA520] rounded-tl-xl -mt-4 -ml-4" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DAA520] rounded-tr-xl -mt-4 -mr-4" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DAA520] rounded-bl-xl -mb-4 -ml-4" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DAA520] rounded-br-xl -mb-4 -mr-4" />

                  {/* Ant Design QRCode is purely for the matrix generation here */}
                  <QRCode
                    type={renderType}
                    value={text || "https://ktltc.ac.th"}
                    size={280}
                    icon={logo || undefined}
                    iconSize={50}
                    color="#000"
                    bgColor="#FFF"
                    style={{ margin: "auto" }}
                    errorLevel="H"
                  />
                </div>

                <div className="mt-8 text-center space-y-1">
                  <p className="text-sm font-medium text-slate-500 mt-2 truncate max-w-[240px] mx-auto">
                    {isFetchingTitle
                      ? "ดึงข้อมูลลิงก์..."
                      : description || text || "https://ktltc.ac.th"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
