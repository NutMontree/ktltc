"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import {
  User as UserIcon,
  Shield,
  Key,
  School,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Smartphone,
  Mail,
  UserCheck,
  Building2,
  Terminal,
  Bookmark,
  Calendar,
  Layers,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "admin" | "custom" | "security">(
    "general",
  );

  const [roles, setRoles] = useState<string[]>([]);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});
  const [showOriginalPassword, setShowOriginalPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    lineId: "",
    role: "user",
    department: "ไม่มีสังกัด",
    position: "",
    faction: "",
    isActive: true,
    studentId: "",
    classGroupId: "",
    citizenId: "",
    academicLevel: "",
    studentStatus: "กำลังศึกษา",
    learnerType: "ทวิภาคี",
    isInternship: false,
    groupCode: "",
    positionNumber: "",
    affiliation: "",
    govStartDate: "",
    retirementDate: "",
    password: "",
    confirmPassword: "",
    originalPasswordText: "",
  });

  // Fetch dynamic roles from API
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

  // Fetch current user details
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          lineId: data.lineId || "",
          role: data.role || "user",
          department: data.department || "ไม่มีสังกัด",
          position: data.position || "",
          faction: data.faction || "",
          isActive: typeof data.isActive === "boolean" ? data.isActive : true,
          studentId: data.studentId || "",
          classGroupId: data.classGroupId || data.groupCode || "",
          citizenId: data.citizenId || "",
          academicLevel: data.academicLevel || "",
          studentStatus: data.studentStatus || "กำลังศึกษา",
          learnerType: data.learnerType || "ทวิภาคี",
          isInternship: typeof data.isInternship === "boolean" ? data.isInternship : false,
          groupCode: data.classGroupId || data.groupCode || "",
          positionNumber: data.positionNumber || "",
          affiliation: data.affiliation || "",
          govStartDate: data.govStartDate || "",
          retirementDate: data.retirementDate || "",
          password: "",
          confirmPassword: "",
          originalPasswordText: data.passwordText || "",
        });
      } else {
        toast.error("ไม่พบข้อมูลผู้ใช้ที่ระบุ");
        router.push("/dashboard/super-admin");
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) return toast.error("กรุณากรอกชื่อ-นามสกุล");
    if (!formData.username.trim()) return toast.error("กรุณากรอกชื่อผู้ใช้ (Username)");
    if (formData.password) {
      if (formData.password.length < 4) {
        return toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร");
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("ยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
      }
    }

    try {
      setSaving(true);
      const { confirmPassword, originalPasswordText, ...rest } = formData;
      const updatePayload: any = { ...rest };

      // If password field is empty, delete it so database retains original password
      if (!updatePayload.password) {
        delete updatePayload.password;
      }

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        toast.success(`อัปเดตข้อมูลคุณ ${formData.name} สำเร็จ ✨`);
        router.push("/dashboard/super-admin");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
  };

  const isStudentRole = () => {
    return (
      ["student", "นักเรียน/นักศึกษา", "นักเรียน", "นักศึกษา"].includes(formData.role) ||
      formData.role?.includes("นักเรียน") ||
      formData.role?.includes("นักศึกษา")
    );
  };

  // Helper to determine if the user has professional role (staff, teacher, hr, admin, etc.)
  const isEmployeeRole = () => {
    if (isStudentRole()) return false;
    return !["user"].includes(formData.role);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-2 md:p-6 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Mesh Glowing Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header Action bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-4 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/super-admin"
              className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-blue-500 rounded-2xl transition-all shadow-inner active:scale-95 border border-transparent dark:border-zinc-700/50"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span>แก้ไขบัญชีผู้ใช้งาน</span>
                <span className="text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">
                  ADMIN PORTAL
                </span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5 mt-0.5">
                แก้ไขข้อมูลสิทธิ์และรหัสผ่านบุคลากรวิทยาลัย
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/super-admin")}
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-transparent dark:border-zinc-700"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>บันทึกการแก้ไข</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeleton Loader */}
        {loading ? (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl p-8 space-y-6">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
                <div className="h-4 w-1/4 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/4 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-md" />
                  <div className="h-12 bg-slate-100 dark:bg-zinc-800/50 animate-pulse rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar Controls / User Details card */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-[2.5rem] shadow-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <UserIcon size={120} />
                </div>

                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg border border-blue-500/20">
                    <UserIcon size={36} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">
                      {formData.name || "ไม่มีชื่อผู้ใช้"}
                    </h2>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
                      @{formData.username || "username"}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                    />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                      สถานะ: {formData.isActive ? "เปิดใช้งาน" : "ระงับการใช้งาน"}
                    </span>
                  </div>

                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`w-full py-3 px-4 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border ${
                      formData.isActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    {formData.isActive
                      ? "ระงับสิทธิ์เข้าใช้ระบบ 🔒"
                      : "เปิดอนุมัติสิทธิ์เข้าใช้งาน 🔓"}
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800/80 space-y-3.5 text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex justify-between font-bold">
                    <span>ประเภทสิทธิ์</span>
                    <span className="text-slate-800 dark:text-zinc-200 capitalize">
                      {roleLabels[formData.role] || formData.role}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>สังกัด/แผนก</span>
                    <span
                      className="text-slate-800 dark:text-zinc-200 truncate max-w-[150px]"
                      title={formData.department}
                    >
                      {formData.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Navigation Tabs */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-4xl shadow-xl p-3 flex flex-col gap-1.5">
                {[
                  {
                    id: "general",
                    label: "ข้อมูลพื้นฐานทั่วไป",
                    icon: UserIcon,
                    color: "text-blue-500",
                  },
                  {
                    id: "admin",
                    label: "สังกัด & สิทธิ์เข้าถึง",
                    icon: Shield,
                    color: "text-indigo-500",
                  },
                  {
                    id: "custom",
                    label: "ข้อมูลเฉพาะเจาะจง",
                    icon: Layers,
                    color: "text-amber-500",
                  },
                  {
                    id: "security",
                    label: "รหัสผ่าน & ความปลอดภัย",
                    icon: Key,
                    color: "text-rose-500",
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-left transition-all active:scale-98 ${
                        isActive
                          ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-inner"
                          : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <Icon size={16} className={isActive ? tab.color : "text-slate-400"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Editor Form Panel */}
            <div className="md:col-span-8">
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-[2.5rem] shadow-xl p-6 sm:p-8 min-h-[500px] flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                  {/* TAB 1: General Info */}
                  {activeTab === "general" && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 flex-1"
                    >
                      <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
                        <UserIcon className="text-blue-500" size={18} />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base">
                          ข้อมูลทั่วไปของบัญชีผู้ใช้
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <UserIcon size={16} />
                            </span>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="กรอกชื่อและนามสกุลจริง..."
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Username Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
                              @
                            </span>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="กรอกชื่อผู้ใช้ภาษาอังกฤษ..."
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ที่อยู่อีเมล (Email)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail size={16} />
                            </span>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="example@ktltc.ac.th..."
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            เบอร์โทรศัพท์ติดต่อ (Phone)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Smartphone size={16} />
                            </span>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="0xx-xxxxxxx..."
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Line ID Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ไอดีไลน์ (Line ID)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <UserCheck size={16} />
                            </span>
                            <input
                              type="text"
                              name="lineId"
                              value={formData.lineId}
                              onChange={handleInputChange}
                              placeholder="กรอก Line ID..."
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Roles and Department */}
                  {activeTab === "admin" && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 flex-1"
                    >
                      <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
                        <Shield className="text-indigo-500" size={18} />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base">
                          ข้อมูลด้านสังกัด และสิทธิ์เข้าใช้งานระบบ
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Role Selector */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            บทบาท / สิทธิ์การใช้งานระบบ
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Shield size={16} />
                            </span>
                            <select
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer appearance-none shadow-inner"
                            >
                              {roles.map((roleKey) => (
                                <option key={roleKey} value={roleKey}>
                                  {roleLabels[roleKey] || roleKey.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Department Selector */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ฝ่ายงาน / แผนกวิชาที่สังกัด
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Building2 size={16} />
                            </span>
                            <select
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer appearance-none shadow-inner"
                            >
                              <option value="ไม่มีสังกัด">- ไม่ระบุสังกัดงาน -</option>
                              <option value="ผู้บริหารสถานศึกษา">ผู้บริหารสถานศึกษา</option>
                              {DEPARTMENT_GROUPS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                  {group.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        </div>

                        {!isStudentRole() && (
                          <>
                            {/* Position input (ตำแหน่ง) */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                ตำแหน่งราชการ / ตำแหน่งงาน (Position)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <Briefcase size={16} />
                                </span>
                                <input
                                  type="text"
                                  name="position"
                                  value={formData.position}
                                  onChange={handleInputChange}
                                  placeholder="เช่น ครู, เจ้าพนักงานธุรการ, หัวหน้างาน..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                                />
                              </div>
                            </div>

                            {/* Faction input (ฝ่าย) */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                ฝ่ายย่อยหลัก (Faction)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <Layers size={16} />
                                </span>
                                <input
                                  type="text"
                                  name="faction"
                                  value={formData.faction}
                                  onChange={handleInputChange}
                                  placeholder="เช่น ฝ่ายวิชาการ, ฝ่ายบริหารทรัพยากร..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Specific student/employee fields */}
                  {activeTab === "custom" && (
                    <motion.div
                      key="custom"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 flex-1"
                    >
                      <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
                        <Layers className="text-amber-500" size={18} />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base">
                          ข้อมูลเฉพาะตามบทบาทผู้ใช้
                        </h3>
                      </div>

                      {/* Scenario 1: Student role */}
                      {isStudentRole() && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Student ID */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                รหัสนักเรียน / นักศึกษา (Student ID)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <School size={16} />
                                </span>
                                <input
                                  type="text"
                                  name="studentId"
                                  value={formData.studentId}
                                  onChange={handleInputChange}
                                  placeholder="กรอกรหัสประจำตัวนักเรียน 11 หลัก..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                                />
                              </div>
                            </div>

                            {/* Citizen ID */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                เลขประจำตัวประชาชน (Citizen ID)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <UserIcon size={16} />
                                </span>
                                <input
                                  type="text"
                                  name="citizenId"
                                  value={formData.citizenId}
                                  onChange={handleInputChange}
                                  placeholder="กรอกเลขบัตรประชาชน 13 หลัก..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                                />
                              </div>
                            </div>

                            {/* Class Group ID */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                รหัสกลุ่มเรียน / รหัสชั้นเรียน (Group Code)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <Terminal size={16} />
                                </span>
                                <input
                                  type="text"
                                  name="classGroupId"
                                  value={formData.classGroupId}
                                  onChange={handleInputChange}
                                  placeholder="เช่น 6631020001, 652010102..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                                />
                              </div>
                            </div>

                            {/* Academic Level */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                ระดับชั้นการศึกษา (Academic Level)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <Layers size={16} />
                                </span>
                                <select
                                  name="academicLevel"
                                  value={formData.academicLevel}
                                  onChange={handleInputChange}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer appearance-none shadow-inner"
                                >
                                  <option value="">-- เลือกระดับชั้น --</option>
                                  <option value="ปวช. 1">ปวช. 1</option>
                                  <option value="ปวช. 2">ปวช. 2</option>
                                  <option value="ปวช. 3">ปวช. 3</option>
                                  <option value="ปวช 1">ปวช 1</option>
                                  <option value="ปวช 2">ปวช 2</option>
                                  <option value="ปวช 3">ปวช 3</option>
                                  <option value="ปวส. 1">ปวส. 1</option>
                                  <option value="ปวส. 2">ปวส. 2</option>
                                  <option value="ปวส 1">ปวส 1</option>
                                  <option value="ปวส 2">ปวส 2</option>
                                  <option value="ปริญญาตรี">ปริญญาตรี</option>
                                  {formData.academicLevel &&
                                    ![
                                      "ปวช. 1",
                                      "ปวช. 2",
                                      "ปวช. 3",
                                      "ปวช 1",
                                      "ปวช 2",
                                      "ปวช 3",
                                      "ปวส. 1",
                                      "ปวส. 2",
                                      "ปวส 1",
                                      "ปวส 2",
                                      "ปริญญาตรี",
                                    ].includes(formData.academicLevel) && (
                                      <option value={formData.academicLevel}>
                                        {formData.academicLevel}
                                      </option>
                                    )}
                                </select>
                              </div>
                            </div>

                            {/* Learner Type */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                ประเภทผู้เรียน (Learner Type)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <UserIcon size={16} />
                                </span>
                                <select
                                  name="learnerType"
                                  value={formData.learnerType}
                                  onChange={handleInputChange}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer appearance-none shadow-inner"
                                >
                                  <option value="ทวิภาคี">ทวิภาคี (DVE)</option>
                                  <option value="ปกติ">ปกติ (Normal)</option>
                                </select>
                              </div>
                            </div>

                            {/* Student Status */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                                สถานภาพนักเรียน (Student Status)
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  <Briefcase size={16} />
                                </span>
                                <select
                                  name="studentStatus"
                                  value={formData.studentStatus}
                                  onChange={handleInputChange}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer appearance-none shadow-inner"
                                >
                                  <option value="กำลังศึกษา">กำลังศึกษา</option>
                                  <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                                  <option value="พ้นสภาพ">พ้นสภาพ</option>
                                  <option value="ลาพักการเรียน">ลาพักการเรียน</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Internship Toggle Switch */}
                          <div className="p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Briefcase size={14} className="text-blue-500" />
                                <span>
                                  สถานะการฝึกงาน / ฝึกประสบการณ์วิชาชีพ (Internship Status)
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1 max-w-[480px]">
                                สลับสวิตช์เพื่อระบุว่านักศึกษารายนี้อยู่ในสถานะกำลังฝึกงานภายนอกสถานประกอบการหรือไม่
                                (มีผลกับการแสดงผลข้อมูลทวิภาคี DVE)
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  isInternship: !prev.isInternship,
                                }))
                              }
                              className={`w-full sm:w-auto px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border ${
                                formData.isInternship
                                  ? "bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30"
                                  : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:bg-slate-200/50"
                              }`}
                            >
                              {formData.isInternship
                                ? "กำลังฝึกงานอยู่ 💼"
                                : "เรียนปกติในวิทยาลัย 🏫"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scenario 2: Employee role (Teachers & Staff) */}
                      {isEmployeeRole() && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Position Number */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                              เลขที่ตำแหน่งข้าราชการ / พนักงาน (Position Number)
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Bookmark size={16} />
                              </span>
                              <input
                                type="text"
                                name="positionNumber"
                                value={formData.positionNumber}
                                onChange={handleInputChange}
                                placeholder="กรอกเลขที่ตำแหน่ง..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Affiliation */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                              ส่วนราชการ / สังกัด / หน่วยงานหลัก (Affiliation)
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Building2 size={16} />
                              </span>
                              <input
                                type="text"
                                name="affiliation"
                                value={formData.affiliation}
                                onChange={handleInputChange}
                                placeholder="วิทยาลัยเทคนิคหลวงพ่อคูณ ปริสุทฺโธ..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Government Start Date */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                              วันเริ่มบรรจุรับราชการ / เริ่มปฏิบัติงาน
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Calendar size={16} />
                              </span>
                              <input
                                type="text"
                                name="govStartDate"
                                value={formData.govStartDate}
                                onChange={handleInputChange}
                                placeholder="ตัวอย่าง: 1 พฤษภาคม 2565..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Retirement Date */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                              วันครบกำหนดเกษียณอายุราชการ / สิ้นสุดสัญญา
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Calendar size={16} />
                              </span>
                              <input
                                type="text"
                                name="retirementDate"
                                value={formData.retirementDate}
                                onChange={handleInputChange}
                                placeholder="ตัวอย่าง: 30 กันยายน 2605..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scenario 3: General User role with no special info */}
                      {formData.role === "user" && (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3 bg-slate-50/20 dark:bg-zinc-950/10">
                          <UserIcon className="w-8 h-8 text-slate-300 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                            ไม่มีข้อมูลเฉพาะที่จะต้องแสดง
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 max-w-[320px] mx-auto leading-relaxed">
                            เนื่องจากสิทธิ์ผู้ใช้ของบุคคลนี้เป็น "บุคคลทั่วไป"
                            ระบบจึงไม่ต้องการฟิลด์กรอกข้อมูลทางการศึกษาหรือประวัติการรับราชการเพิ่มเติม
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: Reset Password Security fields */}
                  {activeTab === "security" && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 flex-1"
                    >
                      <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
                        <Key className="text-rose-500" size={18} />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base">
                          เปลี่ยนรหัสผ่านเพื่อความปลอดภัย (Reset Password)
                        </h3>
                      </div>

                      <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-start gap-3.5 mb-6">
                        <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                        <div className="text-xs">
                          <h4 className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-tight">
                            ข้อแนะนำความปลอดภัย
                          </h4>
                          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed font-bold mt-1">
                            หากไม่ต้องการเปลี่ยนรหัสผ่านของสมาชิกรายนี้ ให้เว้นช่องป้อนข้อมูลทั้ง 2
                            ช่องด้านล่างนี้ว่างไว้ ระบบจะไม่เข้าไปยุ่งกับรหัสผ่านเดิมของผู้ใช้
                          </p>
                        </div>
                      </div>

                      {/* แสดงรหัสผ่านเดิมในฐานข้อมูล (สำหรับ super_admin เท่านั้น) */}
                      {session?.user && (session.user as any).role === "super_admin" && (
                        <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 rounded-3xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                              <Key size={14} className="text-blue-500" />
                              <span>รหัสผ่านเดิมของผู้ใช้รายนี้ (Original Password)</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1">
                              เนื่องจากท่านเป็นผู้ดูแลระบบระดับสูงสุด (Super Admin)
                              ท่านสามารถเปิดดูรหัสผ่านปัจจุบันที่บันทึกไว้ในระบบได้
                            </p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <span className="font-mono text-sm px-4 py-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl select-all min-w-[120px] text-center font-bold text-slate-700 dark:text-zinc-200">
                              {showOriginalPassword
                                ? formData.originalPasswordText || "(ไม่มีรหัสผ่านข้อความ)"
                                : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowOriginalPassword(!showOriginalPassword)}
                              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl transition-all border border-transparent dark:border-zinc-700 active:scale-95"
                            >
                              {showOriginalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* New Password */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ระบุรหัสผ่านใหม่ (New Password)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock size={16} />
                            </span>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 4 หลัก..."
                              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                            {formData.password && (
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-all active:scale-95"
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                            ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm Password)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock size={16} />
                            </span>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..."
                              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-inner"
                            />
                            {formData.confirmPassword && (
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-all active:scale-95"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {formData.password && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-100 dark:border-zinc-900">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              formData.password.length >= 4
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {formData.password.length >= 4
                              ? "✓ ปลอดภัย (>= 4 หลัก)"
                              : "✗ สั้นเกินไป (ต้องการ >= 4 หลัก)"}
                          </span>

                          {formData.confirmPassword && (
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                formData.password === formData.confirmPassword
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {formData.password === formData.confirmPassword
                                ? "✓ รหัสผ่านตรงกัน"
                                : "✗ รหัสผ่านยังไม่ตรงกัน"}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtext info */}
                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={12} /> ข้อมูลจะอัปเดตทันทีหลังกดปุ่มบันทึก
                  </span>
                  <span>v2.0 • KTLTC SECURE</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
