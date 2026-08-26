import { ActionCard } from "@/components/dashboard/DashboardCards";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock, BookOpen, MessageSquare, Layout, Users, Activity, FileText, CheckSquare,
  BarChart3, MonitorPlay, Building2, UserCog, Settings, Flag, Briefcase, Key,
  Volume2, ShieldCheck, PieChart, Megaphone, Map, Calendar, Folder, BookText, HelpCircle,
  Database, ServerCrash, Smartphone, Download, UserPlus, Image as ImageIcon,
  BookMarked, School, Presentation, Video, HardDrive, ScanLine, Navigation, ClipboardList, Layers, LayoutTemplate, Newspaper,
  CalendarCheck, Shield, Bell, Globe, ArrowUpRight, BarChart2, Edit
} from "lucide-react";

const IconMap: any = {
  Clock, BookOpen, MessageSquare, Layout, Users, Activity, FileText, CheckSquare,
  BarChart3, MonitorPlay, Building2, UserCog, Settings, Flag, Briefcase, Key,
  Volume2, ShieldCheck, PieChart, Megaphone, Map, Calendar, Folder, BookText, HelpCircle,
  Database, ServerCrash, Smartphone, Download, UserPlus, ImageIcon,
  BookMarked, School, Presentation, Video, HardDrive, ScanLine, Navigation, ClipboardList, Layers, LayoutTemplate, Newspaper,
  CalendarCheck, Shield, Bell, Globe, ArrowUpRight, BarChart2, Edit
};

export interface MenuProps {
  permissions: any;
  customMenus: any[];
  item: any;
  userRole?: string;
  hasAccess?: boolean;
  activeTab?: string;
  stats?: any;
}

export default function SuperAdminMenus({ permissions, customMenus, item, userRole, hasAccess, activeTab, stats }: MenuProps) {
  return (
    <>
      {/* ============================== */}
      {/* 5. SUPER ADMIN WORKSPACE */}
      {/* ============================== */}
      {(activeTab === "all" || activeTab === "superadmin") && hasAccess && (
        <div>
          <motion.div variants={item} className="mb-8 flex flex-col gap-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 flex items-center gap-4">
              <Shield className="w-4 h-4" /> สำหรับผู้ดูแลระบบ (Super Admin Workspace)
              <span className="h-px bg-sky-500/10 flex-1" />
            </h2>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              เครื่องมือจัดการระบบ ฐานข้อมูล และสิทธิ์การใช้งาน
            </span>
          </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {customMenus.filter(m => m.workspace === "superadmin" && permissions?.[m.permissionKey]).map((menu) => {
                  const Icon = IconMap[menu.icon] || Layout;
                  return (
                    <ActionCard
                      key={menu._id}
                      href={menu.href}
                      title={menu.title}
                      icon={Icon}
                      desc={menu.desc}
                      variants={item}
                    />
                  );
                })}

                {/* Reset views logic component directly here for super admin */}
                {permissions?.manage_reset_views && (
                  <motion.div variants={item}>
                    <Link
                      href="/dashboard/reset-views"
                      className="group relative flex flex-col h-full rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/5 dark:shadow-black/40 hover:shadow-2xl hover:shadow-rose-500/20"
                    >
                      <div className="relative flex flex-col h-full bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-7 rounded-[2.5rem] overflow-hidden transition-all duration-500 border border-white/60 dark:border-white/10 group-hover:bg-white/60 dark:group-hover:bg-white/10 group-hover:border-white/80 dark:group-hover:border-white/20">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                          <Activity size={120} />
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-linear-to-br from-rose-500 to-red-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner text-rose-500">
                          <Activity size={24} />
                        </div>

                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2 truncate">
                          รีเซ็ตยอดเข้าชม
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-snug mb-6">
                          จัดการยอดวิวโพสต์
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                          เข้าสู่ระบบจัดการ <ArrowUpRight size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>
        </div>
      )}


    </>
  );
}
