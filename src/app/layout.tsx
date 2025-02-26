"use client";

import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import clsx from "clsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Headers from "@/components/headers";
import ScrollToTop from "@/components/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { fontSans } from "@/config/fonts";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import FloatingNavDemo from "@/components/FloatingNavDemo";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
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
            <div className="py-2">
              <Headers />
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
