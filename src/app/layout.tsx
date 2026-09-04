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
import ClientProviders from "@/providers/ClientProviders";
import ClientBackgroundEffects from "@/components/ClientBackgroundEffects";
import { AppleStyleDock } from "@/components/AppleStyleDock";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import NextTopLoader from "nextjs-toploader";

import { Prompt, Inter, Sarabun, Charm } from 'next/font/google';

// 1. ตั้งค่าฟอนต์หลักของเว็บ (Prompt)
const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-prompt',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
  preload: false,
});

const charm = Charm({
  subsets: ['thai', 'latin'],
  weight: ['400', '700'],
  variable: '--font-charm',
  display: 'swap',
  preload: false,
});

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

import { unstable_cache } from "next/cache";

const getGlobalEffect = unstable_cache(
  async () => {
    try {
      const client = await clientPromise;
      const db = client.db("ktltc_db");
      const effectSetting = await db.collection("site_settings").findOne({ key: "global_effect" });
      return effectSetting ? effectSetting.value : "none";
    } catch (error) {
      console.error("Failed to fetch global_effect:", error);
      return "none";
    }
  },
  ["global_effect_cache"],
  { revalidate: 300 } // Cache for 5 minutes
);

// 3. ฟังก์ชัน RootLayout: โครงสร้างหลักของหน้าเว็บ
export default async function RootLayout({
  children, // children คือเนื้อหาของแต่ละหน้า (Page) ที่จะถูกแทรกเข้ามาตรงกลาง
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ดึงค่า Global Effect จากฐานข้อมูลเพื่อนำไปเรนเดอร์ให้กับทุกคน
  const globalEffect = await getGlobalEffect();

  return (
    // suppressHydrationWarning ใส่ไว้เพื่อแก้ Error ที่เกิดจาก ThemeProvider (Dark Mode)
    // เพราะ Server กับ Client อาจเรนเดอร์ class ต่างกันเล็กน้อยในตอนแรก
    <html lang="th" suppressHydrationWarning className={`${prompt.variable} ${inter.variable} ${sarabun.variable} ${charm.variable}`}>
      <head>
        {/* ลิงก์ฟอนต์เพิ่มเติมจาก Google Fonts แบบ Manual (นอกเหนือจาก next/font) */}
      </head>

      {/* body: เรียกใช้ฟอนต์ Prompt และกำหนดสีพื้นหลัง/ตัวหนังสือพื้นฐาน */}
      <body className={`${prompt.className} antialiased`} suppressHydrationWarning={true}>
        <ClientProviders>
              <NextTopLoader 
                color="#3b82f6" 
                initialPosition={0.08} 
                crawlSpeed={200} 
                height={3} 
                crawl={true} 
                showSpinner={false} 
                easing="ease" 
                speed={200} 
                shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" 
              />
              {/* Navbar: เมนูด้านบน (จะแสดงทุกหน้า) */}
              <div className="print:hidden">
                <Suspense fallback={<NavbarSkeleton />}>
                  <Navbar />
                </Suspense>
              </div>

              {/* children: เนื้อหาของหน้าที่เราเปิดอยู่ (เช่น หน้า Home, หน้า News) */}
              <Suspense fallback={null}>
                <div className="pt-20 print:pt-0">{children}</div>
              </Suspense>

              {/* รวมเอฟเฟกต์และของที่โหลดเบื้องหลังให้อยู่ฝั่ง Client (ไม่บล็อก Server) */}
              <ClientBackgroundEffects globalEffect={globalEffect} />

              {/* ปิดการใช้งาน Vercel Analytics & Speed Insights ชั่วคราว */}
              {/* <SpeedInsights /> */}
              {/* <Analytics /> */}

              {/* Footer: ส่วนท้ายเว็บ (จะแสดงทุกหน้า) */}
              {/* ❗ ต้องห่อด้วย Suspense เพื่อป้องกัน "Application error" */}
              {/* เมื่อ Footer ดึงข้อมูล DB ไม่ได้ (timeout/connection error) */}
              {/* <Suspense fallback={
                <footer className="bg-[#0f172a] text-slate-500 text-xs text-center py-6 border-t border-slate-800">
                  กำลังโหลดข้อมูล...
                </footer>
              }>
              </Suspense> */}
              <AppleStyleDock />
              <Footer />
              <FloatingChatWidget />
        </ClientProviders>
      </body>
    </html>
  );
}
