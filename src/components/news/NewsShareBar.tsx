"use client";

import { useState } from "react";

/**
 * NewsShareBar.tsx (Client Component): แถบปุ่มสำหรับแชร์ข่าวสารไปยังโซเชียลมีเดีย
 * 
 * หน้าที่: 
 * 1. สร้างลิงก์สำหรับแชร์ไปยัง Facebook, Line และ X (Twitter)
 * 2. มีฟังก์ชัน "คัดลอกลิงก์" (Copy to Clipboard) พร้อมแสดงสถานะเมื่อคัดลอกสำเร็จ
 * 3. ใช้ดีไซน์แบบปุ่มมน (Rounded) ที่รองรับทั้ง Light และ Dark Mode
 */

type NewsShareBarProps = {
  title: string; // หัวข้อข่าว
  url: string;   // URL ของหน้าข่าว
};

/**
 * IconShare: ไอคอนรูปการแชร์ (SVG)
 */
function IconShare() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );
}

/**
 * IconCopy: ไอคอนรูปการคัดลอก (SVG)
 */
function IconCopy() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

// สไตล์ของปุ่มที่ใช้ซ้ำกัน
const buttonClassName =
  "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-400";

export default function NewsShareBar({ title, url }: NewsShareBarProps) {
  // สถานะบอกว่าคัดลอกลิงก์ไปหรือยัง
  const [copied, setCopied] = useState(false);

  // เตรียม URL และ Title ให้พร้อมสำหรับการส่งผ่าน URL (Encoding)
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // รายการลิงก์สำหรับแชร์แต่ละแพลตฟอร์ม
  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Line",
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  /**
   * handleCopy: ฟังก์ชันคัดลอกลิงก์ลง Clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // เปลี่ยนข้อความกลับเป็น "คัดลอกลิงก์" หลังจากผ่านไป 2 วินาที
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <IconShare />
        แชร์ข่าวนี้
      </div>
      <div className="flex flex-wrap gap-3">
        {/* วนลูปสร้างปุ่มแชร์ */}
        {shareLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName}
          >
            {item.label}
          </a>
        ))}
        
        {/* ปุ่มคัดลอกลิงก์ */}
        <button type="button" onClick={handleCopy} className={buttonClassName}>
          <IconCopy />
          {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
        </button>
      </div>
    </section>
  );
}

