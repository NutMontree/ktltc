// @ts-nocheck
'use client';

import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix Next.js image loading issues for Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapFlagpoleSettingProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

// Subcomponent to capture map click events and update coordinates
function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Subcomponent to dynamically pan map when coords change
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.panTo(coords);
  }, [coords]);
  return null;
}

export default function MapFlagpoleSetting({ lat, lng, radius, onChange }: MapFlagpoleSettingProps) {
  if (typeof window === 'undefined') return null;

  const markerRef = useRef<any>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        onChange(latLng.lat, latLng.lng);
      }
    },
  };

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden z-0 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-inner">
      <MapContainer 
        center={[lat, lng]} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Circle representing the In-Site distance radius */}
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{ 
            color: '#4f46e5', 
            fillColor: '#4f46e5', 
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '5, 5',
          }}
        />

        {/* Draggable Marker at the selected flagpole point */}
        <Marker 
          position={[lat, lng]} 
          icon={icon}
          draggable={true}
          eventHandlers={eventHandlers}
          ref={markerRef}
        />

        <MapEventsHandler onChange={onChange} />
        <ChangeMapView coords={[lat, lng]} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
