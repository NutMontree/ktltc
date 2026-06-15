"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom student icon
const createStudentIcon = (imageUrl?: string) => {
  if (imageUrl) {
    return L.divIcon({
      html: `
        <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.3); background-color: white; display: flex; justify-content: center; align-items: center;">
          <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #3b82f6; margin: 0 auto; margin-top: -2px;"></div>
      `,
      className: "custom-student-marker",
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52],
    });
  }

  // Fallback default icon
  return new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export default function MapComponent({ students }: { students: any[] }) {
  // Default center: coordinates for Kantaralak (example)
  // You might want to update this to the exact campus coordinates
  const CAMPUS_CENTER: [number, number] = [14.6385, 104.6477];
  const GEOFENCE_RADIUS = 500; // 500 meters

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-800 relative z-10">
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus Geofence Circle */}
        <Circle
          center={CAMPUS_CENTER}
          radius={GEOFENCE_RADIUS}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
        />

        {/* Student Markers */}
        {students.map((student) => {
          if (!student.currentLocation?.latitude || !student.currentLocation?.longitude) return null;

          return (
            <Marker
              key={student._id}
              position={[student.currentLocation.latitude, student.currentLocation.longitude]}
              icon={createStudentIcon(student.image)}
            >
              <Popup className="student-popup">
                <div className="flex items-center gap-3 w-48">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                    {student.image ? (
                      <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                        {(student.name || student.username || "?")[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-zinc-900">{student.name || student.username}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{student.username}</p>
                    <p className="text-[9px] text-zinc-400 mt-1">
                      อัปเดตเมื่อ: {new Date(student.currentLocation.updatedAt).toLocaleTimeString("th-TH")}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
