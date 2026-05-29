/**
 * geoDistance.ts: ไฟล์คำนวณระยะทางทางภูมิศาสตร์ (Geolocation)
 * 
 * หน้าที่: 
 * - คำนวณระยะทางระหว่างพิกัด GPS 2 จุด (ละติจูด, ลองจิจูด) 
 * - ใช้สูตร Haversine ซึ่งให้ความแม่นยำสูงบนผิวโลกที่เป็นทรงกลม
 * - ใช้ตรวจสอบว่าผู้ใช้ "ลงเวลาเข้างาน" อยู่ในระยะที่กำหนดหรือไม่
 */

/**
 * calculateDistance: คำนวณระยะทางระหว่าง 2 พิกัด
 * @returns ระยะทางที่มีหน่วยเป็น "เมตร" (Meters)
 */
export function calculateDistance(lat1: any, lon1: any, lat2: any, lon2: any): number {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return -1;
  }

  const R = 6371e3; // รัศมีของโลกโดยเฉลี่ย (6,371 กิโลเมตร แปลงเป็นเมตร)
  
  // แปลงองศา (Degree) เป็น เรเดียน (Radian)
  const φ1 = (nLat1 * Math.PI) / 180;
  const φ2 = (nLat2 * Math.PI) / 180;
  const Δφ = ((nLat2 - nLat1) * Math.PI) / 180;
  const Δλ = ((nLon2 - nLon1) * Math.PI) / 180;

  // การคำนวณตามสูตร Haversine
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // คืนค่าระยะทางเป็นเมตร
}

