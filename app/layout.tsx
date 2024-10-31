import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { fontSans } from "@/config/fonts";
// import { createContext } from "./providers";
import { UserContextProvider } from "./providers";
import { siteConfig } from "@/config/site";
import { NavbarPage } from "@/components/navbar";
import { FloatButton } from "antd";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CommentOutlined } from "@ant-design/icons";
import { FloatingNavDemo } from "@/components/FloatingNavDemo";
import { Metadata, Viewport } from "next";
import Header from "@/components/header";
import Footer from "./Footer/page";
import Link from "next/link";
import clsx from "clsx";
// import axios from "axios";

// axios.defaults.baseURL = "http://localhost:8000";
// axios.defaults.withCredentials = true;

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
      <body className={clsx(" ", fontSans.variable)}>
        {/* <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}> */}
        <UserContextProvider
          themeProps={{ attribute: "class", defaultTheme: "light" }}
        >
          <div>
            {/* <div className="bg-gradient-to-r from-[#F9E658] to-[#F7B269] to-[#F78B6E] to-[#F7596E] to-[#F72B6F]"> */}
            <div className=" ">
              <Header />
            </div>
            <NavbarPage />
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 2000 }}
            />
            <FloatingNavDemo />
            <main>
              {children}
              <SpeedInsights />
            </main>

            {/* <div className="flex justify-center">
              <InputGame />
            </div> */}

            <Footer />
          </div>
          <FloatButton
            icon={<CommentOutlined />}
            tooltip={
              <div>
                <div>
                  <Link
                    className="  text-sky-500"
                    href="https://www.facebook.com/messages/t/100004276455648"
                  >
                    Mesesnger
                  </Link>
                </div>
              </div>
            }
          />
        </UserContextProvider>
        {/* </Providers> */}
      </body>
    </html>
  );
}
