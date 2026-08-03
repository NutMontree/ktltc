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

export default function StaffMenus({ permissions, customMenus, item, userRole, hasAccess, activeTab, stats }: MenuProps) {
  return (
    <>
      {/* ============================== */}
      {/* 3. STAFF & HR WORKSPACE */}
      {/* ============================== */}
      {(activeTab === "all" || activeTab === "staff") && hasAccess && (
        <div>
          <motion.div variants={item} className="mb-8 flex flex-col gap-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 flex items-center gap-4">
              <ClipboardList className="w-4 h-4" /> สำหรับบุคลากร และ เจ้าหน้าที่ (Staff & HR Workspace)
              <span className="h-px bg-teal-500/10 flex-1" />
            </h2>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              เครื่องมือจัดการข่าวสาร คลังเอกสาร และระบบติดตามผู้เรียน
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {permissions?.manage_drive && (
                  <ActionCard
                    href="/dashboard/drive"
                    title="คลังเอกสารดิจิทัล (Drive)"
                    icon={Folder}
                    desc="ระบบจัดเก็บเอกสารออนไลน์"
                    variants={item}
                  />
                )}
                {permissions?.manage_news && (
                  <ActionCard
                    href="/dashboard/news"
                    title="จัดการข่าวประชาสัมพันธ์"
                    icon={Newspaper}
                    desc="จัดการข่าวสารและประกาศ"
                    variants={item}
                  />
                )}
                {permissions?.manage_elections && (
                  <ActionCard
                    href="/dashboard/election"
                    title="จัดการการเลือกตั้ง"
                    icon={Users}
                    desc="ระบบเลือกตั้งคณะกรรมการ"
                    variants={item}
                  />
                )}
                {permissions?.manage_qa && (
                  <ActionCard
                    href="/dashboard/questions"
                    title="ระบบถาม-ตอบ"
                    icon={MessageSquare}
                    desc="จัดการคำถามและข้อเสนอแนะ"
                    variants={item}
                  />
                )}
                {permissions?.manage_flagpole_data && (
                  <ActionCard
                    href="/dashboard/flagpole-data-management"
                    title="จัดการข้อมูลการเข้าแถว"
                    icon={Edit}
                    desc="แก้ไขและตรวจสอบการเช็คชื่อ"
                    variants={item}
                  />
                )}
                {permissions?.manage_flagpole_dashboard && (
                  <ActionCard
                    href="/dashboard/flagpole-dashboard"
                    title="สถิติภาพรวมการเข้าแถว"
                    icon={BarChart3}
                    desc="แดชบอร์ดสรุปผลการเข้าแถว"
                    variants={item}
                  />
                )}
                {permissions?.manage_flagpole_reports && (
                  <ActionCard
                    href="/dashboard/flagpole-reports"
                    title="ระบบรายงานการเข้าแถว"
                    icon={FileText}
                    desc="พิมพ์รายงานการเข้าแถว"
                    variants={item}
                  />
                )}
                {permissions?.manage_student_data_validation && (
                  <ActionCard
                    href="/student-data-validation"
                    title="ตรวจสอบข้อมูลนักเรียน"
                    icon={ShieldCheck}
                    desc="ยืนยันและตรวจสอบประวัติ"
                    variants={item}
                  />
                )}
                {permissions?.manage_attendance_work_reports && (
                  <ActionCard
                    href="/work-reports"
                    title="ระบบรายงานการปฏิบัติงาน"
                    icon={ClipboardList}
                    desc="ตรวจสอบและพิมพ์รายงานผล"
                    variants={item}
                  />
                )}
                {permissions?.manage_ita && (
                  <ActionCard
                    href="/dashboard/ita"
                    title="ระบบข้อมูล ITA / OIT"
                    icon={Database}
                    desc="จัดการข้อมูลประเมินคุณธรรม"
                    variants={item}
                  />
                )}
                {customMenus.filter(m => m.workspace === "staff" && permissions?.[m.permissionKey]).map(menu => {
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
