"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // เมื่อมีการเปลี่ยนหน้า (Pathname เปลี่ยน) ให้เลื่อนขึ้นบนสุดทันที
    // ใช้ window.scrollTo(0, 0) เพื่อความรวดเร็ว
    // และใส่ setTimeout เล็กน้อยเพื่อให้แน่ใจว่า DOM เรนเดอร์เสร็จแล้ว
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as any, // "instant" หรือ "auto" จะไม่เลื่อนแบบ Smooth
      });
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
