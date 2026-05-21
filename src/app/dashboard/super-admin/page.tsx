"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  ShieldCheck,
  RefreshCcw,
  Search,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Terminal,
  ExternalLink,
  UserPlus,
  Settings,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { Calendar } from "antd";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  phone?: string;
  lineId?: string;
  orderIndex?: number;
}

interface Summary {
  totalActions: number;
  approvals: number;
  roleChanges: number;
  updates: number;
}

interface ActivityLog {
  _id: string;
  userName: string;
  action: string;
  details: string;
  link?: string;
  timestamp: string;
  duration: number;
  ip: string;
  module?: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  // Initial loading handled within components
  const [adminProfile, setAdminProfile] = useState<{
    _id: string;
    name: string;
    role?: string;
  } | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  const [roles, setRoles] = useState<string[]>([]);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [autoApproveSignup, setAutoApproveSignup] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchSignupSetting = async () => {
    try {
      const res = await fetch("/api/admin/site-settings");
      if (res.ok) {
        const settings = await res.json();
        const autoApprove = settings.find((s: any) => s.key === "auto_approve_signup");
        setAutoApproveSignup(autoApprove ? autoApprove.value === "true" : false);
      }
    } catch (e) {
      console.error("Failed to fetch signup setting:", e);
    }
  };

