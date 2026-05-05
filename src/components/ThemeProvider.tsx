"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

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

function ToasterWrapper() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options for all toasts
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
