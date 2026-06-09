"use client";

import { useEffect, useState } from "react";

const AUTO_REFRESH_SECONDS = 5;

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);

  useEffect(() => {
    console.error("❌ [GlobalError]", error);
  }, [error]);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
              border: "1px solid #fee2e2",
            }}
          >
            {/* ไอคอน */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                border: "1px solid #fecaca",
              }}
            >
              <svg width="32" height="32" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
              ระบบขัดข้อง
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "2rem", lineHeight: 1.6 }}>
              เซิร์ฟเวอร์หรือฐานข้อมูลไม่พร้อมใช้งาน
              <br />ระบบจะรีเฟรชอัตโนมัติในอีก {countdown} วินาที
            </p>

            {/* Countdown bar */}
            <div style={{ background: "#f1f5f9", borderRadius: "9999px", height: 8, marginBottom: "1.5rem", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: "9999px",
                  background: "#0d9488",
                  width: `${(countdown / AUTO_REFRESH_SECONDS) * 100}%`,
                  transition: "width 1s linear",
                }}
              />
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                width: "100%",
                padding: "0.75rem 1.25rem",
                background: "#0d9488",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              รีเฟรชทันที
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
