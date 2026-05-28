// @ts-nocheck
'use client';

import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ===== Custom SVG Icons: แยกสีตามสถานะพิกัด / ระดับชั้น =====
const createMarkerIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:28px; height:28px;
        background:${color};
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(0,0,0,0.3);
      "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });

// 🟢 อยู่ในพื้นที่ | 🔴 นอกพื้นที่ | 🔵 จุดเสาธง
const inZoneIcon   = createMarkerIcon('#10b981'); // emerald
const outZoneIcon  = createMarkerIcon('#f43f5e'); // rose
const flagpoleIcon = createMarkerIcon('#3b82f6'); // blue

// 🟠 ปวช สีส้ม | 🔵 ปวส สีน้ำเงิน | ⚪ ไม่ระบุระดับชั้น
const vocationalIcon = createMarkerIcon('#f97316'); // orange
const highVocIcon    = createMarkerIcon('#2563eb'); // blue
const unknownIcon    = createMarkerIcon('#71717a'); // zinc-500

// Subcomponent to dynamically pan/re-center map when dynamic center changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function MapDashboard({ 
  markers, 
  centerLat = 14.754043, 
  centerLng = 104.65807, 
  radius = 200,
  mode = "status"
}: { 
  markers: any[]; 
  centerLat?: number; 
  centerLng?: number; 
  radius?: number; 
  mode?: "status" | "level";
}) {
  if (typeof window === 'undefined') return null;

  const dynamicCenter: [number, number] = useMemo(() => [centerLat, centerLng], [centerLat, centerLng]);

  // Optimized Marker Rendering using Memoization
  const markerElements = useMemo(() => {
    return markers.map((m, i) => {
      // Use calculatedDistance if available, otherwise use stored distance
      const displayDistance = m.calculatedDistance ?? m.distance;
      const isInZone = m.inZone !== false; // default true สำหรับข้อมูลเก่า
      
      let markerIcon = isInZone ? inZoneIcon : outZoneIcon;
      if (mode === "level") {
        const level = m.academicLevel || "";
        if (level.includes("ปวช")) {
          markerIcon = vocationalIcon;
        } else if (level.includes("ปวส")) {
          markerIcon = highVocIcon;
        } else {
          markerIcon = unknownIcon;
        }
      }

      return (
        <Marker key={`${m.lat}-${m.lng}-${i}`} position={[m.lat, m.lng]} icon={markerIcon}>
          <Popup className="premium-popup" closeButton={false}>
            <div className="flex flex-col items-center min-w-[170px] pb-3 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden text-left">
              {m.photoUrl ? (
                <div className="w-full h-24 overflow-hidden mb-3 border-b border-slate-100 dark:border-zinc-800">
                   <img src={m.photoUrl} alt="face" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-24 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                     ไม่มีรูปภาพ
                   </span>
                </div>
              )}
              <div className="px-3 text-center w-full">
                <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-tight leading-tight mb-1">{m.name}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mb-1.5">
                  ระดับชั้น: {m.academicLevel || "ไม่ระบุชั้นปี"}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium mb-2">
                  {new Date(m.time).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' })} น.
                </p>

                {/* Zone Status Badge */}
                <div className={`px-2.5 py-1 text-[9px] uppercase font-black tracking-widest rounded-lg border shadow-sm mb-1.5 ${
                  isInZone
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                    : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                }`}>
                  {isInZone ? '✅ อยู่ในพื้นที่' : '⚠️ นอกพื้นที่'}
                </div>

                {/* Time Status Badge */}
                <div className={`px-2.5 py-1 text-[9px] uppercase font-black tracking-widest rounded-lg border shadow-sm mb-1.5 ${
                  m.status === 'Present'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                    : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30'
                }`}>
                  {m.status === 'Present' ? 'ตรงเวลา' : 'มาสาย'}
                </div>

                {/* Distance info */}
                {displayDistance != null && displayDistance >= 0 && (
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold mt-1">
                    ห่างเสาธง {Math.round(displayDistance)} ม.
                  </p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [markers, mode]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-inner">
      <MapContainer
        center={dynamicCenter}
        zoom={15}
        minZoom={10}
        maxZoom={22}
        zoomControl={false}
        scrollWheelZoom={true}
        preferCanvas={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
        {/* วงกลมรัศมีเสาธงจริง (ดึงจาก config) */}
        <Circle
          center={dynamicCenter}
          radius={radius}
          pathOptions={{ 
            color: '#10b981', 
            fillColor: '#10b981', 
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 4',
          }}
        />
        
        {/* จุดพิกัดเสาธง */}
        <Marker position={dynamicCenter} icon={flagpoleIcon}>
          <Popup closeButton={false}>
            <div className="text-center p-2 min-w-[150px]">
              <p className="font-black text-blue-600 text-[10px] uppercase tracking-tight mb-1">🚩 จุดพิกัดเสาธงกิจกรรม</p>
              <p className="text-[8px] text-slate-400 dark:text-zinc-500 leading-tight mb-2 italic">
                รัศมีเสาธง: {radius} เมตร
              </p>
              <span className="text-[8px] px-2 py-1 bg-blue-50 text-blue-500 rounded-lg inline-block font-black uppercase tracking-widest border border-blue-100">ศูนย์กลางพื้นที่เช็คชื่อ</span>
            </div>
          </Popup>
        </Marker>

        <ChangeMapView center={dynamicCenter} />
        {markerElements}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-1000 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl px-3 py-2.5 shadow-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">สัญลักษณ์แผนที่</p>
        
        {mode === "level" ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
              <span className="text-[9px] font-black text-slate-700 dark:text-zinc-300">ระดับ ปวช. (สีส้ม)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
              <span className="text-[9px] font-black text-slate-700 dark:text-zinc-300">ระดับ ปวส. (สีน้ำเงิน)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-500 border-2 border-white shadow-sm" />
              <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">ไม่ระบุระดับชั้น</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              <span className="text-[9px] font-black text-slate-700 dark:text-zinc-300">อยู่ในพื้นที่เสาธง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
              <span className="text-[9px] font-black text-slate-700 dark:text-zinc-300">นอกพื้นที่เสาธง</span>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
          <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">จุดกึ่งกลางเสาธง</span>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2) !important;
          border: 1px solid #e2e8f0;
        }
        .leaflet-popup-tip-container {
           display: none !important;
        }
        .leaflet-popup-content {
           margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
