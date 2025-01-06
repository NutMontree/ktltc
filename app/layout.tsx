import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
// import { prompt } from "@/config/fonts";
import { fontSans } from "@/config/fonts";
import { UserContextProvider } from "./providers";
import { siteConfig } from "@/config/site";
import { NavbarPage } from "@/components/navbar";
import { FloatButton } from "antd";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CommentOutlined } from "@ant-design/icons";
import { FloatingNavDemo } from "@/components/FloatingNavDemo";
import { Metadata, Viewport } from "next";
import Header from "@/components/header";
import Footer from "./footer/page";
import Link from "next/link";
import clsx from "clsx";
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
      {/* <body className={clsx("promp-sans", prompt.variable)}> */}
      <body className={clsx(" ", fontSans.variable)}>
        <UserContextProvider
          themeProps={{ attribute: "class", defaultTheme: "light" }}
        >
          {/* <Snow /> */}
          <div>
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
      </body>
    </html>
  );
}