  const handleToggleAutoApprove = async (newValue: boolean) => {
    try {
      setIsSavingSettings(true);
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "auto_approve_signup", value: newValue ? "true" : "false" }),
      });
      if (res.ok) {
        setAutoApproveSignup(newValue);
        toast.success(
          newValue
            ? "ตั้งค่าสำเร็จ: ผู้สมัครใหม่สามารถเข้าใช้งานได้ทันที 🔓"
            : "ตั้งค่าสำเร็จ: ผู้สมัครใหม่ต้องรออนุมัติจาก Super Admin 🔒"
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "เกิดข้อผิดพลาดในการบันทึกค่า");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setRoles(data.rolesOrder || Object.keys(data.labels));
        setRoleLabels(data.labels);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleExportLogsCSV = async () => {
    try {
      setIsExportingLogs(true);
      const res = await fetch(`/api/admin/logs?all=true&_t=${Date.now()}`);
      if (!res.ok) throw new Error("Export logs failed");

      const allLogs: ActivityLog[] = await res.json();

      if (!allLogs || allLogs.length === 0) {
        toast.error("ไม่มีข้อมูลกิจกรรมให้ส่งออก");
        return;
      }

      const headers = ["ลำดับ", "วันที่-เวลา", "ผู้ใช้งาน", "กิจกรรม", "รายละเอียด", "IP Address"];
      const rows = allLogs.map((log, index) => [
        index + 1,
        new Date(log.timestamp).toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        }),
        log.userName || "SYSTEM",
        log.action,
        log.details,
        log.ip || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `activity_logs_${new Date().toLocaleDateString("th-TH").replace(/\//g, "-")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`ส่งออกประวัติกิจกรรม ${allLogs.length} รายการเรียบร้อย`);
    } catch (error) {
      console.error("Export Logs Error:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งออกประวัติกิจกรรม");
    } finally {
      setIsExportingLogs(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/admin/users?all=true&search=${searchQuery}&_t=${Date.now()}`);
      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      const allUsers: User[] = data.users || [];

      if (allUsers.length === 0) {
        toast.error("ไม่มีข้อมูลให้ส่งออก");
        return;
      }

      const headers = [
        "ลำดับ",
        "ชื่อ-นามสกุล",
        "ชื่อผู้ใช้",
        "อีเมล",
        "สิทธิ์",
        "สังกัด/แผนก",
        "เบอร์โทรศัพท์",
      ];
      const rows = allUsers.map((user, index) => [
        index + 1,
        user.name,
        user.username,
        user.email,
        user.role,
        user.department || "ไม่มีสังกัด",
        user.phone || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // BOM for Thai characters in Excel
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toLocaleDateString("th-TH").replace(/\//g, "-")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`ส่งออกข้อมูล ${allUsers.length} รายการเรียบร้อย`);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    } finally {
      setIsExporting(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      setIsProfileLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const profile = await res.json();
        setAdminProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error("Profile Error:", error);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchData = async (p = 1, q = searchQuery, cat = selectedCategory) => {
    try {
      if (p === 1) {
        setLoading(true);
        setLoadingPending(true);
      } else {
        setIsFetchingMore(true);
      }

      const [usersRes, pendingRes, summaryRes, logsRes] = await Promise.all([
        fetch(`/api/admin/users?page=${p}&search=${q}&status=active&role=${cat}&_t=${Date.now()}`),
        p === 1 ? fetch(`/api/admin/users?all=true&status=pending&search=${q}&_t=${Date.now()}`) : Promise.resolve(null),
        p === 1 ? fetch("/api/admin/reports/summary?_t=" + Date.now()) : Promise.resolve(null),
        p === 1 ? fetch("/api/admin/logs?_t=" + Date.now()) : Promise.resolve(null),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        const usersArray = data.users || [];

        setUsers((prev) => (p === 1 ? usersArray : [...prev, ...usersArray]));
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
        setPage(p);
        if (data.roleCounts) {
          setRoleCounts(data.roleCounts);
        }
      }

      if (pendingRes && pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingUsers(pendingData.users || []);
      }

      if (summaryRes && summaryRes.ok) setSummary(await summaryRes.json());
      if (logsRes && logsRes.ok) setLogs(await logsRes.json());
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      toast.error("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
      setLoadingPending(false);
      setIsFetchingMore(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchData(1, searchQuery, cat);
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    fetchData(1, val, selectedCategory);
  };

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore) return;
    fetchData(page + 1, searchQuery, selectedCategory);
  };

  useEffect(() => {
    fetchAdminProfile();
    fetchRoles();
    fetchSignupSetting();
    fetchData(1, "", "all");
  }, []);

  const changeDepartment = async (targetId: string, newDept: string, targetName: string) => {
    let currentProfile = adminProfile;
    if (!currentProfile && !isProfileLoading) {
      currentProfile = await fetchAdminProfile();
    }

    if (!currentProfile) {
      return toast.error("ACCESS_DENIED: กรุณาล็อกอินใหม่เพื่อตรวจสอบสิทธิ์");
    }

    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: newDept }),
      });
      if (res.ok) {
        toast.success(`ย้ายสังกัด ${targetName} เรียบร้อย`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "ย้ายสังกัดไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("ย้ายสังกัดไม่สำเร็จ");
    }
  };

  const changeRole = async (targetId: string, newRole: string, targetName: string) => {
    let currentProfile = adminProfile;
    if (!currentProfile && !isProfileLoading) {
      currentProfile = await fetchAdminProfile();
    }

    if (!currentProfile) {
      return toast.error("ACCESS_DENIED: กรุณาล็อกอินใหม่เพื่อตรวจสอบสิทธิ์");
    }

    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`เปลี่ยนสิทธิ์ ${targetName} เรียบร้อย`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "เปลี่ยนสิทธิ์ไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เปลี่ยนสิทธิ์ไม่สำเร็จ");
    }
  };

  const toggleActive = async (targetId: string, currentStatus: boolean, targetName: string) => {
    let currentProfile = adminProfile;
    if (!currentProfile && !isProfileLoading) {
      currentProfile = await fetchAdminProfile();
    }

    if (!currentProfile) {
      return toast.error("ACCESS_DENIED: กรุณาล็อกอินใหม่เพื่อตรวจสอบสิทธิ์");
    }

    try {
      const res = await fetch(`/api/users/${targetId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success(
          !currentStatus
            ? `เปิดใช้งาน ${targetName} เรียบร้อย`
            : `ระงับการใช้งาน ${targetName} เรียบร้อย`,
        );
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "ดำเนินการไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const deleteUser = async (targetId: string, targetName: string) => {
    let currentProfile = adminProfile;
    if (!currentProfile && !isProfileLoading) {
      currentProfile = await fetchAdminProfile();
    }

    if (!currentProfile) {
      return toast.error("ACCESS_DENIED: กรุณาล็อกอินใหม่เพื่อตรวจสอบสิทธิ์");
    }

    if (!confirm(`⚠️ ต้องการลบสมาชิก "${targetName}" ออกจากระบบใช่หรือไม่? ไม่สามารถย้อนกลับได้`))
      return;
    try {
      const res = await fetch(`/api/users/${targetId}/status`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`ลบ "${targetName}" เรียบร้อย`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "ลบสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบสมาชิก");
    }
  };

  const moveOrder = async (id: string, currentOrder: number, direction: "up" | "down") => {
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: newOrder }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนลำดับได้");
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("⚠️ ต้องการล้างประวัติกิจกรรมทั้งหมดใช่หรือไม่?")) return;
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        toast.success("ล้างประวัติเรียบร้อย");
        fetchData();
      }
    } catch (error) {
      toast.error("ไม่สามารถล้างประวัติได้");
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "super_admin":
        return "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold";
      case "director":
      case "deputy_resource":
      case "deputy_strategy":
      case "deputy_academic":
      case "deputy_student_affairs":
        return "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold";
      case "hr":
        return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
      case "admin":
        return "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold";
      case "staff":
        return "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400 font-bold";
      case "teacher":
        return "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold";
      case "janitor":
        return "border-stone-500 bg-stone-500/10 text-stone-700 dark:text-stone-400 font-bold";
      case "student":
        return "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold";
      default:
        return "border-slate-400 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold";
    }
  };

  const getActionStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("REPLY") || act.includes("ANSWER"))
      return "border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold";
    if (act.includes("GUEST"))
      return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold";
    if (act.includes("DELETE") || act.includes("WIPE") || act.includes("SUSPEND"))
      return "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold";
    if (
      act.includes("CREATE") ||
      act.includes("POST") ||
      act.includes("ADD") ||
      act.includes("APPROVE")
    )
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("CHANGE"))
      return "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold";
    if (act.includes("LOGIN") || act.includes("AUTH"))
      return "border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold";
    return "border-slate-500/50 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-2 md:p-4 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Depth */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-10 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl">
                <ShieldCheck className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mb-2">
                  ศูนย์ควบคุม<span className="text-rose-600">จัดการระบบ</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  สิทธิ์ผู้ดูแลระบบสูงสุด (Super Admin)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
                <Link
                    href="/manage-roles"
                    className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-lg text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-widest"
                >
                    <UserPlus size={16} className="text-blue-500" />
                    <span className="hidden sm:inline">จัดการรายบุคคล</span>
                </Link>
                <Link
                    href="/dashboard/permissions"
                    className="flex items-center gap-2 px-6 py-4 bg-rose-600 text-white rounded-3xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 font-bold text-xs uppercase tracking-widest"
                >
                    <Lock size={16} />
                    <span className="hidden sm:inline">Permissions Matrix</span>
                </Link>
                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-3xl transition-all shadow-lg shadow-amber-500/20 font-bold text-xs uppercase tracking-widest"
                >
                    <Settings size={16} />
                    <span>อนุมัติสมาชิก</span>
                </button>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-xl text-slate-600 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
              title="ส่งออก CSV"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin text-blue-500" />
              ) : (
                <FileSpreadsheet size={18} className="text-emerald-500" />
              )}
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
            <button
              onClick={() => fetchData(1, searchQuery)}
              className="p-5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Summary Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "กิจกรรมทั้งหมด",
              val: summary?.totalActions,
              icon: Activity,
              color: "text-blue-600",
              bg: "bg-blue-500/10",
              border: "border-blue-100",
            },
            {
              label: "อนุมัติสิทธิ์แล้ว",
              val: summary?.approvals,
              icon: CheckCircle2,
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
              border: "border-emerald-100",
            },
            {
              label: "การเปลี่ยนสิทธิ์",
              val: summary?.roleChanges,
              icon: Lock,
              color: "text-rose-600",
              bg: "bg-rose-500/10",
              border: "border-rose-100",
            },
            {
              label: "การอัปเดตระบบ",
              val: summary?.updates,
              icon: Database,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              border: "border-amber-100",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl relative overflow-hidden group"
            >
              <div
                className={`absolute top-0 right-0 p-4 ${item.color} opacity-10 group-hover:scale-125 transition-transform duration-500`}
              >
                <item.icon size={60} />
              </div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                {item.label}
              </p>
              {loading ? (
                <div className="h-9 w-20 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
              ) : (
                <h3
                  className={`text-2xl sm:text-3xl lg:text-4xl font-black ${item.color} tracking-tighter tabular-nums`}
                >
                  {item.val || 0}
                </h3>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pending Users Table */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-3xl overflow-hidden">
          <div className="p-5 border-b border-slate-50 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-8 bg-amber-500 rounded-full animate-pulse" />
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  รายชื่อผู้ใช้งานรออนุมัติสิทธิ์ (Pending Approval)
                </h2>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-0.5">
                  ต้องอนุมัติโดย Super Admin เพื่อเข้าใช้งานระบบ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
              <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tabular-nums">
                รออนุมัติ {pendingUsers.length} คน
              </span>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            {loadingPending ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCcw className="w-8 h-8 text-amber-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    กำลังโหลดข้อมูลผู้รออนุมัติ...
                  </span>
                </div>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
                  ไม่มีรายชื่อรออนุมัติสิทธิ์ในขณะนี้
                </h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  นักเรียนนักศึกษาจะได้รับการอนุมัติอัตโนมัติ ส่วนครูและบุคคลภายนอกจะมาแสดงที่นี่เมื่อสมัครเข้ามาใหม่
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-xs uppercase font-bold tracking-widest">
                    <th className="p-4 text-center w-24">ลำดับ</th>
                    <th className="p-4">ข้อมูลผู้สมัคร</th>
                    <th className="p-4 text-center">สิทธิ์ที่ขอ</th>
                    <th className="p-4 text-center">สังกัด / แผนก</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                  <AnimatePresence mode="popLayout">
                    {pendingUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="hover:bg-amber-50/20 dark:hover:bg-amber-500/2 transition-colors group"
                      >
                        <td className="p-4 text-center">
                          <span className="font-black text-slate-800 dark:text-white text-xl italic tabular-nums leading-none">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-base tracking-tight uppercase group-hover:text-amber-600 transition-colors leading-tight">
                              {user.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-amber-600 lowercase italic opacity-60">
                                @{user.username}
                              </span>
                              {user.phone && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  • โทร: {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.role || "user"}
                            onChange={(e) => changeRole(user._id, e.target.value, user.name)}
                            className={`text-xs font-bold border-2 rounded-2xl px-4 py-2.5 outline-none uppercase transition-all focus:ring-4 focus:ring-current/10 ${getRoleStyle(user.role || "user")}`}
                          >
                            {roles.map(roleKey => (
                              <option key={roleKey} value={roleKey}>
                                {roleLabels[roleKey] || roleKey.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.department || "ไม่มีสังกัด"}
                            onChange={(e) => changeDepartment(user._id, e.target.value, user.name)}
                            className="text-xs font-bold border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-2.5 outline-none text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 focus:border-blue-500 transition-all cursor-pointer max-w-[180px]"
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
                              <option value="งานติดตามและประเมินผลการอาชีวศึกษา">งานติดตามและประเมินผลการอาชีวศึกษา</option>
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
                              <option value="ก่อสร้างโยธา">ก่อสร้างโยธา</option>
                            </optgroup>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleActive(user._id, false, user.name)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10"
                              title="อนุมัติสิทธิ์เข้าใช้งาน"
                            >
                              <CheckCircle2 size={14} />
                              <span>อนุมัติ</span>
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/users/edit/${user._id}`)}
                              className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"
                              title="แก้ไขข้อมูลก่อนอนุมัติ"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => deleteUser(user._id, user.name)}
                              className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                              title="ปฏิเสธและลบออกจากระบบ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Users Management Grid */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-rose-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                จัดการรายชื่อผู้ใช้ในระบบ
              </h2>
            </div>

            <div className="flex flex-1 items-center gap-4 w-full justify-center md:justify-end">
              <div className="relative flex-1 max-w-[400px] group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือชื่อผู้ใช้..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-slate-100 dark:bg-zinc-950 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 rounded-2xl focus:outline-none text-slate-800 dark:text-white font-bold text-xs uppercase tracking-widest transition-all"
                />
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 shrink-0">
                <Users size={16} className="text-slate-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tabular-nums">
                  ทั้งหมด {total} คน
                </span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 pt-2 pb-0 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
            >
              <span className="text-sm">👥</span>
              <span>ทั้งหมด</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}>
                {Object.values(roleCounts).reduce((a, b) => a + b, 0)}
              </span>
            </button>
            {roles.map((roleKey) => {
              const isActive = selectedCategory === roleKey;
              const count = roleCounts[roleKey] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleCategoryChange(roleKey)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                    isActive
                      ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                      : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <span>{roleLabels[roleKey] || roleKey}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-xs uppercase font-bold tracking-widest">
                  <th className="p-4 text-center w-24">ลำดับ</th>
                  <th className="p-4">ข้อมูลบุคลากร</th>
                  <th className="p-4 text-center">สิทธิ์การใช้งาน</th>
                  <th className="p-4 text-center">สังกัด / แผนก</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                          กำลังโหลดข้อมูลบุคลากร...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {users
                  .filter((u) => {
                    if (selectedCategory === 'all') return true;
                    return u.role === selectedCategory;
                  })
                  .map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-500/2 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => moveOrder(user._id, user.orderIndex || 0, "up")}
                            className="text-slate-300 dark:text-zinc-700 hover:text-blue-500 transition-colors"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <span className="font-black text-slate-800 dark:text-white text-xl italic tabular-nums leading-none">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => moveOrder(user._id, user.orderIndex || 0, "down")}
                            className="text-slate-300 dark:text-zinc-700 hover:text-rose-500 transition-colors"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </td>

                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white text-base md:text-lg tracking-tight uppercase group-hover:text-blue-600 transition-colors leading-tight">
                                {user.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-600 lowercase italic opacity-60">
                                  @{user.username}
                                </span>
                                {!user.isActive && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest">
                                    รอนุมัติ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.role || "user"}
                            onChange={(e) => changeRole(user._id, e.target.value, user.name)}
                            className={`text-xs font-bold border-2 rounded-2xl px-4 py-2.5 outline-none uppercase transition-all focus:ring-4 focus:ring-current/10 ${getRoleStyle(user.role || "user")}`}
                          >
                            {roles.map(roleKey => (
                                <option key={roleKey} value={roleKey}>
                                    {roleLabels[roleKey] || roleKey.toUpperCase()}
                                </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.department || "ไม่มีสังกัด"}
                            onChange={(e) => changeDepartment(user._id, e.target.value, user.name)}
                            className="text-xs font-bold border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-2.5 outline-none text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 focus:border-blue-500 transition-all cursor-pointer max-w-[180px]"
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
                              <option value="งานติดตามและประเมินผลการอาชีวศึกษา">งานติดตามและประเมินผลการอาชีวศึกษา</option>
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
                              <option value="ก่อสร้างโยธา">ก่อสร้างโยธา</option>
                            </optgroup>
                          </select>
                        </td>
                      <td className="p-4 text-center">
                          <button
                            onClick={() => toggleActive(user._id, user.isActive, user.name)}
                            className={`h-8 w-14 rounded-full transition-all relative p-1 shadow-inner ${user.isActive ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700"}`}
                          >
                            <div className={`h-5 w-5 rounded-full transition-all duration-300 ${user.isActive ? "translate-x-6 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "translate-x-0 bg-slate-400 dark:bg-zinc-500"}`}/>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3  ">
                            <button
                              onClick={() => router.push(`/dashboard/users/edit/${user._id}`)}
                              className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteUser(user._id, user.name)}
                              className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                              title="ลบผู้ใช้ออกจากระบบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <span className="text-slate-400 font-bold italic">ไม่พบข้อมูลที่ค้นหา</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center gap-4 py-8 bg-slate-50/50 dark:bg-zinc-950/30 border-t border-slate-100 dark:border-zinc-800/50 transition-all">
            {hasMore && !loading && (
              <button
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="group flex items-center gap-3 px-12 py-4 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    <span>กำลังโหลดเพิ่ม...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw
                      size={18}
                      className="text-blue-500 group-hover:rotate-180 transition-transform duration-500"
                    />
                    <span>โหลดข้อมูลเพิ่มเติม 20 รายการ</span>
                  </>
                )}
              </button>
            )}

            {!hasMore && !loading && users.length > 0 && (
              <div className="px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <Database size={14} /> รายชื่อทั้งหมดที่แสดง: {users.length} / {total} ราย
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs Console */}
        <div className="bg-zinc-900 rounded-4xl border border-zinc-800 shadow-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Terminal className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  ประวัติกิจกรรมระบบ
                </h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                  รายการบันทึกกิจกรรมล่าสุด
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLogsCSV}
                disabled={isExportingLogs}
                className="px-6 py-3 bg-white/5 hover:bg-emerald-600 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest rounded-2xl border border-white/10 hover:border-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isExportingLogs ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>ส่งออกประวัติ</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="px-6 py-3 bg-white/5 hover:bg-rose-500 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest rounded-2xl border border-white/10 hover:border-rose-500 transition-all"
              >
                ล้างประวัติกิจกรรม
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[700px] overflow-y-auto custom-scrollbar-dark space-y-6">
            {logs.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <Database className="w-12 h-12 text-zinc-800 mx-auto" />
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                  ไม่พบข้อมูลบันทึกกิจกรรม
                </p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex gap-4 group/log"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.5)] ${log.action.includes("DELETE") ? "bg-rose-500 shadow-rose-500/40" : "bg-zinc-700 group-hover/log:bg-blue-500"} transition-colors`}
                    />
                    <div className="flex-1 w-0.5 bg-zinc-800 my-2 group-last/log:hidden" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                      <span className="text-xs font-bold text-zinc-500 tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString("th-TH", {
                          timeZone: "Asia/Bangkok",
                          hour12: false,
                        })}
                      </span>
                      <span className="text-sm font-black text-white uppercase italic tracking-tight">
                        {log.userName || "ระบบส่วนกลาง"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border ${getActionStyle(log.action)}`}
                      >
                        {log.action}
                      </span>
                      {log.module && (
                        <span className="text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                          {log.module}
                        </span>
                      )}
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 group-hover/log:bg-white/5 transition-colors">
                      {log.link ? (
                        <a
                          href={log.link}
                          className="text-zinc-300 hover:text-blue-400 flex items-center justify-between group/link transition-colors"
                        >
                          <span className="text-xs font-bold leading-relaxed">{log.details}</span>
                          <ExternalLink
                            size={14}
                            className="opacity-0 group-link:opacity-100 transition-opacity"
                          />
                        </a>
                      ) : (
                        <p className="text-xs font-bold text-zinc-400 leading-relaxed">
                          {log.details}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
                          {new Date(log.timestamp).toLocaleDateString("th-TH", {
                            timeZone: "Asia/Bangkok",
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                          ไอพี: {log.ip || "ไม่ระบุ"}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer Protocol */}
        <div className="pt-12 pb-8 text-center border-t border-slate-100 dark:border-zinc-900/50">
          <p className="text-xs text-slate-400 dark:text-zinc-700 font-bold uppercase tracking-[0.4em] leading-loose">
            ระบบจัดเก็บข้อมูลสิทธิ์ระดับสูง <br />
            เฉพาะผู้ใช้ที่ได้รับการอนุญาตเท่านั้น • รุ่นพัฒนา v2.0
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
            >
              {/* Decorative background glows */}
              <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-50 dark:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                    นโยบายการอนุมัติสมาชิกใหม่
                  </h2>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    USER REGISTRATION APPROVAL POLICY
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Explanation text */}
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-bold">
                  ระบบได้เปิดใช้งานการควบคุมการสมัครสมาชิกแบบแยกประเภทโดยอัตโนมัติ เพื่อรักษาความปลอดภัยของข้อมูลวิทยาลัยตามรายละเอียดด้านล่าง:
                </p>

                {/* Policy 1: Student (Auto-Approve) */}
                <div
                  className="flex items-start gap-4 p-5 rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-lg shadow-emerald-500/5"
                >
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-black text-slate-800 dark:text-white">
                        กลุ่มนักเรียน นักศึกษา (Student) 🎓
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                        อนุมัติทันที
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      นักเรียน/นักศึกษาที่ลงทะเบียนผ่านพอร์ทัลนักศึกษาจะสามารถเข้าใช้ระบบเพื่อตรวจสอบงาน ดูไฟล์ และปฏิบัติหน้าที่ทวิภาคีได้<strong>ทันทีหลังกรอกข้อมูลสำเร็จ</strong>โดยไม่ต้องรอแอดมินอนุมัติ เพื่อลดความซ้ำซ้อนและอำนวยความสะดวกสูงสุด
                    </p>
                  </div>
                </div>

                {/* Policy 2: Teachers & External Users (Admin Approval) */}
                <div
                  className="flex items-start gap-4 p-5 rounded-3xl border-2 border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10 shadow-lg shadow-rose-500/5"
                >
                  <div className="p-3 rounded-2xl bg-rose-500 text-white">
                    <Lock size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-black text-slate-800 dark:text-white">
                        กลุ่มบุคลากร และ บุคคลภายนอก 🔒
                      </h3>
                      <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                        ต้องอนุมัติโดยแอดมิน
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      สิทธิ์ครู/บุคลากร (Teacher / Staff) และบุคคลทั่วไป (General User) <strong>จะต้องรอการอนุมัติสิทธิ์การเข้าใช้งานจาก Super Admin ด้วยตนเองเท่านั้น</strong> โดยคุณสามารถค้นหาชื่อของพวกเขาในตารางด้านหลัง และกดปุ่มเพื่อเปลี่ยนสถานะเป็นเปิดใช้งาน
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                    สถานะการบังคับใช้: <strong className="text-rose-500">นโยบายความปลอดภัยของระบบเปิดใช้งานอยู่</strong>
                  </span>
                </div>

                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
