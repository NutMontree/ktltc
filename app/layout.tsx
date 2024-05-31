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
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <Danger />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
              <SpeedInsights />
            </main>
            <footer className="w-full py-3">
              <div className="flex justify-center">
                <span className="text-default-600 text-xs">
                  copyright ©2023.
                </span>
                <p> </p>
                <p className="text-xs text-cyan-700">
                  KTLTC / งานศูนย์ข้อมูลและสารสนเทศ
                </p>
              </div>
              <Link
                isExternal
                className="flex justify-center gap-1 text-current "
                href="https://www.facebook.com/profile.php?id=61553558543619"
                title="All M Min"
              >
                <p className="text-xs">Designed By All M Min</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
