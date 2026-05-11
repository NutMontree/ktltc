# โครงสร้างโปรเจกต์ KTLTC (Project Architecture)

เอกสารนี้อธิบายหน้าที่ของโฟลเดอร์และไฟล์สำคัญในระบบ เพื่อใช้เป็นคู่มือสำหรับการพัฒนาต่อ

## 📁 src/lib (ห้องสมุดฟังก์ชัน)
ส่วนที่เก็บตรรกะการทำงาน (Business Logic) และการเชื่อมต่อภายนอก
- **db.ts**: หัวใจการเชื่อมต่อ MongoDB (Singleton Pattern)
- **auth.ts**: ตรรกะการตรวจสอบสิทธิ์และ Permissions
- **upload.ts / upload-server.ts**: ระบบจัดการไฟล์อัปเดตลงเครื่อง Server
- **lineNotify.ts**: ระบบแจ้งเตือนผ่าน LINE
- **youtube.ts / facebook.ts**: ระบบแปลงลิงก์วิดีโอเพื่อนำมาฝัง (Embed)

## 📁 src/components (ส่วนประกอบหน้าจอ)
- **ui/**: Design System (ปุ่ม, การ์ด, เอฟเฟกต์พื้นหลัง)
- **dashboard/**: ส่วนประกอบสำหรับหน้าแอดมิน
- **home/**: ส่วนประกอบหน้าแรกของเว็บไซต์
- **Navbar.tsx / Footer.tsx**: เมนูหลักและส่วนท้ายที่ดึงข้อมูลจาก DB

## 📁 src/types (แม่แบบข้อมูล)
- กำหนด Type ของ TypeScript เพื่อป้องกันข้อผิดพลาดในการเขียนโค้ด
- **next-auth.d.ts**: ขยายข้อมูล Session ให้เก็บ Role และ ID ได้

## 📁 tmp (สคริปต์บำรุงรักษา)
- รวบรวมสคริปต์ที่ใช้จัดการฐานข้อมูลแบบใช้ครั้งเดียว (One-time scripts)
- **absolute_final_sync.js**: ใช้ซิงค์รายการ "แผนก/งาน" ให้ตรงกันทุกหน้า

## ⚙️ ไฟล์ตั้งค่าสำคัญ
- **auth.config.ts**: ตั้งค่า NextAuth (Callbacks, Pages)
- **proxy.ts**: Middleware สำหรับจัดการการเข้าถึงหน้าต่างๆ
- **next.config.mjs**: ตั้งค่า Next.js และการอนุญาตโดเมนรูปภาพ
