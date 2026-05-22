"use client";

import { useEffect, useState } from "react";

const COOKIE_KEY = "ktltc_cookie_consent";

function readConsent() {
  try {
    return window.localStorage.getItem(COOKIE_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value: "accepted" | "declined") {
  try {
    window.localStorage.setItem(COOKIE_KEY, value);
  } catch {
    // Some mobile/private browsing modes block storage. Treat as best effort.
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = readConsent();
    if (!accepted) {
      const timer = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    writeConsent("accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    writeConsent("declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="shrink-0 text-2xl mt-0.5">🍪</span>
            <div className="min-w-0">
              <p className="mb-1 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                เว็บไซต์นี้ใช้คุกกี้
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งาน วิเคราะห์การเข้าชม และให้บริการที่เหมาะสมกับคุณ
                <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">
                  วิทยาลัยเทคนิคกันทรลักษ์ (KTLTC)
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleDecline}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ปฏิเสธ
            </button>
            <button
              onClick={handleAccept}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
            >
              ยอมรับทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
