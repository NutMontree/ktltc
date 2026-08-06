"use client";

import React from "react";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <NextAuthProvider
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NextAuthProvider>
    </AntdRegistry>
  );
}
