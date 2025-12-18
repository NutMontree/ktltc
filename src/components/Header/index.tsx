"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SunOutlined,
  MoonOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import menuData from "./menuData";

const Header = () => {
  const pathUrl = usePathname();
  const { theme, setTheme } = useTheme();

  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 40) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  // Submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 flex w-full items-center transition-all duration-300 ${
          sticky
            ? "bg-white/90 py-3 shadow-sm backdrop-blur-md dark:bg-neutral-900/90" // ปรับ py ให้กระชับขึ้นตอน sticky
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          {/* เพิ่ม relative เพื่อให้ absolute element (ชื่อโรงเรียน) อ้างอิงจากตรงนี้ */}
          <div className="relative flex items-center justify-between">
            {/* --- 1. Logo (Left) --- */}
            <Link href="/" className="z-20 flex items-center gap-2">
              {/* z-20 เพื่อให้โลโก้อยู่เหนือข้อความตรงกลางเสมอ */}
              <div
                className={`relative transition-all duration-300 ${sticky ? "h-8 w-28 md:h-10 md:w-36" : "h-10 w-36 md:h-12 md:w-44"}`}
              >
                <Image
                  src="/images/logo.webp"
                  alt="KTLTC Logo"
                  fill
                  className={`object-contain object-left transition-opacity duration-300 ${theme === "dark" ? "opacity-0" : "opacity-100"}`}
                />
                <Image
                  src="/images/logo.webp" // อย่าลืมเปลี่ยนเป็น logo-dark ถ้ามี
                  alt="KTLTC Logo Dark"
                  fill
                  className={`absolute top-0 left-0 object-contain object-left transition-opacity duration-300 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </Link>

            {/* --- 2. Center Title (Mobile Only - Shows when Sticky) --- */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 lg:hidden ${
                sticky
                  ? "visible translate-y-[-50%] opacity-100"
                  : "invisible translate-y-[-20%] opacity-0"
              }`}
            >
              <span className="block pt-2 text-sm font-bold whitespace-nowrap text-slate-800 dark:text-white">
                วิทยาลัยเทคนิคกันทรลักษ์
              </span>
              {/* Optional: ภาษาอังกฤษตัวเล็กๆ ด้านล่าง */}
              {/* <span className="block text-[10px] font-medium text-slate-500">Kantharalak Technical College</span> */}
            </div>

            {/* --- 3. Desktop Menu (Center) --- */}
            <nav className="hidden items-center gap-8 lg:flex">
              {menuData.map((menuItem, index) => (
                <div key={index} className="group relative">
                  {menuItem.path ? (
                    <Link
                      href={menuItem.path}
                      className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                        pathUrl === menuItem.path
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {menuItem.title}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubmenu(index)}
                      className="flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                    >
                      {menuItem.title}
                      <DownOutlined className="text-xs transition-transform group-hover:rotate-180" />
                    </button>
                  )}

                  {/* Submenu Desktop */}
                  {menuItem.submenu && (
                    <div className="invisible absolute top-full left-0 mt-2 w-48 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5 dark:bg-neutral-800 dark:ring-white/10">
                        {menuItem.submenu.map((subItem: any, i: number) => (
                          <Link
                            key={i}
                            href={subItem.path}
                            className="block px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* --- 4. Right Actions (Social & Theme & Mobile Toggle) --- */}
            <div className="z-20 flex items-center gap-4">
              {/* Facebook Icon */}
              <Link
                href="https://www.facebook.com/profile.php?id=100057326985699"
                target="_blank"
                className="hidden opacity-80 transition-opacity hover:opacity-100 sm:block"
              >
                <Image
                  src="/images/facebook.webp"
                  alt="facebook"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </Link>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-blue-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-yellow-400"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <SunOutlined className="text-lg" />
                ) : (
                  <MoonOutlined className="text-lg" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={navbarToggleHandler}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-white/10"
              >
                {navbarOpen ? (
                  <CloseOutlined className="text-xl" />
                ) : (
                  <MenuOutlined className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Mobile Menu (Dropdown) --- */}
        <AnimatePresence>
          {navbarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 w-full overflow-hidden border-t border-slate-100 bg-white shadow-lg lg:hidden dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="container mx-auto space-y-2 px-4 py-4">
                {menuData.map((menuItem, index) => (
                  <div key={index}>
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path}
                        onClick={navbarToggleHandler}
                        className={`block py-2 text-base font-medium ${
                          pathUrl === menuItem.path
                            ? "text-blue-600"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {menuItem.title}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSubmenu(index)}
                          className="flex w-full items-center justify-between py-2 text-base font-medium text-slate-700 dark:text-slate-200"
                        >
                          {menuItem.title}
                          <DownOutlined
                            className={`text-xs transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                          />
                        </button>
                        {/* Mobile Submenu */}
                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1 overflow-hidden pl-4"
                            >
                              {menuItem.submenu?.map(
                                (subItem: any, i: number) => (
                                  <Link
                                    key={i}
                                    href={subItem.path}
                                    onClick={navbarToggleHandler}
                                    className="block py-2 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                  >
                                    {subItem.title}
                                  </Link>
                                ),
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
