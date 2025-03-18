"use client";

import "../styles/index.css";
import '@ant-design/v5-patch-for-react-19';
import "../styles/prism-vsc-dark-plus.css";

import clsx from "clsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopHeader from "@/components/TopHeader";
import ScrollToTop from "@/components/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import FloatingNavDemo from "@/components/FloatingNavDemo";
import CookieConsentBanner from './cookie/page'
import { fontSans } from "@/config/fonts";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 0);
  }, []);

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head />
      <body className={clsx("", fontSans.variable)}>
        {loading ? (
          <PreLoader />
        ) : (
          <ThemeProvider
            attribute="class"
            enableSystem={false}
            defaultTheme="light"
          >
            <CookieConsentBanner />
            <div className="py-2">
              <TopHeader />
            </div>
            <div className="pb-20">
              <Header />
            </div>
            {children}
            <Footer />
            <FloatingNavDemo />
            <ScrollToTop />
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
