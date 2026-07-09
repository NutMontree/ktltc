/**
 * layout.tsx: โครงสร้างหลัก (Root Layout) ของเว็บไซต์
 * 
 * หน้าที่: 
 * 1. กำหนดฟอนต์หลัก (Prompt), Metadata สำหรับ SEO และการแชร์ลงโซเชียล
 * 2. หุ้ม (Wrap) เนื้อหาทั้งหมดด้วย Providers (Auth, Theme, Ant Design)
 * 3. กำหนดส่วนประกอบที่จะแสดงในทุกหน้า เช่น Navbar, Footer, Cookie Consent
 */
/* eslint-disable @next/next/no-page-custom-font */

// นำเข้า CSS สำหรับ Ant Design patch, Syntax Highlight, และ Global Styles
import "@ant-design/v5-patch-for-react-19";
import "../styles/prism-vsc-dark-plus.css";
import "../styles/index.css";
import "../styles/globals.css";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NavbarSkeleton from "@/components/NavbarSkeleton";
import { Suspense } from "react";
import NextAuthProvider from "@/providers/NextAuthProvider";
import ScrollUp from "@/components/Common/ScrollUp";
import ScrollToTop from "@/components/Common/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import ActiveUserTracker from "@/components/ActiveUserTracker";
import SessionWatcher from "@/components/SessionWatcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import GlobalEffectRenderer from "@/components/effects/GlobalEffectRenderer";
import GoogleTranslate from "@/components/GoogleTranslate";
import CustomSlangTranslator from "@/components/CustomSlangTranslator";
import { CursorTracker } from "@/components/telemetry/CursorTracker";

// 1. ตั้งค่าฟอนต์หลักของเว็บ (Prompt)
const prompt = {
  className: "font-prompt",
  variable: "font-prompt",
};

// 2. กำหนด Metadata สำหรับ SEO และการแชร์ลง Social Media (Open Graph)
export const metadata: Metadata = {
  metadataBase: new URL("https://ktltc.ac.th"),
  title: "KTLTC - วิทยาลัยเทคนิคกันทรลักษ์", // ชื่อที่จะขึ้นบน Tab Browser
  description: "ระบบบริหารจัดการข่าวสารและข้อมูลวิทยาลัย", // คำอธิบายเว็บสำหรับ Search Engine

  // ไอคอนเว็บ (Favicon) ที่จะขึ้นบน Tab Browser
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/logo.png", // ไอคอนสำหรับ iOS (Add to Home Screen)
  },

  // ข้อมูลสำหรับแสดงผลเมื่อแชร์ลิงก์ลง Facebook, LINE, Twitter
  openGraph: {
    title: "วิทยาลัยเทคนิคกันทรลักษ์ | KTLTC",
    description: "ระบบบริหารจัดการข่าวสารและข้อมูลวิทยาลัยเทคนิคกันทรลักษ์",
    url: "https://ktltc.ac.th", // ลิงก์เว็บไซต์จริง
    siteName: "KTLTC",
    images: [
      {
        url: "/images/og-image.png", // รูปภาพที่จะโชว์ตอนแชร์ลิงก์
        width: 1200,
        height: 630,
        alt: "KTLTC Preview Image",
      },
    ],
    locale: "th_TH", // ภาษาไทย
    type: "website",
  },
};

import clientPromise from "@/lib/db";

// 3. ฟังก์ชัน RootLayout: โครงสร้างหลักของหน้าเว็บ
export default async function RootLayout({
  children, // children คือเนื้อหาของแต่ละหน้า (Page) ที่จะถูกแทรกเข้ามาตรงกลาง
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ดึงค่า Global Effect จากฐานข้อมูลเพื่อนำไปเรนเดอร์ให้กับทุกคน
  let globalEffect = "none";
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const effectSetting = await db.collection("site_settings").findOne({ key: "global_effect" });
    if (effectSetting) {
      globalEffect = effectSetting.value;
    }
  } catch (error) {
    console.error("Failed to fetch global_effect:", error);
  }

  return (
    // suppressHydrationWarning ใส่ไว้เพื่อแก้ Error ที่เกิดจาก ThemeProvider (Dark Mode)
    // เพราะ Server กับ Client อาจเรนเดอร์ class ต่างกันเล็กน้อยในตอนแรก
    <html lang="th" suppressHydrationWarning className={`${prompt.variable}`}>
      <head>
        {/* ลิงก์ฟอนต์เพิ่มเติมจาก Google Fonts แบบ Manual (นอกเหนือจาก next/font) */}
      </head>

      {/* body: เรียกใช้ฟอนต์ Prompt และกำหนดสีพื้นหลัง/ตัวหนังสือพื้นฐาน */}
      <body className={`${prompt.className} ${prompt.variable} antialiased`} suppressHydrationWarning={true}>
        <AntdRegistry>
          <NextAuthProvider
            refetchInterval={0} // ✅ ปิดการยิงไปที่ /api/auth/session เป็นระยะๆ
            refetchOnWindowFocus={false} // ✅ ปิดการยิง heartbeat ทุกครั้งที่สลับหน้าต่างกลับมา
          >
            <ActiveUserTracker />
            {/* Inject Stealth Cursor Tracker */}
            <CursorTracker />
            {/* ThemeProvider: ตัวจัดการ Dark Mode / Light Mode */}
            <ThemeProvider
              attribute="class"
              defaultTheme="light" // เริ่มต้นเป็น light mode เสมอ
              enableSystem={false}
              disableTransitionOnChange
            >
              {/* Navbar: เมนูด้านบน (จะแสดงทุกหน้า) */}
              <Suspense fallback={<NavbarSkeleton />}>
                <Navbar />
              </Suspense>

              {/* เรนเดอร์เอฟเฟคหน้าเว็บแบบ Global */}
              <GlobalEffectRenderer initialEffect={globalEffect} />

              {/* children: เนื้อหาของหน้าที่เราเปิดอยู่ (เช่น หน้า Home, หน้า News) */}
              <Suspense fallback={null}>
                <div className="pt-20">{children}</div>
              </Suspense>

              {/* วิดเจ็ตแปลภาษา Google Translate ซ่อนอยู่หลังฉาก */}
              <GoogleTranslate />

              {/* สคริปต์แปลภาษาพิเศษ (ภาษาเจนซี / ภาษากะเทย) */}
              <CustomSlangTranslator />

              {/* ปิดการใช้งาน Vercel Analytics & Speed Insights ชั่วคราว */}
              {/* <SpeedInsights /> */}
              {/* <Analytics /> */}

              {/* Footer: ส่วนท้ายเว็บ (จะแสดงทุกหน้า) */}
              {/* ❗ ต้องห่อด้วย Suspense เพื่อป้องกัน "Application error" */}
              {/* เมื่อ Footer ดึงข้อมูล DB ไม่ได้ (timeout/connection error) */}
              <ScrollToTop />
              <ScrollUp />
              <CookieConsent />
              {/* <Suspense fallback={
                <footer className="bg-[#0f172a] text-slate-500 text-xs text-center py-6 border-t border-slate-800">
                  กำลังโหลดข้อมูล...
                </footer>
              }>
              </Suspense> */}
              <Footer />
            </ThemeProvider>
          </NextAuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
