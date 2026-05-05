"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import { NavItem } from "@/types/nav";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "next-auth/react";
import {
  FileText,
  UserCog,
  ChevronDown,
  LogOut,
  Command,
  Shield,
  Download,
  Bell,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import NotificationBell from "./NotificationBell";

type MenuItem = NavItem & {
  _id: string;
  children?: MenuItem[];
};

interface NavbarClientProps {
  menuTree: MenuItem[];
  username?: string;
  role?: string;
  image?: string;
  userId?: string;
}

export default function NavbarClient({
  menuTree = [],
  username,
  role,
  image,
  userId,
}: NavbarClientProps) {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const pathname = usePathname();


  const getRoleDisplayName = (r: string) => {
    switch (r) {
      case "super_admin":
        return "ผู้ดูแลระบบสูงสุด";
      case "admin":
        return "ผู้ดูแลระบบ";
      case "editor":
        return "บรรณาธิการ";
      case "hr":
        return "บุคลากร";
      case "director":
        return "ผู้อำนวยการ";
      case "staff":
        return "เจ้าหน้าที่";
      case "user":
        return "สมาชิก";
      default:
        return r ? r.replace("_", " ") : "Member";
    }
  };

  const displayRole = getRoleDisplayName(role?.toLowerCase() || "");
  const isAdmin =
    role?.toLowerCase() === "admin" ||
    role?.toLowerCase() === "editor" ||
    role?.toLowerCase() === "super_admin";
  const isSuperAdmin = role?.toLowerCase() === "super_admin";
  const isHR =
    role?.toLowerCase() === "hr" || role?.toLowerCase() === "deputy_resource";
  const isExecutive =
    role?.toLowerCase() === "director" ||
    [
      "deputy_resource",
      "deputy_strategy",
      "deputy_academic",
      "deputy_student_affairs",
    ].includes(role?.toLowerCase() || "");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".desktop-menu-container") &&
        !target.closest(".user-dropdown-container")
      ) {
        setActiveMenuId(null);
        setIsUserDropdownOpen(false);
      }
    };

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      if (!deferredPrompt) {
        setDeferredPrompt(e);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setActiveMenuId(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const ensureAbsolute = (path: string) => {
    if (
      !path ||
      path.startsWith("/") ||
      path.startsWith("http") ||
      path.startsWith("#")
    )
      return path || "#";
    return `/${path}`;
  };

  const filteredMenuTree = menuTree.filter((item) => {
    const r = role?.toLowerCase();
    if (r === "user" || r === "teacher" || r === "janitor") {
      const restrictedPaths = [
        "/dashboard",
        "/attendance-dashboard",
        "/attendance-report",
        "/leave-approvals",
      ];
      return !restrictedPaths.some((p) => item.path?.startsWith(p));
    }
    return true;
  });

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? "pt-1 sm:pt-2 px-2 sm:px-2 lg:px-2" : ""}`}
    >
      <nav
        className={`w-full max-w-[1600px] mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl border border-white/40 dark:border-zinc-800/50 py-0.5 px-4 lg:px-6 ring-1 ring-zinc-900/5 dark:ring-white/5"
            : "py-4 px-4 lg:px-6 bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* --- 1. LOGO --- */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group outline-none"
          >
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 drop-shadow-sm">
              <Image
                src="/images/favicon.ico"
                alt="KTL Logo"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 dark:text-white font-black text-[22px] tracking-tighter uppercase italic drop-shadow-sm hidden sm:block">
              KTL<span className="text-blue-600 dark:text-blue-500">TC</span>
            </span>
          </Link>

          {/* --- 2. DESKTOP MENU --- */}
          <div className="hidden lg:flex items-center gap-1.5 desktop-menu-container">
            {filteredMenuTree.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActiveNode =
                pathname === ensureAbsolute(item.path) ||
                activeMenuId === item._id;

              return (
                <div
                  key={item._id}
                  className="relative"
                  onMouseEnter={() => setActiveMenuId(item._id)}
                  onMouseLeave={() => setActiveMenuId(null)}
                >
                  <Link
                    href={hasChildren ? "#" : (ensureAbsolute(item.path) || "#")}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault();
                        if (activeMenuId !== item._id) {
                          setActiveMenuId(item._id);
                          setIsUserDropdownOpen(false);
                        }
                      } else {
                        setActiveMenuId(null);
                      }
                    }}
                    className={`px-3 py-2 rounded-full flex items-center gap-1 text-[14px] font-bold transition-all whitespace-nowrap outline-none ${
                      isActiveNode
                        ? "text-blue-700 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/80 dark:hover:text-white dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="px-1">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenuId === item._id ? "rotate-180 text-blue-600 dark:text-blue-400" : "opacity-40"}`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu / Dropdown */}
                  {hasChildren && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
                        activeMenuId === item._id
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto z-50"
                          : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                      }`}
                    >
                      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] min-w-[240px] p-2 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5">
                        {item.children!.map((child) => (
                          <Link
                            key={child._id}
                            href={ensureAbsolute(child.path) || "#"}
                            onClick={() => setActiveMenuId(null)}
                            className="block px-4 py-3 text-[14px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-blue-50/80 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 rounded-2xl transition-all"
                          >
                            {child.label}
                          </Link>
                        ))}
                        {item.label === "อื่นๆ" && deferredPrompt && (
                          <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                            <button
                              onClick={handleInstallClick}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                            >
                              <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Download size={16} />
                              </div>
                              ติดตั้งแอพพลิเคชั่น
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- 3. RIGHT ACTIONS --- */}
          <div className="flex items-center gap-2.5 shrink-0">
            {username && <NotificationBell />}

            <div className="p-0.5 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="hidden lg:block w-px h-8 bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {username ? (
              <div
                className="relative user-dropdown-container"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                {/* User Profile Button */}
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                    setActiveMenuId(null);
                  }}
                  className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all duration-300 outline-none ${
                    isUserDropdownOpen
                      ? "bg-white dark:bg-zinc-900 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20"
                      : "bg-white/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-sm shrink-0">
                    {image ? (
                      <Image
                        src={image}
                        alt={username}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold uppercase">
                        {username.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left hidden lg:block overflow-hidden">
                    <p
                      className={`text-[9px] font-black uppercase leading-none mb-0.5 tracking-widest ${
                        isSuperAdmin
                          ? "text-sky-600 dark:text-sky-400"
                          : isAdmin
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {displayRole}
                    </p>
                    <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                      {username}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 hidden lg:block ${isUserDropdownOpen ? "rotate-180 text-blue-500" : "text-zinc-400"}`}
                  />
                </button>

                {/* Glassmorphism Dropdown Menu */}
                <div
                  className={`absolute right-0 top-full pt-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
                    isUserDropdownOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto z-60"
                      : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden w-64 ring-1 ring-black/5 dark:ring-white/5 flex flex-col max-h-[85vh] custom-scrollbar-thin">
                    {/* Header profile area inside dropdown */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                        จัดการบัญชี
                      </span>
                      <Link
                        href={userId ? `/dashboard/profile/${userId}` : "/dashboard/profile"}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-500/20"
                      >
                        <UserCog className="w-3.5 h-3.5" /> โปรไฟล์
                      </Link>
                    </div>

                    <div className="p-2 space-y-1 overflow-y-auto">
                      {/* WFH Link - Refined Executive Style */}
                      <Link
                        href="/wfh"
                        className="flex items-center gap-3 px-3 py-3 text-[13px] font-bold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-2xl transition-all group"
                      >
                        <div className="p-1.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors shadow-sm">
                          <FileText size={16} />
                        </div>
                        รายงานปฏิบัติงาน (WFH)
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-[13px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                        >
                          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors shadow-sm">
                            <Command size={16} />
                          </div>
                          เข้าสู่ระบบ Dashboard
                        </Link>
                      )}

                      {/* --- ADMIN & EXECUTIVE LINKS --- */}
                      {(isSuperAdmin || isAdmin || isHR || isExecutive) && (
                        <>
                          <div className="px-3 pt-3 pb-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-2 mb-1">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Shield size={12} /> ระบบจัดการบุคลากร
                            </p>
                          </div>

                          {isSuperAdmin && (
                            <div className="bg-sky-50/50 dark:bg-sky-500/5 rounded-2xl p-1.5 mb-2 border border-sky-100 dark:border-sky-500/10">
                              <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest px-2 py-1">
                                เฉพาะ Super Admin
                              </p>
                              <Link
                                href="/dashboard/super-admin"
                                className="flex items-center gap-3 px-3 py-2 text-[12.5px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl transition-all"
                              >
                                ศูนย์ควบคุมจัดการระบบ
                              </Link>
                              <Link
                                href="/dashboard/data-management"
                                className="flex items-center gap-3 px-3 py-2 text-[12.5px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                              >
                                แก้ไขข้อมูลการเข้างาน / ลา
                              </Link>
                              <Link
                                href="/work-reports-management"
                                className="flex items-center gap-3 px-3 py-2 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl transition-all"
                              >
                                รายงานปฏิบัติงานทุกแผนก
                              </Link>
                            </div>
                          )}

                          <Link
                            href="/attendance-dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                          >
                            ภาพรวมลงเวลาบุคลากร
                          </Link>

                          {(isSuperAdmin ||
                            isHR ||
                            role?.toLowerCase() === "director") && (
                            <>
                              <Link
                                href="/attendance-report"
                                className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all"
                              >
                                ระบบรายงานการเข้างาน
                              </Link>
                              <Link
                                href="/work-reports"
                                className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all"
                              >
                                ระบบรายงานปฏิบัติงาน
                              </Link>
                              <Link
                                href="/leave-approvals"
                                className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all"
                              >
                                จัดการอนุมัติใบลา
                              </Link>
                            </>
                          )}

                          {(isSuperAdmin || isHR) && (
                            <>
                              <div className="my-2 border-t border-zinc-100 dark:border-zinc-800/60" />
                              <Link
                                href="/manage-roles"
                                className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all"
                              >
                                <span>จัดการสิทธิ์บุคลากร</span>
                              </Link>
                              <Link
                                href="/attendance-settings"
                                className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all"
                              >
                                <span>ตั้งค่าเวลาเข้างาน</span>
                              </Link>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/30">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 px-3 py-3 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all btn-press"
                      >
                        <LogOut size={16} />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Sign In Button */
              <Link
                href="/login"
                className="relative overflow-hidden px-6 py-2.5 rounded-full bg-linear-to-b from-blue-500 to-blue-600 text-white text-[15px] font-bold transition-all hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] active:scale-95 border border-blue-400/20 shadow-sm"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            <div className="lg:hidden sm:pl-2">
              <MobileMenu
                menuTree={filteredMenuTree}
                image={image}
                deferredPrompt={deferredPrompt}
                onInstall={handleInstallClick}
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

const customScrollbarStyles = `
  .custom-scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.4);
    border-radius: 10px;
  }
  .dark .custom-scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(82, 82, 91, 0.5);
  }
  .btn-press {
     transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .btn-press:active {
     transform: scale(0.96);
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("navbar-custom-styles")
) {
  const style = document.createElement("style");
  style.id = "navbar-custom-styles";
  style.innerHTML = customScrollbarStyles;
  document.head.appendChild(style);
}
