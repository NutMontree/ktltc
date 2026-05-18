// @ts-nocheck
'use client';

import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix typical Leaflet icon issue in Next.js missing marker images
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_COLLEGE_LOCATION = [14.754043, 104.65807];
const MAX_RADIUS = 200000; 

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
  radius = 200 
}: { 
  markers: any[]; 
  centerLat?: number; 
  centerLng?: number; 
  radius?: number; 
}) {
  if (typeof window === 'undefined') return null;

  const dynamicCenter: [number, number] = useMemo(() => [centerLat, centerLng], [centerLat, centerLng]);

  // Optimized Marker Rendering using Memoization
  const markerElements = useMemo(() => {
    return markers.map((m, i) => (
      <Marker key={`${m.lat}-${m.lng}-${i}`} position={[m.lat, m.lng]} icon={icon}>
        <Popup className="premium-popup" closeButton={false}>
          <div className="flex flex-col items-center min-w-[140px] pb-3 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden text-left">
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
            <div className="px-3 text-center">
              <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-tight leading-tight mb-1">{m.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mb-2">
                {new Date(m.time).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' })} น.
              </p>
              <span className={`px-2.5 py-1 text-[9px] uppercase font-black tracking-widest rounded-lg border shadow-sm ${m.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                 {m.status}
              </span>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }, [markers]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-inner">
      <MapContainer 
        center={dynamicCenter} 
        zoom={15} 
        scrollWheelZoom={false} 
        preferCanvas={true} // VITAL for mobile performance: hardware-accelerated vectors
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Circle
          center={dynamicCenter}
          radius={MAX_RADIUS}
          pathOptions={{ 
            color: '#10b981', 
            fillColor: '#10b981', 
            fillOpacity: 0.03,
            weight: 1,
            dashArray: '10, 10'
          }}
        />

        <Circle
          center={dynamicCenter}
          radius={radius}
          pathOptions={{ 
            color: '#3b82f6', 
            fillColor: '#3b82f6', 
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '5, 5',
          }}
        />
        
        <Marker position={dynamicCenter} icon={icon}>
          <Popup closeButton={false}>
            <div className="text-center p-2 min-w-[140px]">
              <p className="font-black text-blue-600 text-[10px] uppercase tracking-tight mb-1">จุดพิกัดเสาธงกิจกรรม</p>
              <p className="text-[8px] text-slate-400 dark:text-zinc-500 leading-tight mb-2 italic">ศูนย์กลางอาณาเขตเข้าแถวเสาธง</p>
              <span className="text-[8px] px-2 py-1 bg-blue-50 text-blue-500 rounded-lg inline-block font-black uppercase tracking-widest border border-blue-100">จุดรวมพล</span>
            </div>
          </Popup>
        </Marker>

        <ChangeMapView center={dynamicCenter} />
        {markerElements}
      </MapContainer>

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
