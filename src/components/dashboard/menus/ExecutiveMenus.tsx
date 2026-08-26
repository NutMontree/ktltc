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

export default function ExecutiveMenus({ permissions, customMenus, item, userRole, hasAccess, activeTab, stats }: MenuProps) {
  return (
    <>
      {/* ============================== */}
      {/* 4. EXECUTIVE WORKSPACE */}
      {/* ============================== */}
      {(activeTab === "all" || activeTab === "executive") && hasAccess && (
        <div>
          <motion.div variants={item} className="mb-8 flex flex-col gap-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 flex items-center gap-4">
              <ShieldCheck className="w-4 h-4" /> สำหรับผู้บริหาร (Executive Workspace)
              <span className="h-px bg-rose-500/10 flex-1" />
            </h2>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              เครื่องมือติดตาม ตรวจสอบ และวิเคราะห์ภาพรวมการปฏิบัติงาน
            </span>
          </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {customMenus.filter(m => m.workspace === "executive" && permissions?.[m.permissionKey]).map((menu) => {
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
              </div>
        </div>
      )}


    </>
  );
}
