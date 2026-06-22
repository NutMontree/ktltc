# โครงสร้างโปรเจกต์ KTLTC (Project Architecture)

เอกสารนี้อธิบายหน้าที่ของโฟลเดอร์และไฟล์สำคัญในระบบ เพื่อใช้เป็นคู่มือสำหรับการพัฒนาต่อ โครงสร้างของโปรเจกต์ถูกออกแบบตาม **Next.js App Router**

---

## 📁 src/app (ระบบจัดการเส้นทาง - App Router)
แบ่งออกเป็นส่วนหลักๆ ตามกลุ่มเป้าหมายของผู้ใช้งาน:

### 🌐 1. ส่วนหน้าบ้าน (Front-end / Public)
- **(website)/**: หน้าเว็บสาขา/แผนกต่างๆ เช่น `/marketing`, `/mechanic`, `/accounting`, `/personnel`, `/about`, `/plan`, `/budget` (Route Groups ไม่แสดงคำว่า `(website)` บน URL)
- **news/**: หน้าข่าวสาร (หน้าหลัก และหน้ารายละเอียดข่าว `[id]`)
- **announcement/**, **ITA/**, **GECC/**, **policy/**, **service/**: หน้าข้อมูลและบริการสาธารณะ
- **login/**, **register/**: ระบบเข้าสู่ระบบและสมัครสมาชิก

### 🛠️ 2. ส่วนหลังบ้านและการจัดการ (Back-office / Dashboard)
- **dashboard/**: ระบบหลังบ้านแบบใหม่ที่ใช้กันอยู่หลักๆ เช่น:
  - `/dashboard/news`: จัดการข่าวสาร
  - `/dashboard/banners`: จัดการแบนเนอร์รูปภาพ
  - `/dashboard/pages`: จัดการข้อมูลหน้าเว็บแบบ Dynamic
  - `/dashboard/flagpole-dashboard`: ข้อมูลเข้าแถวหน้าเสาธง
  - `/dashboard/permissions`: จัดการสิทธิ์การใช้งานของ Role
- **(admin)/**: ระบบแอดมินสำหรับจัดการข้อมูลลึกๆ (เช่น ข้อมูลนักเรียน, อนุมัติการลา, รายงานผลปฏิบัติงาน)
- **(pdca-dashboard)/**: ระบบจัดทำแผน PDCA (Plan-Do-Check-Act) สำหรับบุคลากรภายใน

### 👨‍🏫 3. ส่วนของผู้ใช้เฉพาะกลุ่ม (Role-based Workspaces)
- **student/**: พื้นที่ของนักเรียน (เช่น `/student/flagpole` เพื่อเช็คชื่อเข้าแถว)
- **teacher/**: พื้นที่ของครูผู้สอน (เช่น `/teacher/gate-scanner` เช็คชื่อ, `/teacher/students` จัดการนักเรียน)
- **(employee)/**: พื้นที่บุคลากร (เช่น `/employee/check-in`, `/employee/leave-request`)

### 🔌 4. ส่วนของ API (Backend Endpoints)
- **api/**: แหล่งรวม API ฝั่งเซิร์ฟเวอร์ (เช่น `/api/auth`, `/api/news`, `/api/admin`, `/api/upload`, `/api/media`)
- **api/media/[...path]/route.ts**: API จัดการการอ่านไฟล์รูปภาพ/สื่อที่เก็บไว้ในโฟลเดอร์ Local `public` และดึงไฟล์จาก Vercel/On-premise

---

## 📁 src/lib (ห้องสมุดฟังก์ชัน - Business Logic)
ส่วนที่เก็บตรรกะการทำงาน (Business Logic) และการเชื่อมต่อภายนอก
- **db.ts**: หัวใจการเชื่อมต่อ MongoDB (Singleton Pattern)
- **auth.ts**: ตรรกะการตรวจสอบสิทธิ์ Session และ JWT
- **upload.ts / upload-server.ts**: ระบบจัดการไฟล์รูปภาพ (Client-side / Server-side)
- **cwd.ts**: Helper สำหรับช่วยหา Current Working Directory เพื่อให้รองรับ Turbopack/Vercel
- **lineNotify.ts**: ระบบแจ้งเตือนผ่าน LINE
- **youtube.ts / facebook.ts**: ระบบแปลงลิงก์วิดีโอเพื่อนำมาฝัง (Embed)

---

## 📁 src/components (ส่วนประกอบหน้าจอ - UI Components)
โฟลเดอร์สำหรับแยก Component ต่างๆ เพื่อให้เรียกใช้งานซ้ำได้:
- **ui/**: Design System หลัก (ปุ่ม, การ์ด, เอฟเฟกต์พื้นหลัง)
- **dashboard/**: ส่วนประกอบสำหรับหน้าแอดมิน
- **home/**: ส่วนประกอบหน้าแรกของเว็บไซต์
- **Navbar.tsx / Footer.tsx**: เมนูหลักและส่วนท้ายที่ดึงข้อมูลจาก DB
- **ManageNewsList.tsx**: ตัวอย่าง Component ที่มี Logic การดึงและแสดงข้อมูล

---

## 📁 src/types (แม่แบบข้อมูล - Types & Interfaces)
- กำหนด Type ของ TypeScript เพื่อป้องกันข้อผิดพลาดในการเขียนโค้ด
- **next-auth.d.ts**: ขยายข้อมูล Session ให้เก็บ Role และ ID ได้

---

## 📁 public (ไฟล์สื่อและไฟล์สาธารณะ)
- **uploads/**, **images/**, **pdf/**, **ktltc_drive/**, **ktltc_news/**: โฟลเดอร์ที่เก็บไฟล์ต่างๆ ที่เกิดจากการอัปโหลดของผู้ใช้ (หมายเหตุ: หากใช้ Vercel ข้อมูลในนี้อาจเป็นแค่ชั่วคราว จึงต้องจัดการการอัปโหลดให้ดี)

---

## 📁 tmp (สคริปต์บำรุงรักษา)
- รวบรวมสคริปต์ที่ใช้จัดการฐานข้อมูลแบบใช้ครั้งเดียว (One-time scripts)
- **absolute_final_sync.js**: ใช้ซิงค์รายการ "แผนก/งาน" ให้ตรงกันทุกหน้า

---

## ⚙️ ไฟล์ตั้งค่าสำคัญ (Configuration Files)
- **auth.config.ts**: ตั้งค่า NextAuth (Callbacks, Pages, JWT)
- **middleware.ts**: ปราการด่านแรกสำหรับตรวจสอบ Role และปกป้อง Route ห้ามผู้ไม่มีสิทธิ์เข้าถึง 
- **next.config.mjs**: ตั้งค่า Next.js การ Redirect URL และการอนุญาตโดเมนรูปภาพแบบ Remote
- **tailwind.config.ts**: ตั้งค่าธีม สี ฟอนต์ และ Plugin ของ TailwindCSS
