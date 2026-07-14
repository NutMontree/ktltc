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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {permissions?.access_teacher_students && (
                  <ActionCard
                    href="/teacher/students"
                    title="ข้อมูลนักเรียนในที่ปรึกษา / แผนก"
                    icon={Users}
                    desc="ตรวจสอบประวัตินักเรียน แยกตามห้องเรียนและกลุ่มเรียน"
                    variants={item}
                  />
                )}
                {permissions?.access_gate_scanner && (
                  <ActionCard
                    href="/teacher/gate-scanner"
                    title="ระบบสแกนเข้า-ออก (Gate)"
                    icon={ScanLine}
                    desc="สแกน QR Code เพื่อบันทึกการออกนอกสถานศึกษาและเปิด GPS"
                    variants={item}
                  />
                )}
                {permissions?.access_gps_tracking && (
                  <ActionCard
                    href="/teacher/tracking"
                    title="ระบบติดตามตำแหน่ง (GPS)"
                    icon={Navigation}
                    desc="แสดงตำแหน่งพิกัดของนักเรียนบนแผนที่แบบเรียลไทม์"
                    variants={item}
                  />
                )}
                {permissions?.access_dve_teacher && (
                  <ActionCard
                    href="/dashboard/supervision"
                    title="ระบบนิเทศนักศึกษาฝึกงาน"
                    icon={ClipboardList}
                    desc="จัดการข้อมูลและบันทึกผลการนิเทศนักเรียนนักศึกษา"
                    variants={item}
                  />
                )}
                {permissions?.access_lesson_plans && (
                  <ActionCard
                    href="/dashboard/director/lesson-plans"
                    title="จัดการแผนการสอน"
                    icon={FileText}
                    desc="ระบบส่งและติดตามแผนการสอนออนไลน์"
                    variants={item}
                  />
                )}
                {permissions?.access_dpa_evaluation && (
                  <ActionCard
                    href="/dashboard/director/dpa-evaluation"
                    title="ประเมินผลการปฏิบัติงาน / DPA"
                    icon={ShieldCheck}
                    desc="แฟ้มพัฒนางานและประเมินผลการสอน"
                    variants={item}
                  />
                )}
                {permissions?.access_plc && (
                  <ActionCard
                    href="/dashboard/director/plc"
                    title="ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)"
                    icon={Users}
                    desc="บันทึกการรวมกลุ่มและรายงานผลการจัดทำ PLC"
                    variants={item}
                  />
                )}
                {permissions?.access_student_care && (
                  <ActionCard
                    href="/dashboard/director/student-care"
                    title="ระบบดูแลช่วยเหลือนักเรียน"
                    icon={ClipboardList}
                    desc="รายงานเยี่ยมบ้าน คัดกรองนักเรียน และผลสัมฤทธิ์"
                    variants={item}
                  />
                )}
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
