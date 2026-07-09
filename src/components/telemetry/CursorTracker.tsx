"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function CursorTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const lastSent = useRef<number>(0);

  useEffect(() => {
    // Only track authenticated users, and don't track super admins (so they don't track themselves tracking others)
    if (!session?.user?.id || (session.user as any).role === "super_admin") return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to send max 2 times per second (500ms) to save server load
      if (now - lastSent.current < 500) return;

      lastSent.current = now;

      // Calculate percentage instead of absolute pixels to handle different screen sizes
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;

      // Send payload stealthily via fetch (no UI blocking)
      fetch("/api/admin/live-cursor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          x: xPercent,
          y: yPercent,
          path: pathname,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        }),
        keepalive: true, // helps ensure request finishes even if user navigates away
      }).catch(() => {
        // Silently fail if network drops, user doesn't need to know
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [session, pathname]);

  return null; // Stealth component, renders nothing
}
