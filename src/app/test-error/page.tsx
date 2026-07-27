"use client";

import { useEffect } from "react";

export default function TestErrorPage() {
  useEffect(() => {
    throw new Error("นี่คือข้อผิดพลาดจำลองเพื่อดูหน้า Error");
  }, []);

  return <div>กำลังสร้าง Error...</div>;
}
