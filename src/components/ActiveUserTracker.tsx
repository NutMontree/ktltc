"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function ActiveUserTracker() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const pingActive = async () => {
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

    // Ping on mount (page load / component mount) or path change
    pingActive();

    // Ping every 5 minutes to keep the user active while they have the tab open
    const interval = setInterval(pingActive, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [status, session, pathname]);

  return null;
}
