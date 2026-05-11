"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/**
 * LogoutBtn.tsx (Client Component): ปุ่มสำหรับออกจากระบบ
 * 
 * หน้าที่: 
 * 1. แสดงปุ่มที่ปรับเปลี่ยนตามธีม (Light/Dark Mode)
 * 2. เมื่อคลิก จะแสดง Confirm Dialog เพื่อยืนยันการออกจากระบบ
 * 3. เรียกใช้ฟังก์ชัน signOut ของ NextAuth เพื่อล้าง Session และ Redirect ไปหน้า Login
 */

export default function LogoutBtn() {
  // สถานะการโหลด (เพื่อป้องกันการกดซ้ำ)
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    // 1. ถามความยืนยันก่อนออก
    if (!confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) return;

    setIsLoading(true);
    try {
      // 2. เรียกใช้ signOut: 
      // - ล้าง Cookie ใน Browser
      // - ส่ง Request ไปหา Server เพื่อทำลาย Session
      // - ส่งผู้ใช้กลับไปหน้า /login
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // กรณีเกิดข้อผิดพลาด ให้ใช้วิธีเปลี่ยนหน้าแบบปกติ (Hard Reload)
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full px-2">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="group flex items-center justify-center gap-2 w-full max-w-[200px] py-2.5 rounded-xl
                   bg-white dark:bg-zinc-900 
                   text-red-500 hover:text-white
                   border border-red-200 dark:border-red-900/30
                   hover:bg-red-500 hover:border-red-500
                   transition-all duration-300 font-bold active:scale-95 disabled:opacity-50
                   shadow-sm hover:shadow-red-500/20 hover:shadow-lg"
      >
        <span className="text-lg transition-transform group-hover:scale-110">
          {isLoading ? (
            // Spinner แสดงสถานะกำลังโหลด
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            "🚪"
          )}
        </span>
        <span className="text-sm">
          {isLoading ? "กำลังออก..." : "ออกจากระบบ"}
        </span>
      </button>
    </div>
  );
}

