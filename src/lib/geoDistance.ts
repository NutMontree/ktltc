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
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // รัศมีของโลกโดยเฉลี่ย (6,371 กิโลเมตร แปลงเป็นเมตร)
  
  // แปลงองศา (Degree) เป็น เรเดียน (Radian)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // การคำนวณตามสูตร Haversine
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // คืนค่าระยะทางเป็นเมตร
}

