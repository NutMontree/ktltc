/**
 * ระบบดึงพิกัด GPS อัจฉริยะ (Multi-Source Geolocation)
 * การันตีได้พิกัด 100% แม้เบราว์เซอร์จะบล็อก GPS หรือสัญญาณดาวเทียมอ่อน
 */

export interface GeoLocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  source: "satellite" | "ip" | "default";
  errorMsg?: string;
}

const COLLEGE_FALLBACK = {
  lat: 14.754043,
  lng: 104.65807,
};

export async function getAccurateLocation(timeoutMs = 8000): Promise<GeoLocationResult> {
  // 1. พยายามดึงพิกัดดาวเทียมความแม่นยำสูง (High-Accuracy Satellite GPS)
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 0,
        });
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        source: "satellite",
      };
    } catch (gpsErr: any) {
      console.warn("[Geolocation] Satellite GPS unavailable/blocked, switching to Network Fallback:", gpsErr);
    }
  }

  // 2. แหล่งสำรองที่ 1: ดึงพิกัดเครือข่าย IP ผ่าน ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/", { 
      cache: "no-store",
      signal: AbortSignal.timeout(4000) 
    });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          source: "ip",
          errorMsg: "ใช้พิกัดเครือข่าย (เนื่องจากเบราว์เซอร์บล็อก GPS)",
        };
      }
    }
  } catch (err) {
    console.warn("[Geolocation] ipapi fallback failed, trying alternative provider:", err);
  }

  // 3. แหล่งสำรองที่ 2: ดึงพิกัดเครือข่ายผ่าน ipwho.is
  try {
    const res = await fetch("https://ipwho.is/", { 
      cache: "no-store",
      signal: AbortSignal.timeout(4000) 
    });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          source: "ip",
          errorMsg: "ใช้พิกัดเครือข่าย (เนื่องจากเบราว์เซอร์บล็อก GPS)",
        };
      }
    }
  } catch (err) {
    console.warn("[Geolocation] ipwho.is fallback failed:", err);
  }

  // 4. แหล่งสำรองฉุกเฉิน (Default College Coordinates)
  return {
    lat: COLLEGE_FALLBACK.lat,
    lng: COLLEGE_FALLBACK.lng,
    source: "default",
    errorMsg: "ไม่สามารถระบุพิกัดสดได้",
  };
}
