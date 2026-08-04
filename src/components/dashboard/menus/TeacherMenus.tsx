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

export default function TeacherMenus({ permissions, customMenus, item, userRole, hasAccess, activeTab, stats }: MenuProps) {
  return (
    <>
{/* ============================== */}
          {/* 2. TEACHER WORKSPACE */}
          {/* ============================== */}
          {(activeTab === "all" || activeTab === "teacher") && hasAccess && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 flex items-center gap-4">
                  <Users className="w-4 h-4" /> สำหรับครูและอาจารย์ผู้สอน (Teacher Workspace)
                  <span className="h-px bg-violet-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือจัดการและตรวจสอบข้อมูลนักเรียนในที่ปรึกษา / ประจำแผนกวิชา
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">

                {customMenus.filter(m => m.workspace === "teacher" && permissions?.[m.permissionKey]).map(menu => (
                  <ActionCard
                    key={menu._id}
                    href={menu.href}
                    title={menu.title}
                    icon={Layout}
                    desc={menu.desc}
                    variants={item}
                  />
                ))}
              </div>
            </div>
          )}

          
    </>
  );
}
