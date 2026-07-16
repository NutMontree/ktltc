---
name: project_summary
description: สรุปข้อมูลโปรเจกต์ KTLTC สำหรับ AI เพื่อทำความเข้าใจก่อนเริ่มงาน
---

# Project Summary: KTLTC

โปรเจกต์นี้คือระบบบริหารจัดการข่าวสารและข้อมูลของวิทยาลัยเทคนิคกันทรลักษ์ (KTLTC)

### เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4, HeroUI, Ant Design
- **Backend**: Next.js API Routes, Next-Auth
- **Database**: MongoDB (Mongoose)
- **ความสามารถเสริม**: มีระบบจัดการ Effect, ระบบแปลภาษา (CustomSlangTranslator), และระบบติดตามผู้ใช้ (ActiveUserTracker) ที่ถูกเรียกใช้ใน `layout.tsx`

### คำแนะนำสำหรับ AI
1. ก่อนเริ่มเขียนโค้ดใหม่ ให้พิจารณาโครงสร้างเดิมของโปรเจกต์
2. ฟีเจอร์หลักเน้นไปที่การจัดการข่าวสารและการนำเสนอข้อมูลของวิทยาลัย
3. เขียนโค้ดโดยอิงรูปแบบและไลบรารีที่โปรเจกต์ติดตั้งไว้แล้ว เพื่อหลีกเลี่ยงข้อขัดแย้งของแพ็กเกจ
