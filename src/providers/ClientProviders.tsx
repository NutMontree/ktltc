"use client";

import React from "react";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={thTH}>
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
      </ConfigProvider>
    </AntdRegistry>
  );
}

