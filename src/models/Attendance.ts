import { ObjectId } from 'mongodb';

/**
 * อินเตอร์เฟซสำหรับข้อมูลการลงเวลาเข้า-ออกงาน (Attendance Interface)
 * 
 * หน้าที่: กำหนดโครงสร้างข้อมูลสำหรับการบันทึกเวลาทำงานของบุคลากร
 * การทำงาน: 
 * - ระบบจะบันทึกพิกัด GPS (lat, lng) และที่อยู่ (address) เมื่อมีการลงเวลา
 * - มีการเก็บรูปถ่าย (photoUrl) เพื่อยืนยันตัวตน
 * - ตรวจสอบประเภทการทำงาน (In-Site หรือ Remote)
 * 
 * ความเชื่อมโยง:
 * - เชื่อมโยงกับคอลเลกชัน 'users' ผ่านฟิลด์ userId
 * - ใช้ใน API Routes สำหรับการลงเวลา (Check-in/Check-out)
 * - ใช้ในหน้า Dashboard สำหรับแสดงสถิติการมาทำงาน
 */
export interface IAttendance {
  _id?: ObjectId;           // ไอดีของเอกสาร (สร้างอัตโนมัติโดย MongoDB)
  userId: ObjectId;         // ไอดีของผู้ใช้งานที่อ้างอิงถึง (Foreign Key ไปยัง User)
  date: Date;               // วันที่บันทึกข้อมูล (รูปแบบ YYYY-MM-DD เพื่อการค้นหาที่ง่าย)
  
  // ข้อมูลการลงเวลาเข้างาน (Check-in)
  checkIn: {
    time?: Date;            // เวลาที่กดเข้างานจริง
    location?: {            // พิกัดสถานที่ ณ ตอนเข้างาน
      lat: number; 
      lng: number; 
      address?: string 
    };
    photoUrl?: string;      // URL รูปถ่ายยืนยันตอนเข้างาน
    statusTag?: 'In-Site' | 'Remote'; // สถานะการทำงาน (ในวิทยาลัย หรือ นอกสถานที่)
    deviceId?: string;      // ไอดีเครื่องที่ใช้ลงเวลา
  };

  // ข้อมูลการลงเวลาเลิกงาน (Check-out)
  checkOut: {
    time?: Date;            // เวลาที่กดเลิกงานจริง
    location?: {            // พิกัดสถานที่ ณ ตอนเลิกงาน
      lat: number; 
      lng: number; 
      address?: string 
    };
    photoUrl?: string;      // URL รูปถ่ายยืนยันตอนเลิกงาน
    otHours: number;        // จำนวนชั่วโมงทำงานล่วงเวลา (Overtime)
  };

  status: 'Present' | 'Late' | 'Leave' | 'Absent'; // สถานะการมาทำงาน (มาตรงเวลา, สาย, ลา, ขาด)
  createdAt: Date;          // วันที่สร้างข้อมูลในระบบ
  updatedAt: Date;          // วันที่อัปเดตข้อมูลล่าสุด
}

