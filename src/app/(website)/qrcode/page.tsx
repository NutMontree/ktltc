"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { QRCodeProps } from "antd";
import {
  Input,
  QRCode,
  Button,
  Segmented,
  ConfigProvider,
  theme,
  notification,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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

const HomeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// --- Custom Download Logic ---
const downloadStylizedQRCode = (
  text: string,
  displayTitle: string, // รับชื่อ Title มาแสดง
) => {
  const canvas = document
    .getElementById("myqrcode")
    ?.querySelector<HTMLCanvasElement>("canvas");

  if (!canvas) return;

  const padding = 60;
  const bottomSpace = 80;
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
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("SCAN ME", width / 2, height - 50);

  // ใช้ displayTitle ที่ดึงมาได้
  ctx.fillStyle = "#6B7280";
  ctx.font = "16px sans-serif";
  let finalDisplay =
    displayTitle.length > 35
      ? displayTitle.substring(0, 35) + "..."
      : displayTitle;
  if (!finalDisplay) finalDisplay = "https://ktltc.site";
  ctx.fillText(finalDisplay, width / 2, height - 25);

  // 5. Download
  // ลบตัวอักษรพิเศษออกจากการตั้งชื่อไฟล์ ป้องกัน Error ตอนเซฟ
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
  const [linkTitle, setLinkTitle] = useState(""); // เก็บชื่อเว็บที่ดึงมาได้
  const [isFetchingTitle, setIsFetchingTitle] = useState(false); // สถานะกำลังดึงข้อมูล
  const [renderType, setRenderType] = useState<QRCodeProps["type"]>("canvas");

  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Effect สำหรับดึงชื่อ Title เมื่อผู้ใช้พิมพ์ URL
  useEffect(() => {
    // ถ้าข้อความว่าง หรือ ไม่ใช่ URL ให้เคลียร์ข้อมูล
    if (!text || !text.startsWith("http")) {
      setLinkTitle(text);
      setIsFetchingTitle(false);
      return;
    }

    // หน่วงเวลา 800ms เผื่อผู้ใช้ยังพิมพ์ไม่เสร็จ จะได้ไม่ยิง API รัวๆ
    const delayDebounceFn = setTimeout(async () => {
      setIsFetchingTitle(true);
      try {
        const response = await fetch(
          `/api/get-title?url=${encodeURIComponent(text)}`,
        );
        const data = await response.json();
        if (data.title) {
          setLinkTitle(data.title);
        } else {
          setLinkTitle(text); // ถ้าไม่เจอ title ให้ใช้ url ปกติ
        }
      } catch (error) {
        console.error("Failed to fetch title", error);
        setLinkTitle(text);
      } finally {
        setIsFetchingTitle(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [text]);

  const handleDownload = () => {
    if (!text) {
      notification.warning({
        message: "ไม่สามารถดาวน์โหลดได้",
        description: "กรุณากรอกข้อความหรือ URL ก่อนดาวน์โหลด",
        placement: "top",
      });
      return;
    }

    if (renderType === "canvas") {
      downloadStylizedQRCode(text, linkTitle || text); // ส่ง Link Title ไปให้วาดรูปลง Canvas
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
        const safeFileName = (linkTitle || text)
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
    <ConfigProvider
      theme={{
        algorithm: [defaultAlgorithm, darkAlgorithm],
        token: {
          colorPrimary: "#DAA520",
          borderRadius: 12,
          fontFamily: "var(--font-sarabun), sans-serif",
        },
        components: {
          Input: {
            controlHeightLG: 50,
            colorBgContainer: "rgba(255,255,255,0.8)",
            activeBorderColor: "#DAA520",
          },
          Button: {
            controlHeightLG: 50,
            defaultShadow: "0 4px 14px 0 rgba(218, 165, 32, 0.39)",
          },
          Segmented: {
            itemSelectedBg: "#DAA520",
            itemSelectedColor: "#FFF",
            trackBg: "rgba(0,0,0,0.05)",
          },
        },
      }}
    >
      <div className="py-24 max-w-[1600px] mx-auto relative flex items-center justify-center bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans selection:bg-[#DAA520] selection:text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#DAA520]/20 dark:bg-[#DAA520]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] px-4 py-12">
          <nav className="flex justify-center mb-8">{/* Breadcrumb ... */}</nav>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column: Controls */}
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <div className="text-center lg:text-left space-y-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  สร้าง{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DAA520] to-yellow-300">
                    QR Code
                  </span>{" "}
                  <br /> ของคุณได้ง่ายๆ
                </h1>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    ข้อความหรือลิงก์
                  </label>
                  <Input
                    size="large"
                    allowClear
                    placeholder="https://example.com"
                    prefix={<LinkIcon />}
                    maxLength={250}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="text-gray-900 placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>

                {/* แสดงผลการดึง Title ใต้ Input */}
                <div className="text-sm px-2 flex items-center gap-2">
                  {isFetchingTitle ? (
                    <span className="text-blue-500 flex items-center gap-2">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 14 }} spin />
                        }
                      />{" "}
                      กำลังดึงชื่อลิงก์...
                    </span>
                  ) : linkTitle &&
                    text.startsWith("http") &&
                    linkTitle !== text ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✅ ชื่อเว็บ: {linkTitle}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    รูปแบบไฟล์
                  </span>
                  <Segmented
                    options={[
                      { label: "PNG", value: "canvas" },
                      { label: "SVG", value: "svg" },
                    ]}
                    value={renderType}
                    onChange={setRenderType}
                    className="bg-white dark:bg-zinc-800"
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={isFetchingTitle} // ปิดปุ่มตอนกำลังโหลด
                  className="bg-[#DAA520] hover:bg-[#B8860B] border-none text-lg h-14 rounded-2xl font-bold disabled:opacity-50"
                >
                  ดาวน์โหลด QR Code
                </Button>
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-linear-to-r from-blue-500 to-[#DAA520] rounded-4xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div
                  id="myqrcode"
                  className="relative bg-white p-8 rounded-4xl shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1"
                >
                  <div className="relative">
                    {/* Visual Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DAA520] rounded-tl-xl -mt-2 -ml-2" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DAA520] rounded-tr-xl -mt-2 -mr-2" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DAA520] rounded-bl-xl -mb-2 -ml-2" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DAA520] rounded-br-xl -mb-2 -mr-2" />

                    <QRCode
                      type={renderType}
                      value={text || "https://ktltc.site"}
                      size={240}
                      iconSize={60}
                      color="#000"
                      bgColor="#FFF"
                      style={{ margin: "auto" }}
                      errorLevel="H"
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      {isFetchingTitle ? "LOADING..." : "SCAN ME"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-[200px] mx-auto transition-all">
                      {/* แสดง Title แทน Text ถ้ายาวไปก็จุดๆๆ */}
                      {isFetchingTitle
                        ? "ดึงข้อมูล..."
                        : linkTitle || text || "https://ktltc.site"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
