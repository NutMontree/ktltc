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
import { Prompt } from "next/font/google";
import { SessionProvider } from "next-auth/react";
// import { Analytics } from "@vercel/analytics/next";
import ScrollUp from "@/components/Common/ScrollUp";
import CookieConsent from "@/components/CookieConsent";
import SessionWatcher from "@/components/SessionWatcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
// import { auth } from "@/lib/auth";
// import { SpeedInsights } from "@vercel/speed-insights/next";

// 1. ตั้งค่าฟอนต์หลักของเว็บ (Prompt) จาก Google Fonts
// การใช้ next/font ช่วยลด Layout Shift และโหลดฟอนต์ได้รวดเร็ว
const prompt = Prompt({
  subsets: ["thai", "latin"], // รองรับภาษาไทยและอังกฤษ
  weight: ["300", "400", "500", "600", "700"], // น้ำหนักฟอนต์ที่ใช้
  variable: "--font-prompt", // กำหนด CSS variable เพื่อเรียกใช้ใน Tailwind
  display: "swap", // ให้แสดงฟอนต์สำรองก่อนจนกว่าฟอนต์จริงจะโหลดเสร็จ
});

// 2. กำหนด Metadata สำหรับ SEO และการแชร์ลง Social Media (Open Graph)
export const metadata: Metadata = {
  metadataBase: new URL("https://ktltc.site"),
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
    url: "https://ktltc.site", // ลิงก์เว็บไซต์จริง
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

// 3. ฟังก์ชัน RootLayout: โครงสร้างหลักของหน้าเว็บ
export default async function RootLayout({
  children, // children คือเนื้อหาของแต่ละหน้า (Page) ที่จะถูกแทรกเข้ามาตรงกลาง
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    // suppressHydrationWarning ใส่ไว้เพื่อแก้ Error ที่เกิดจาก ThemeProvider (Dark Mode)
    // เพราะ Server กับ Client อาจเรนเดอร์ class ต่างกันเล็กน้อยในตอนแรก
    <html lang="th" suppressHydrationWarning className={`${prompt.variable}`}>
      <head>
        {/* ลิงก์ฟอนต์เพิ่มเติมจาก Google Fonts แบบ Manual (นอกเหนือจาก next/font) */}
      </head>

      {/* body: เรียกใช้ฟอนต์ Prompt และกำหนดสีพื้นหลัง/ตัวหนังสือพื้นฐาน */}
      <body className={`${prompt.className} ${prompt.variable} antialiased`}>
        <AntdRegistry>
          <SessionProvider
            refetchInterval={0} // ✅ ปิดการยิงไปที่ /api/auth/session เป็นระยะๆ
            refetchOnWindowFocus={false} // ✅ ปิดการยิง heartbeat ทุกครั้งที่สลับหน้าต่างกลับมา
          >
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
              {/* children: เนื้อหาของหน้าที่เราเปิดอยู่ (เช่น หน้า Home, หน้า News) */}
              <div className="pt-20">{children}</div>

              {/* ปิดการใช้งาน Vercel Analytics & Speed Insights ชั่วคราว */}
              {/* <SpeedInsights /> */}
              {/* <Analytics /> */}

              {/* Footer: ส่วนท้ายเว็บ (จะแสดงทุกหน้า) */}
              <ScrollUp />
              <CookieConsent />
              <Footer />
            </ThemeProvider>
          </SessionProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
