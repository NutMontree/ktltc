"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

/**
 * ThemeProvider.tsx: คอมโพเนนต์หลักสำหรับจัดการ Context ของระบบ
 * 
 * หน้าที่: 
 * 1. SessionProvider: จัดการสถานะการ Login ของผู้ใช้ (Next-Auth) ทั่วทั้งแอป
 * 2. NextThemesProvider: จัดการระบบ Dark/Light Mode ของเว็บไซต์
 * 3. ToasterWrapper: แสดงผลการแจ้งเตือน (Toast Notifications) ที่ปรับสีตาม Theme
 */

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <SessionProvider>
      <NextThemesProvider {...props}>
        {children}
        <ToasterWrapper />
      </NextThemesProvider>
    </SessionProvider>
  );
}

/**
 * ToasterWrapper: ส่วนจัดการการแจ้งเตือน (Toast)
 * ปรับแต่งสไตล์ (สีพื้นหลัง, สีตัวอักษร, เงา) ให้เข้ากับโหมดมืดและโหมดสว่างโดยอัตโนมัติ
 */
function ToasterWrapper() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: isDark ? '#18181b' : '#fff',
          color: isDark ? '#fff' : '#18181b',
          border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '400px',
          boxShadow: isDark 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

