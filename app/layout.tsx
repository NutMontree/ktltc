import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { fontSans } from "@/config/fonts";
import { UserContextProvider } from "./providers";
import { siteConfig } from "@/config/site";
import { NavbarPage } from "@/components/navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FloatingNavDemo } from "@/components/FloatingNavDemo";
import { Metadata, Viewport } from "next";

import Header from "@/components/header";
import clsx from "clsx";
import Footer from "./Footer/page";
import BackToTop from "@/components/FloatButton";

// import Snow from "@/components/snow";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/images/logo.webp",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={clsx("", fontSans.variable)}>
        <UserContextProvider
          themeProps={{ attribute: "class", defaultTheme: "light" }}
        >
          {/* <Snow /> */}
          <Header />
          <NavbarPage />
          <div className="">
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 2000 }}
            />
            <FloatingNavDemo />
            <main className="mx-auto max-w-screen-2xl">
              {children}
              <SpeedInsights />
            </main>
            <Footer />
            <BackToTop />
          </div>
        </UserContextProvider>
      </body>
    </html>
  );
}
