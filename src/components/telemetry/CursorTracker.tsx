"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function CursorTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const lastSent = useRef<number>(0);
  const isWatchedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only track authenticated users, and don't track super admins
    if (!session?.user?.id || (session.user as any).role === "super_admin") return;

    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/live-cursor?checkStatus=true");
        if (res.ok) {
          const data = await res.json();
          isWatchedRef.current = !!data.watched;
        }
      } catch (e) {}
    };

    // Initial check
    checkStatus();

    // Poll every 10 seconds
    pollInterval = setInterval(checkStatus, 10000);

    const sendTelemetry = (clientX: number, clientY: number) => {
      if (!isWatchedRef.current) return; // Stop if nobody is watching

      const now = Date.now();
      if (now - lastSent.current < 500) return;
      lastSent.current = now;

      const xPercent = (clientX / window.innerWidth) * 100;
      const yPercent = (clientY / window.innerHeight) * 100;

      fetch("/api/admin/live-cursor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: xPercent,
          y: yPercent,
          path: pathname,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        }),
        keepalive: true,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.watched === false) {
            // Admin stopped watching, turn off tracking until next poll
            isWatchedRef.current = false;
          }
        })
        .catch(() => {});
    };

    const handleMouseMove = (e: MouseEvent) => sendTelemetry(e.clientX, e.clientY);
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        sendTelemetry(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleScroll = () => {
      sendTelemetry(window.innerWidth / 2, window.innerHeight / 2);
    };

    // These listeners are safe to leave attached because they check isWatchedRef.current
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [session, pathname]);

  return null; // Stealth component, renders nothing
}
