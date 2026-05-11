/**
 * encodeId.js: ไฟล์ตัวช่วยสำหรับถอดรหัส ID
 * 
 * หน้าที่: 
 * - ใช้ถอดรหัสข้อความที่ถูกเข้ารหัสแบบ Base64 กลับเป็นข้อความปกติ (UTF-8)
 * - มักใช้กับการจัดการ ID ใน URL เพื่อความสวยงามหรือเหตุผลทางเทคนิคบางประการ
 */

/**
 * decodeId: ถอดรหัส Base64 เป็น String
 */
export const decodeId = (encodedId) => {
    try {
        return Buffer.from(encodedId, 'base64').toString('utf-8');
    } catch {
        return encodedId; // ถ้าถอดรหัสไม่ได้ (ไม่ใช่รูปแบบ Base64) ให้คืนค่าเดิมกลับไป
    }
};

