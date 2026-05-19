"use client";

import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Users,
  Search,
  RefreshCcw,
  ShieldCheck,
  UserCog,
  ArrowLeft,
  Lock,
  Building2,
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  department?: string;
  image?: string;
}

const PROTECTED_ROLES = ["super_admin", "admin"];

// Framer Motion Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ManageRolesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const latestQueryRef = useRef("");

  const currentUserRole = (session?.user as any)?.role;
  const isSuperAdmin = currentUserRole === "super_admin";

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setRoles(data.rolesOrder || Object.keys(data.labels || {}));
        setRoleLabels(data.labels || {});
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchData = async (q = "") => {
    latestQueryRef.current = q;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?all=true&search=${q}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (latestQueryRef.current === q) {
          setUsers(data.users || []);
        }
      }
    } catch (error) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      if (latestQueryRef.current === q) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Debounced Search
  useEffect(() => {
    if (isFirstLoad) {
      fetchData("");
      setIsFirstLoad(false);
      return;
    }

    if (searchQuery === "") {
      fetchData("");
      return;
    }

    const timer = setTimeout(() => {
      fetchData(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const changeRole = async (targetId: string, newRole: string, targetName: string) => {
    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`เปลี่ยนสิทธิ์ ${targetName} เรียบร้อย`, {
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "1rem",
          },
        });
        fetchData(searchQuery);
      }
    } catch (error) {
      toast.error("เปลี่ยนสิทธิ์ไม่สำเร็จ");
    }
  };

  const changeDepartment = async (targetId: string, newDept: string, targetName: string) => {
    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: newDept }),
      });
      if (res.ok) {
        toast.success(`เปลี่ยนสังกัด ${targetName} เรียบร้อย`, {
          style: {
            background: "#3b82f6",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "1rem",
          },
        });
        fetchData(searchQuery);
      }
    } catch (error) {
      toast.error("เปลี่ยนสังกัดไม่สำเร็จ");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const avatarColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-teal-500",
  ];

  const getAvatarColor = (id: string = "") => {
    if (!id) return "bg-blue-500";
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
  };

  const filteredUsers = users;

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Syncing Personnel Records...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <Toaster position="top-right" />

      {/* Background Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header section */}
        <div className="bg-white dark:bg-zinc-900 px-6 py-10 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <UserCog size={220} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-400 hover:text-blue-500 transition-all active:scale-95 border border-slate-100 dark:border-zinc-700"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div className="p-5 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-500/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight leading-none">
                    จัดการ <span className="text-blue-600 italic">สิทธิ์บุคลากร</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Administrative Role & Department Management
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ หรือ USERNAME..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredUsers.map((user) => {
            const isProtected =
              ["super_admin", "admin"].includes(user.role) ||
              (PROTECTED_ROLES.includes(user.role) && !isSuperAdmin);

            return (
              <motion.div
                key={user._id}
                variants={item}
                className="group relative p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-black/10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1.5"
              >
                {isProtected && (
                  <div className="absolute top-6 right-6 p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl">
                    <Lock size={16} />
                  </div>
                )}

                <div className="flex items-center gap-5 mb-8">
                  <div
                    className={`w-16 h-16 rounded-[1.25rem] overflow-hidden flex items-center justify-center text-white font-black shadow-lg relative transition-all duration-300 group-hover:scale-110 ${user.image ? "bg-zinc-100" : getAvatarColor(user._id)}`}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{getInitials(user.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 truncate uppercase tracking-tight">
                      {user.name}
                    </h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 opacity-70 italic">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Role Select */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                      <Shield size={14} className="text-indigo-500" /> บทบาทสิทธิ์
                    </label>
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user._id, e.target.value, user.name)}
                        disabled={isProtected}
                        className={`w-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-all appearance-none shadow-inner ${isProtected ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                      >
                        {roles.map((roleKey) => (
                          <option key={roleKey} value={roleKey}>
                            {roleLabels[roleKey] || roleKey}
                          </option>
                        ))}
                      </select>
                      {!isProtected && (
                        <ChevronRight
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90"
                          size={14}
                        />
                      )}
                    </div>
                  </div>

                  {/* Department Select */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                      <Building2 size={14} className="text-blue-500" /> สังกัด / แผนก
                    </label>
                    <div className="relative">
                      <select
                        value={user.department || "ไม่มีสังกัด"}
                        onChange={(e) => changeDepartment(user._id, e.target.value, user.name)}
                        disabled={isProtected}
                        className={`w-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-all appearance-none shadow-inner ${isProtected ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                      >
                        <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>
                        <option value="ผู้บริหารสถานศึกษา">ผู้บริหารสถานศึกษา</option>
                        <optgroup label="1. ฝ่ายบริหารทรัพยากร">
                          <option value="งานบริหารทั่วไป">งานบริหารทั่วไป</option>
                          <option value="งานบริหารและพัฒนาทรัพยากรบุคคล">
                            งานบริหารและพัฒนาทรัพยากรบุคคล
                          </option>
                          <option value="งานการเงิน">งานการเงิน</option>
                          <option value="งานการบัญชี">งานการบัญชี</option>
                          <option value="งานพัสดุ">งานพัสดุ</option>
                          <option value="งานอาคารสถานที่">งานอาคารสถานที่</option>
                          <option value="งานทะเบียน">งานทะเบียน</option>
                        </optgroup>
                        <optgroup label="2. ฝ่ายยุทธศาสตร์และแผนงาน">
                          <option value="งานพัฒนายุทธศาสตร์ แผนงานโครงการและงบประมาณ">
                            งานพัฒนายุทธศาสตร์ แผนงานโครงการและงบประมาณ
                          </option>
                          <option value="งานมาตรฐานและการประกันคุณภาพการศึกษา">
                            งานมาตรฐานและการประกันคุณภาพการศึกษา
                          </option>
                          <option value="งานศูนย์ดิจิทัลและสื่อสารองค์กร">
                            งานศูนย์ดิจิทัลและสื่อสารองค์กร
                          </option>
                          <option value="งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์">
                            งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์
                          </option>
                          <option value="งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ">
                            งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ
                          </option>
                          <option value="งานติดตามและประเมินผลการอาชีวศึกษา">
                            งานติดตามและประเมินผลการอาชีวศึกษา
                          </option>
                        </optgroup>
                        <optgroup label="3. ฝ่ายกิจการนักเรียน นักศึกษา">
                          <option value="งานกิจกรรมนักเรียนนักศึกษา">
                            งานกิจกรรมนักเรียนนักศึกษา
                          </option>
                          <option value="งานครูที่ปรึกษาและการแนะแนว">
                            งานครูที่ปรึกษาและการแนะแนว
                          </option>
                          <option value="งานปกครองและความปลอดภัยนักเรียน นักศึกษา">
                            งานปกครองและความปลอดภัยนักเรียน นักศึกษา
                          </option>
                          <option value="งานสวัสดิการนักเรียนนักศึกษา">
                            งานสวัสดิการนักเรียนนักศึกษา
                          </option>
                          <option value="งานโครงการพิเศษและการบริการชุมชน">
                            งานโครงการพิเศษและการบริการชุมชน
                          </option>
                        </optgroup>
                        <optgroup label="4. ฝ่ายวิชาการ">
                          <option value="งานแผนกวิชา.../ภาควิชา.../คณะวิชา...">
                            งานแผนกวิชา.../ภาควิชา.../คณะวิชา...
                          </option>
                          <option value="งานพัฒนาหลักสูตรและการจัดการเรียนรู้">
                            งานพัฒนาหลักสูตรและการจัดการเรียนรู้
                          </option>
                          <option value="งานวัดผลและประเมินผล">งานวัดผลและประเมินผล</option>
                          <option value="งานวิทยบริการและเทคโนโลยีการศึกษา">
                            งานวิทยบริการและเทคโนโลยีการศึกษา
                          </option>
                          <option value="งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ">
                            งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ
                          </option>
                          <option value="งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา">
                            งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา
                          </option>
                          <option value="งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ">
                            งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ
                          </option>
                        </optgroup>
                        <optgroup label="5. แผนกวิชา">
                          <option value="สามัญสัมพันธ์">สามัญสัมพันธ์</option>
                          <option value="การบัญชี">การบัญชี</option>
                          <option value="การตลาด">การตลาด</option>
                          <option value="การตลาด/โลจิสติก์">การตลาด/โลจิสติก์</option>
                          <option value="เทคโนโลยีธุรกิจดิจิทัล">เทคโนโลยีธุรกิจดิจิทัล</option>
                          <option value="การโรงแรม">การโรงแรม</option>
                          <option value="เทคนิคพื้นฐาน">เทคนิคพื้นฐาน</option>
                          <option value="ช่างอิเล็กทรอนิกส์">ช่างอิเล็กทรอนิกส์</option>
                          <option value="ช่างยนต์">ช่างยนต์</option>
                          <option value="ยานยนต์ไฟฟ้า">ยานยนต์ไฟฟ้า</option>
                          <option value="ช่างไฟฟ้ากำลัง">ช่างไฟฟ้ากำลัง</option>
                          <option value="ช่างกลโรงงาน">ช่างกลโรงงาน</option>
                          <option value="ช่างเชื่อมโลหะ">ช่างเชื่อมโลหะ</option>
                          <option value="ช่างก่อสร้าง">ช่างก่อสร้าง</option>
                        </optgroup>
                      </select>
                      {!isProtected && (
                        <ChevronRight
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90"
                          size={14}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isProtected ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Active: {roleLabels[user.role] || user.role}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-slate-300 dark:text-zinc-600 hover:text-blue-500 transition-colors cursor-pointer">
                    <ArrowLeft size={16} className="rotate-180" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>



        <AnimatePresence>
          {users.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-32 flex flex-col items-center justify-center text-slate-300 dark:text-zinc-800 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[3rem] shadow-inner"
            >
              <Users size={64} className="mb-6 opacity-20" />
              <p className="font-black text-xl uppercase tracking-tighter">ไม่พบรายชื่อบุคลากร</p>
              <p className="text-sm font-bold uppercase tracking-widest mt-2 opacity-50">
                No Personnel Found in Records
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-20 pb-10 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
            Personnel Authorization & Governance Hub • v2026.03
          </p>
        </div>
      </div>
    </div>
  );
}

