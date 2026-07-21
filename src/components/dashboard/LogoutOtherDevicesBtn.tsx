"use client";

import { useState } from "react";
import { logoutOtherDevicesAction } from "@/app/actions";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function LogoutOtherDevicesBtn() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogoutOthers = async () => {
    if (!confirm("คุณต้องการออกจากระบบในอุปกรณ์อื่นทั้งหมด ยกเว้นอุปกรณ์นี้ใช่หรือไม่?")) return;

    setIsLoading(true);
    try {
      await logoutOtherDevicesAction();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Logout others error:", error);
      alert("เกิดข้อผิดพลาดในการออกจากระบบอุปกรณ์อื่น");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogoutOthers}
      disabled={isLoading || success}
      className={`
        group flex items-center justify-center gap-2 px-6 h-[42px] rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg whitespace-nowrap
        ${success 
          ? "bg-emerald-600 text-white shadow-emerald-500/20" 
          : "bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700 active:scale-95"}
        disabled:opacity-70
      `}
    >
      <span className="text-lg transition-transform group-hover:scale-110">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : success ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <ShieldAlert className="w-4 h-4" />
        )}
      </span>
      <span>
        {isLoading 
          ? "กำลังดำเนินการ..." 
          : success 
            ? "เรียบร้อย" 
            : "ออกจากระบบอุปกรณ์อื่น"}
      </span>
    </button>
  );
}
