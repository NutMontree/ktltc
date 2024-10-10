import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import clsx from "clsx";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./Footer/page";
import Header from "@/components/header";
// import DropdownPage from "@/components/dropdownPage";
import { CommentOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import Link from "next/link";
import { FloatingNavDemo } from "@/components/FloatingNavDemo";

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
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div>
            {/* <div className="bg-gradient-to-r from-[#F9E658] to-[#F7B269] to-[#F78B6E] to-[#F7596E] to-[#F72B6F]"> */}
            <div className=" ">
              <Header />
            </div>
            <Navbar />
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
        </Providers>
      </body>
    </html>
  );
}
