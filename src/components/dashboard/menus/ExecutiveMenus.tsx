import { ActionCard } from "@/components/dashboard/DashboardCards";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Clock, BookOpen, MessageSquare, Layout, Users, Activity, FileText, CheckSquare,
  BarChart3, MonitorPlay, Building2, UserCog, Settings, Flag, Briefcase, Key,
  Volume2, ShieldCheck, PieChart, Megaphone, Map, Calendar, Folder, BookText, HelpCircle,
  Database, ServerCrash, Smartphone, Download, UserPlus, Image as ImageIcon,
  BookMarked, School, Presentation, Video, HardDrive, ScanLine, Navigation, ClipboardList, Layers, LayoutTemplate, Newspaper,
  CalendarCheck, Shield, Bell, Globe, ArrowUpRight
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
                  <UserCog className="w-4 h-4" /> สำหรับผู้บริหาร (Executive Workspace)
                  <span className="h-px bg-rose-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือติดตาม ตรวจสอบ และวิเคราะห์ภาพรวมการปฏิบัติงาน
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {permissions?.access_teacher_dashboard && (
                  <ActionCard
                    href="/teacher-dashboard"
                    title="แดชบอร์ดติดตามงานครู"
                    icon={Clock}
                    desc="สถิติภาพรวมและติดตามความก้าวหน้าการเรียนการสอนของครู"
                    variants={item}
                  />
                )}
                {permissions?.access_teacher_verification && (
                  <ActionCard
                    href="/teacher-verification"
                    title="ตรวจสอบการจัดการเรียนการสอน"
                    icon={CalendarCheck}
                    desc="ตรวจสอบบันทึกการเรียนการสอนและการเข้าเรียนของนักเรียนแยกตามรายวิชา"
                    variants={item}
                  />
                )}

                {permissions?.manage_attendance_dashboard && (
                  <>
                    <ActionCard
                      href="/attendance-dashboard"
                      title="แดชบอร์ดการเข้างานบุคลากร"
                      icon={CalendarCheck}
                      desc="สถิติการเข้างานภาพรวมของฝ่ายต่างๆ"
                      variants={item}
                    />
                    <ActionCard
                      href="/attendance-report"
                      title="รายงานการเข้างาน"
                      icon={Clock}
                      desc="ระบบออกรายงานสรุปการเข้างานบุคลากร"
                      variants={item}
                    />
                  </>
                )}

                {permissions?.manage_attendance_work_reports && (
                  <ActionCard
                    href="/work-reports"
                    title="ระบบรายงานการปฏิบัติงาน"
                    icon={ClipboardList}
                    desc="ตรวจสอบและพิมพ์รายงานผลการปฏิบัติงาน"
                    variants={item}
                  />
                )}

                {permissions?.manage_attendance_leave_approvals && (
                  <ActionCard
                    href="/leave-approvals"
                    title="อนุมัติการลางาน"
                    icon={CalendarCheck}
                    desc="ระบบพิจารณาและอนุมัติใบลาอิเล็กทรอนิกส์"
                    variants={item}
                  />
                )}
                {permissions?.manage_supervision_requests && (
                  <ActionCard
                    href="/dashboard/supervision/requests"
                    title="คำร้องการนิเทศ"
                    icon={ShieldCheck}
                    desc="ตรวจพิจารณาและอนุมัติผลการนิเทศ"
                    variants={item}
                  />
                )}
                {customMenus.filter(m => m.workspace === "executive" && permissions?.[m.permissionKey]).map(menu => (
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
