'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Layers, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Maximize2 
} from 'lucide-react';

export interface TrafficHistoryPoint {
  time: string;
  timestamp: number;
  totalDl: number;
  totalUl: number;
  devices: Record<string, { rx: number; tx: number; name: string; location: string }>;
}

interface DeviceStatus {
  id: string;
  ip: string;
  name: string;
  location: string;
  type: string;
  brand: string;
  status: 'online' | 'offline' | 'loading';
  rx?: number;
  tx?: number;
}

interface TrafficGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceStatus[];
  history: TrafficHistoryPoint[];
  initialDeviceId?: string;
}

export default function TrafficGraphModal({
  isOpen,
  onClose,
  devices,
  history,
  initialDeviceId = 'all'
}: TrafficGraphModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>(initialDeviceId);
  const [chartType, setChartType] = useState<'timeline' | 'ranking'>('timeline');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialDeviceId) {
      setSelectedDevice(initialDeviceId);
    }
  }, [initialDeviceId]);

  // Redraw canvas whenever history, selectedDevice, or chartType changes
  useEffect(() => {
    if (!isOpen) return;
    renderInteractiveChart();
  }, [isOpen, history, selectedDevice, chartType]);

  if (!isOpen) return null;

  // 1. Get filtered series for the selected device
  const getSelectedSeries = () => {
    if (history.length === 0) {
      // Fallback empty point
      return [{ time: '--:--', dl: 0, ul: 0 }];
    }

    return history.map(h => {
      if (selectedDevice === 'all') {
        return {
          time: h.time,
          dl: h.totalDl || 0,
          ul: h.totalUl || 0
        };
      } else {
        const d = h.devices[selectedDevice];
        return {
          time: h.time,
          dl: d ? d.rx || 0 : 0,
          ul: d ? d.tx || 0 : 0
        };
      }
    });
  };

  const series = getSelectedSeries();
  const currentDl = series[series.length - 1]?.dl || 0;
  const currentUl = series[series.length - 1]?.ul || 0;
  const peakDl = Math.max(...series.map(s => s.dl), 0.1);
  const peakUl = Math.max(...series.map(s => s.ul), 0.1);
  const avgDl = Number((series.reduce((acc, s) => acc + s.dl, 0) / Math.max(1, series.length)).toFixed(1));
  const avgUl = Number((series.reduce((acc, s) => acc + s.ul, 0) / Math.max(1, series.length)).toFixed(1));

  // Device display label
  const getDeviceLabel = (id: string) => {
    if (id === 'all') return '🌟 ภาพรวมทั้งวิทยาลัย (Campus Total)';
    const d = devices.find(x => x.id === id);
    if (!d) return id;
    return `${d.location} (${d.name})`;
  };

  // ================= Canvas Rendering (Interactive View) =================
  const renderInteractiveChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI display
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (chartType === 'timeline') {
      drawTimelineChart(ctx, width, height, series, peakDl, peakUl);
    } else {
      drawRankingChart(ctx, width, height, devices);
    }
  };

  // Helper: Draw Timeline (Line + Area)
  const drawTimelineChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: Array<{ time: string; dl: number; ul: number }>,
    maxDl: number,
    maxUl: number
  ) => {
    const padding = { top: 30, right: 30, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(maxDl, maxUl, 5);
    const maxY = Math.ceil(maxVal * 1.25);

    // 1. Draw Gridlines & Y-Axis labels
    const gridRows = 5;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridRows; i++) {
      const yVal = (maxY / gridRows) * (gridRows - i);
      const y = padding.top + (chartH / gridRows) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(`${yVal.toFixed(1)} M`, padding.left - 8, y);
    }

    if (data.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.font = '14px sans-serif';
      ctx.fillText('กำลังสะสมประวัติข้อมูลทราฟฟิก (ระบบอัปเดตทุก 20 วินาที)...', width / 2, height / 2);
      return;
    }

    const getX = (index: number) => padding.left + (chartW / (data.length - 1)) * index;
    const getY = (val: number) => padding.top + chartH - (val / maxY) * chartH;

    // 2. Draw DL Area & Line (Blue)
    const dlGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    dlGrad.addColorStop(0, 'rgba(37, 99, 235, 0.28)');
    dlGrad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + chartH);
    data.forEach((pt, i) => {
      ctx.lineTo(getX(i), getY(pt.dl));
    });
    ctx.lineTo(getX(data.length - 1), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = dlGrad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.dl);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Draw UL Area & Line (Orange)
    const ulGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    ulGrad.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
    ulGrad.addColorStop(1, 'rgba(249, 115, 22, 0.01)');

    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + chartH);
    data.forEach((pt, i) => {
      ctx.lineTo(getX(i), getY(pt.ul));
    });
    ctx.lineTo(getX(data.length - 1), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = ulGrad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.ul);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Data Dots & X-Axis Time Labels
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const step = Math.max(1, Math.floor(data.length / 6));
    data.forEach((pt, i) => {
      const x = getX(i);

      // Draw dot on the latest point
      if (i === data.length - 1) {
        // DL Dot
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(x, getY(pt.dl), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // UL Dot
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(x, getY(pt.ul), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (i % step === 0 || i === data.length - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(pt.time, x, padding.top + chartH + 10);
      }
    });
  };

  // Helper: Draw Ranking Bar Chart
  const drawRankingChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    allDevices: DeviceStatus[]
  ) => {
    const padding = { top: 20, right: 40, bottom: 20, left: 160 };
    const chartW = width - padding.left - padding.right;

    // Exclude offline devices and sort by rx (Download)
    const sorted = [...allDevices]
      .filter(d => d.status === 'online')
      .sort((a, b) => ((b.rx || 0) + (b.tx || 0)) - ((a.rx || 0) + (a.tx || 0)))
      .slice(0, 8); // Top 8 devices

    if (sorted.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.font = '14px sans-serif';
      ctx.fillText('ไม่มีข้อมูลอุปกรณ์ที่ออนไลน์ในขณะนี้', width / 2, height / 2);
      return;
    }

    const maxVal = Math.max(...sorted.map(d => Math.max(d.rx || 0, d.tx || 0)), 5);
    const rowHeight = (height - padding.top - padding.bottom) / sorted.length;
    const barH = Math.min(14, rowHeight * 0.35);

    sorted.forEach((d, idx) => {
      const y = padding.top + idx * rowHeight;

      // Label (Building name)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = d.location.length > 18 ? d.location.slice(0, 18) + '...' : d.location;
      ctx.fillText(label, padding.left - 15, y + rowHeight / 2);

      // DL Bar (Blue)
      const dlW = Math.max(4, ((d.rx || 0) / maxVal) * chartW);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(padding.left, y + rowHeight / 2 - barH - 1, dlW, barH, 4);
      ctx.fill();

      // UL Bar (Orange)
      const ulW = Math.max(4, ((d.tx || 0) / maxVal) * chartW);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.roundRect(padding.left, y + rowHeight / 2 + 2, ulW, barH, 4);
      ctx.fill();

      // Value label
      ctx.fillStyle = '#475569';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`DL: ${(d.rx || 0).toFixed(1)} / UL: ${(d.tx || 0).toFixed(1)} Mbps`, padding.left + Math.max(dlW, ulW) + 10, y + rowHeight / 2);
    });
  };

  // ================= EXPORT HIGH-RES JPG =================
  const handleExportJpg = () => {
    setIsExporting(true);

    try {
      // 1. Create High-Resolution Export Canvas (1600 x 960)
      const expCanvas = document.createElement('canvas');
      const W = 1600;
      const H = 960;
      expCanvas.width = W;
      expCanvas.height = H;

      const ctx = expCanvas.getContext('2d');
      if (!ctx) return;

      // 2. Pure White Background (CRITICAL for JPG - prevents black background artifact!)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // 3. Header Background Banner
      const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
      headerGrad.addColorStop(0, '#1e3a8a');
      headerGrad.addColorStop(1, '#2563eb');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, W, 120);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('วิทยาลัยเทคนิคกันทรลักษ์ — งานศูนย์ดิจิทัลและสื่อสารองค์กร', 50, 48);

      ctx.fillStyle = '#bfdbfe';
      ctx.font = '16px sans-serif';
      const nowStr = new Date().toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      ctx.fillText(`รายงานทราฟฟิกเครือข่ายอินเทอร์เน็ต (KTLTC NMS) • ข้อมูล ณ วันที่ ${nowStr}`, 50, 84);

      // Scope Badge
      const scopeText = `ขอบเขต: ${getDeviceLabel(selectedDevice)}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(W - 480, 40, 430, 44, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(scopeText, W - 265, 68);

      // 4. KPI Stat Boxes (3 rounded cards)
      const boxY = 145;
      const boxW = 460;
      const boxH = 95;
      const boxGap = 40;
      const startX = 50;

      // Card 1: Download
      drawStatCard(ctx, startX, boxY, boxW, boxH, 'ดาวน์โหลดปัจจุบัน (DL)', `${currentDl.toFixed(1)} Mbps`, `จุดสูงสุด: ${peakDl.toFixed(1)} Mbps`, '#eff6ff', '#1d4ed8');

      // Card 2: Upload
      drawStatCard(ctx, startX + boxW + boxGap, boxY, boxW, boxH, 'อัปโหลดปัจจุบัน (UL)', `${currentUl.toFixed(1)} Mbps`, `จุดสูงสุด: ${peakUl.toFixed(1)} Mbps`, '#fff7ed', '#c2410c');

      // Card 3: Status
      const onlineCount = devices.filter(d => d.status === 'online').length;
      drawStatCard(ctx, startX + (boxW + boxGap) * 2, boxY, boxW, boxH, 'สถานะอุปกรณ์ออนไลน์', `${onlineCount} / ${devices.length} เครื่อง`, `ประเภทกราฟ: ${chartType === 'timeline' ? 'ไทม์ไลน์ตามเวลา' : 'จัดอันดับแต่ละอาคาร'}`, '#f0fdf4', '#15803d');

      // 5. Render Selected Chart to Export Canvas
      const chartArea = { x: 50, y: 265, w: W - 100, h: 600 };

      // Border frame around chart
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(chartArea.x, chartArea.y, chartArea.w, chartArea.h, 16);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Legend in top-right of chart frame
      drawLegend(ctx, chartArea.x + chartArea.w - 380, chartArea.y + 25);

      if (chartType === 'timeline') {
        // Offset inner chart
        ctx.save();
        ctx.translate(chartArea.x + 20, chartArea.y + 40);
        drawTimelineChart(ctx, chartArea.w - 40, chartArea.h - 70, series, peakDl, peakUl);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(chartArea.x + 20, chartArea.y + 40);
        drawRankingChart(ctx, chartArea.w - 40, chartArea.h - 70, devices);
        ctx.restore();
      }

      // 6. Footer Watermark / Signature
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('งานศูนย์ข้อมูลและสารสนเทศ วิทยาลัยเทคนิคกันทรลักษ์ — https://ktltc.ac.th/network-monitor', 50, H - 30);

      ctx.textAlign = 'right';
      ctx.fillText('ระบบบริหารจัดการและมอนิเตอร์โครงสร้างพื้นฐานเครือข่ายดิจิทัล (KTLTC NMS Engine)', W - 50, H - 30);

      // 7. Trigger JPEG Download
      const dataUrl = expCanvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const timeStampSlug = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `ktltc-traffic-graph-${timeStampSlug}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);

    } catch (err) {
      console.error('Export JPG failed', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์รูปภาพ JPG');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper for Export Card
  const drawStatCard = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    mainVal: string,
    subVal: string,
    bgColor: string,
    textColor: string
  ) => {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 24, y + 28);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(mainVal, x + 24, y + 62);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(subVal, x + w - 24, y + 62);
  };

  // Helper for Legend
  const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // DL
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, y, 14, 14);
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ดาวน์โหลด (Download DL)', x + 22, y + 12);

    // UL
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 190, y, 14, 14);
    ctx.fillStyle = '#334155';
    ctx.fillText('อัปโหลด (Upload UL)', x + 212, y + 12);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-slate-800">กราฟทราฟฟิกเครือข่ายอินเทอร์เน็ต</h3>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">LIVE</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">งานศูนย์ดิจิทัลและสื่อสารองค์กร วท.กันทรลักษ์</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Export JPG Button */}
            <button
              onClick={handleExportJpg}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm ${
                exportSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-95'
              }`}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ดาวน์โหลดสำเร็จ!
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                  {isExporting ? 'กำลังสร้างรูป...' : 'ส่งออกกราฟ JPG'}
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Controls Bar: Device Selector & Chart Type Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {/* Device Filter */}
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                เลือกจุดตรวจวัด:
              </label>
              <select
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="all">🌟 ภาพรวมทั้งวิทยาลัย (Campus Total)</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.type === 'Firewall' ? '🛡️' : '🏢'} {d.location} ({d.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Type Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-xl">
              <button
                onClick={() => setChartType('timeline')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'timeline'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                ไทม์ไลน์ตามเวลา
              </button>
              <button
                onClick={() => setChartType('ranking')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'ranking'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                จัดอันดับแต่ละอาคาร
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-blue-600">ดาวน์โหลดปัจจุบัน (DL)</span>
              <p className="text-2xl font-bold font-mono text-blue-900 mt-1">
                {currentDl.toFixed(1)} <span className="text-xs font-normal text-blue-500">Mbps</span>
              </p>
              <p className="text-[11px] text-blue-600/80 mt-1">เฉลี่ย: {avgDl} Mbps</p>
            </div>

            <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-orange-600">อัปโหลดปัจจุบัน (UL)</span>
              <p className="text-2xl font-bold font-mono text-orange-900 mt-1">
                {currentUl.toFixed(1)} <span className="text-xs font-normal text-orange-500">Mbps</span>
              </p>
              <p className="text-[11px] text-orange-600/80 mt-1">เฉลี่ย: {avgUl} Mbps</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-500">จุดสูงสุด DL (Peak)</span>
              <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {peakDl.toFixed(1)} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">บันทึกในรอบวันนี้</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-emerald-600">อุปกรณ์ออนไลน์</span>
              <p className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                {devices.filter(d => d.status === 'online').length} / {devices.length}
              </p>
              <p className="text-[11px] text-emerald-600/80 mt-1">ครอบคลุมทั้งสถาบัน</p>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-inner relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                {chartType === 'timeline' 
                  ? `กราฟแสดงแนวโน้มทราฟฟิก: ${getDeviceLabel(selectedDevice)}`
                  : 'จัดอันดับปริมาณการใช้งานทราฟฟิกแต่ละอาคาร (เรียงตามการใช้งาน)'}
              </h4>
              
              {/* Legends */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600">ดาวน์โหลด (DL)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-slate-600">อัปโหลด (UL)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[360px] relative">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full block cursor-crosshair"
              />
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>💡 สามารถคลิกปุ่ม <strong>"ส่งออกกราฟ JPG"</strong> ด้านบนเพื่อบันทึกไฟล์ภาพรายงานความละเอียดสูงได้ทันที</span>
          <span className="font-mono text-slate-400">อัปเดตอัตโนมัติทุก 20 วินาที</span>
        </div>
      </div>
    </div>
  );
}
