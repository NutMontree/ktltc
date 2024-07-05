import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import Danger from "@/components/danger";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/images/logo.png",
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
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div>
            <Navbar />
            <Danger />
            <main>
              {children}
              <SpeedInsights />
            </main>

            <div className="w-full py-3 ">
              <div className="flex gap-2 justify-center">
                <div className="text-default-600 text-xs">
                  Copyright © 2023.
                </div>

                <div className="text-xs text-cyan-700">
                  KTLTC / งานศูนย์ข้อมูลและสารสนเทศ
                </div>
              </div>
              <div className="flex gap-2 justify-center ">
                <div className="text-default-600 text-xs"> Designed </div>
                <Link
                  isExternal
                  className="flex justify-center gap-1 text-current "
                  href="https://www.facebook.com/profile.php?id=61553558543619"
                  title="All M Min"
                >
                  <div className="text-xs font-medium">By All M Min</div>
                </Link>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
