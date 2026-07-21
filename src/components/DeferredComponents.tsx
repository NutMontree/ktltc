"use client";

/**
 * DeferredComponents.tsx: Client Component สำหรับโหลด heavy components แบบ lazy
 * 
 * ✅ ย้าย dynamic() ที่ใช้ ssr: false มาไว้ที่นี่
 * เพราะ Next.js 16 ไม่อนุญาตให้ใช้ ssr: false ใน Server Components
 */

import dynamic from "next/dynamic";

// Google Translate widget - ไม่จำเป็นตอน initial render
const GoogleTranslate = dynamic(
  () => import("@/components/GoogleTranslate"),
  { ssr: false }
);

// Custom Slang Translator - ไม่จำเป็นตอน initial render  
const CustomSlangTranslator = dynamic(
  () => import("@/components/CustomSlangTranslator"),
  { ssr: false }
);



/**
 * DeferredComponents: รวม heavy components ที่ไม่จำเป็นตอน initial load
 * เพื่อลด FCP/INP โดยโหลดทีหลังเมื่อ browser ว่าง
 */
export default function DeferredComponents() {
  return (
    <>
      <GoogleTranslate />
      <CustomSlangTranslator />
    </>
  );
}
