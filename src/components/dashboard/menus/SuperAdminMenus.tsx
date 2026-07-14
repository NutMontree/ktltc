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
                  <Shield className="w-4 h-4" /> สำหรับผู้ดูแลระบบสูงสุด (Super Admin Only)
                  <span className="h-px bg-sky-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือบริหารจัดการระบบและบุคลากรขั้นสูง
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {permissions?.manage_system && (
                  <ActionCard
                    href="/dashboard/permissions"
                    title="จัดการสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ"
                    icon={Shield}
                    desc="กำหนดสิทธิ์การเข้าถึงแยกตามรายบุคคล"
                    variants={item}
                  />
                )}
                {permissions?.manage_roles_advanced && (
                  <ActionCard
                    href="/manage-roles"
                    title="จัดการ สิทธิ์บุคลากร"
                    icon={UserCog}
                    desc="จัดการระดับผู้ใช้งานและบทบาทหน้าที่"
                    variants={item}
                  />
                )}
                {permissions?.manage_attendance_settings && (
                  <ActionCard
                    href="/attendance-settings"
                    title="ตั้งค่าระบบลงเวลา"
                    icon={Settings}
                    desc="กำหนดตารางเวลาทำงานและเกณฑ์สาย"
                    variants={item}
                  />
                )}
                {permissions?.manage_flagpole_settings && (
                  <ActionCard
                    href="/dashboard/flagpole-settings"
                    title="ตั้งค่าเวลาเข้าแถว"
                    icon={Settings}
                    desc="จัดการกฎและเวลาเข้าแถวเสาธงของนักเรียน"
                    variants={item}
                  />
                )}
                {permissions?.manage_broadcast_notification && (
                  <ActionCard
                    href="/broadcast-notification"
                    title="ส่งข้อความแจ้งเตือน"
                    icon={Bell}
                    desc="ส่งข้อความแจ้งเตือนถึงแผนก/บทบาทที่เลือก"
                    variants={item}
                  />
                )}
                {permissions?.manage_home && (
                  <ActionCard
                    href="/dashboard/manage-home"
                    title="จัดการ เนื้อหาหน้าหลัก"
                    icon={Globe}
                    desc="จัดการแบนเนอร์และประกาศหน้าแรก"
                    variants={item}
                  />
                )}
                {permissions?.manage_navbar && (
                  <ActionCard
                    href="/dashboard/navbar"
                    title="จัดการเมนู (Navbar)"
                    icon={Navigation}
                    desc="ตั้งค่าโครงสร้างเมนูและลิงก์เชื่อมโยง"
                    variants={item}
                  />
                )}
                {permissions?.manage_system && (
                  <ActionCard
                    href="/dashboard/books"
                    title="ระบบจัดการหนังสือ (Books)"
                    icon={BookOpen}
                    desc="สร้างและจัดการหน้าหนังสือ E-Book ทุกเรื่อง"
                    variants={item}
                  />
                )}
                {permissions?.manage_pages && (
                  <ActionCard
                    href="/dashboard/pages"
                    title="จัดการเนื้อหาหน้าเว็บ (Pages)"
                    icon={FileText}
                    desc="จัดการข้อมูลและเนื้อหาในแต่ละหน้า"
                    variants={item}
                  />
                )}
                {permissions?.manage_attendance_data && (
                  <ActionCard
                    href="/dashboard/data-management"
                    title="แก้ไขข้อมูลการลงเวลา"
                    icon={ClipboardList}
                    desc="ตรวจสอบและแก้ไขข้อมูลการเข้า-ออกงาน"
                    variants={item}
                  />
                )}
                {permissions?.manage_work_reports_admin && (
                  <ActionCard
                    href="/work-reports-management"
                    title="แก้ไขรายงานการปฏิบัติงาน"
                    icon={FileText}
                    desc="บริหารจัดการข้อมูลรายงานการปฏิบัติงาน"
                    variants={item}
                  />
                )}

                {customMenus.filter(m => m.workspace === "superadmin" && permissions?.[m.permissionKey]).map(menu => (
                  <ActionCard
                    key={menu._id}
                    href={menu.href}
                    title={menu.title}
                    icon={Layout}
                    desc={menu.desc}
                    variants={item}
                  />
                ))}

                {/* Reset views logic component directly here for super admin */}
                {permissions?.manage_reset_views && (
                  <motion.div variants={item}>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตจำนวนผู้เข้าชมทั้งหมดของทุกโฟลเดอร์ให้กลับเป็น 0?",
                          )
                        ) {
                          try {
                            const res = await fetch("/api/drive/folders?reset=true");
                            if (res.ok) {
                              alert("รีเซ็ตจำนวนผู้เข้าชมทั้งหมดเป็น 0 เรียบร้อยแล้ว!");
                            } else {
                              alert("เกิดข้อผิดพลาดในการรีเซ็ต");
                            }
                          } catch (e) {
                            alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
                          }
                        }
                      }}
                      className="text-left w-full h-full group relative flex flex-col p-px rounded-[2.5rem] bg-zinc-200 dark:bg-zinc-800 hover:bg-linear-to-br hover:from-amber-500 hover:to-orange-600 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 cursor-pointer"
                    >
                      <div className="relative flex flex-col h-full bg-white dark:bg-zinc-950 p-7 rounded-[2.45rem] overflow-hidden transition-colors group-hover:bg-white/95 dark:group-hover:bg-zinc-950/95">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                          <Settings size={120} />
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-linear-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner text-amber-500">
                          <Settings size={24} />
                        </div>

                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2 truncate">
                          รีเซ็ตยอดดูเป็น 0
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-snug mb-6">
                          รีเซ็ตยอดเข้าชมสะสมของโฟลเดอร์ทั้งหมดกลับเป็นศูนย์
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                          ล้างค่าทันที <ArrowUpRight size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          
    </>
  );
}
