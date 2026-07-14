"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SessionWatcher() {
  const { data: session } = useSession();
  const alertShown = useRef(false);

  useEffect(() => {
    // If an error is registered in the session and we haven't alerted yet
    if ((session as any)?.error && !alertShown.current) {
      alertShown.current = true;
      
      const sessionError = (session as any).error;
      
      if (sessionError === "SessionExpired") {
        toast.error("คุณไม่ได้ใช้งานเกิน 1 ชั่วโมง ระบบจึงทำการลงชื่อออก", {
          duration: 6000,
        });
      } else if (sessionError === "ConcurrentLogin") {
        toast.error("มีการเข้าสู่ระบบซ้อนกันจากอุปกรณ์อื่น เซสชันปัจจุปันจึงถูกยุติ", {
          duration: 6000,
        });
      }

      // Forcefully log them out and clear memory
      // setTimeout(() => {
      //   signOut({ callbackUrl: "/login" });
      // }, 1000);
    }
  }, [session]);

  return null;
}
