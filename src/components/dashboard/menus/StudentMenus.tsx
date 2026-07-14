import { 
  CalendarCheck, Shield, Bell, Globe, ArrowUpRight,ActionCard } from "@/components/dashboard/DashboardCards";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Clock, BookOpen, MessageSquare, Layout, Users, Activity, FileText, CheckSquare,
  BarChart3, MonitorPlay, Building2, UserCog, Settings, Flag, Briefcase, Key,
  Volume2, ShieldCheck, PieChart, Megaphone, Map, Calendar, Folder, BookText, HelpCircle,
  Database, ServerCrash, Smartphone, Download, UserPlus, Image as ImageIcon,
  BookMarked, School, Presentation, Video, HardDrive, ScanLine, Navigation, ClipboardList, Layers, LayoutTemplate, Newspaper
} from "lucide-react";

export interface MenuProps {
  permissions: any;
  customMenus: any[];
  item: any;
  userRole?: string;
  hasAccess?: boolean;
  activeTab?: string;
  stats?: any;
}

export default function StudentMenus({ permissions, customMenus, item, userRole, hasAccess, activeTab, stats }: MenuProps) {
  return (
    <>
{/* ============================== */}
          {/* 1. STUDENT WORKSPACE */}
          {/* ============================== */}
          {(activeTab === "all" || activeTab === "student") && hasAccess && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 flex items-center gap-4">
                  <Clock className="w-4 h-4" /> สำหรับนักเรียน นักศึกษา (Student Workspace)
                  <span className="h-px bg-indigo-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  พื้นที่เข้าใช้งานการเช็คชื่อเข้าเรียน ศูนย์เรียนรู้ทวิภาคี และระบบแชท
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {(userRole === "student" || userRole === "super_admin") && (
                  <ActionCard
                    href="/student/flagpole"
                    title="เช็คชื่อเข้าแถวหน้าเสาธง"
                    icon={Clock}
                    desc="ระบบเช็คชื่อและสแกนพิกัดหน้าเสาธงของนักเรียน"
                    variants={item}
                  />
                )}
                {permissions?.access_dve_student && (
                  <ActionCard
                    href="/dashboard/dve/student"
                    title="ศูนย์การศึกษาระบบทวิภาคี (DVE)"
                    icon={BookOpen}
                    desc="ระบบบันทึกเวลาเรียน เรียนออนไลน์ ส่งงาน และทำแบบทดสอบวิชาทวิภาคี"
                    variants={item}
                  />
                )}
                {permissions?.student_dashboard && (
                  <ActionCard
                    href="/dashboard/chat"
                    title="แชท / กล่องข้อความ"
                    icon={MessageSquare}
                    desc="ระบบติดต่อสื่อสาร ส่งข้อความ และคุยแชทประสานงานอาจารย์"
                    variants={item}
                  />
                )}
                {customMenus.filter(m => m.workspace === "student" && permissions?.[m.permissionKey]).map(menu => (
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
