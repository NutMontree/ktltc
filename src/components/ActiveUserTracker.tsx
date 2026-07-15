"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function ActiveUserTracker() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Logic for generating a unique visitor ID per device
    let visitorId = localStorage.getItem("ktltc_visitor_id");
    if (!visitorId) {
      // Use crypto.randomUUID if available, else a fallback
      visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem("ktltc_visitor_id", visitorId);
    }

    // 2. Ping for Anonymous/All Visitors (Real-time tracking)
    const pingVisitor = async () => {
      try {
        await fetch("/api/tracking/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, path: pathname }),
        });
      } catch (err) {}
    };

    // Ping visitor with a small delay to avoid spamming on fast navigation
    const timeoutId = setTimeout(pingVisitor, 2000);
    const visitorInterval = setInterval(pingVisitor, 120 * 1000);

    // 3. Ping for Logged-in Users (Legacy tracking)
    let userInterval: any;
    if (status === "authenticated" && session?.user) {
      const pingActiveUser = async () => {
      try {
        await fetch("/api/user/active", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (err) {
        // Ignore errors
      }
    };

      pingActiveUser();
      userInterval = setInterval(pingActiveUser, 5 * 60 * 1000);
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(visitorInterval);
      if (userInterval) clearInterval(userInterval);
    };
  }, [status, session, pathname]);

  return null;
}
