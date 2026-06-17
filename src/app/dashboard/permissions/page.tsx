"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiLoader,
  FiLock,
  FiLayout,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
  FiLayers,
  FiTrash2,
  FiEdit3,
  FiInfo,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { DEPARTMENT_GROUPS } from "@/constants/departments";

const FEATURE_LABELS: {
  [key: string]: {
    label: string;
    icon: any;
    color: string;
    href?: string;
    isSuperAdminOnly?: boolean;
  };
} = {
  access_dashboard: {
    label: "เข้าสู่ระบบ Dashboard",
    icon: FiLayout,
    color: "text-blue-500",
    href: "/dashboard",
  },
  manage_news: {
    label: "จัดการข่าว / ประชาสัมพันธ์",
    icon: FiFileText,
    color: "text-emerald-500",
    href: "/dashboard/news",
  },
  manage_home: {
    label: "ปรับแต่งหน้าหลัก",
    icon: FiLayout,
    color: "text-blue-400",
    href: "/dashboard/manage-home",
  },
  manage_navbar: {
    label: "จัดการเมนูเว็บไซต์",
    icon: FiLayers,
    color: "text-indigo-400",
    href: "/dashboard/navbar",
  },
  manage_pages: {
    label: "จัดการเนื้อหาหน้าเว็บ",
    icon: FiLayers,
    color: "text-sky-500",
    href: "/dashboard/pages",
  },
  manage_qa: {
    label: "จัดการคำถาม Q&A",
    icon: FiMessageSquare,
    color: "text-rose-500",
    href: "/dashboard/questions",
  },
  manage_system: {
    label: "ระบบจัดการ / สิทธิ์ (SA Only)",
    icon: FiShield,
    color: "text-red-500",
    href: "",
    isSuperAdminOnly: true,
  },
  student_dashboard: {
    label: "เมนู สำหรับนักเรียน นักศึกษา",
    icon: FiUsers,
    color: "text-indigo-500",
    href: "/dashboard",
  },
  manage_flagpole_data: {
    label: "แก้ไขข้อมูลการเข้าแถว",
    icon: FiEdit3,
    color: "text-amber-500",
    href: "/dashboard/flagpole-data-management",
  },
  manage_flagpole_settings: {
    label: "ตั้งค่าเวลาเข้าแถว",
    icon: FiCalendar,
    color: "text-rose-500",
    href: "/dashboard/flagpole-settings",
  },
  access_dve_teacher: { 
    label: "เมนู DVE สำหรับอาจารย์", 
    icon: FiLayout, 
    color: "text-emerald-500", 
    href: "/dashboard/dve",
  },
  access_dve_student: { 
    label: "เมนู DVE สำหรับนักเรียน/นักศึกษา", 
    icon: FiUsers, 
    color: "text-indigo-500", 
    href: "/dashboard/dve/student",
  },
  manage_supervision_requests: {
    label: "อนุมัติผลนิเทศ",
    icon: FiCheckCircle,
    color: "text-teal-600",
    href: "/dashboard/supervision/requests",
  },
  access_teacher_verification: {
    label: "ตรวจสอบครูผู้สอน (ผู้บริหาร)",
    icon: FiCheckCircle,
    color: "text-amber-500",
    href: "/teacher-verification",
  },
  access_teacher_dashboard: {
    label: "ติดตามงานครู (ผู้บริหาร)",
    icon: FiLayout,
    color: "text-blue-500",
    href: "/teacher-dashboard",
  },
  access_lesson_plans: {
    label: "จัดการแผนการสอน",
    icon: FiFileText,
    color: "text-emerald-500",
    href: "/dashboard/director/lesson-plans",
  },
  access_dpa_evaluation: {
    label: "แฟ้มพัฒนางาน / DPA",
    icon: FiCheckCircle,
    color: "text-rose-500",
    href: "/dashboard/director/dpa-evaluation",
  },
  access_plc: {
    label: "ชุมชนการเรียนรู้ (PLC)",
    icon: FiUsers,
    color: "text-indigo-500",
    href: "/dashboard/director/plc",
  },
  access_student_care: {
    label: "ระบบดูแลช่วยเหลือนักเรียน",
    icon: FiShield,
    color: "text-teal-500",
    href: "/dashboard/director/student-care",
  },
};

const ADVANCED_FEATURE_LABELS: {
  [key: string]: { label: string; icon: any; color: string; href?: string };
} = {
  manage_attendance_dashboard: {
    label: "ภาพรวมลงเวลา",
    icon: FiLayout,
    color: "text-blue-600",
    href: "/dashboard/attendance",
  },
  manage_attendance_report: {
    label: "รายงานการเข้างาน",
    icon: FiFileText,
    color: "text-indigo-600",
    href: "/dashboard/attendance/reports",
  },
  manage_attendance_work_reports: {
    label: "รายงานปฏิบัติงาน",
    icon: FiMessageSquare,
    color: "text-emerald-600",
    href: "/dashboard/attendance/work-reports",
  },
  manage_attendance_leave_approvals: {
    label: "จัดการอนุมัติใบลา",
    icon: FiCheckCircle,
    color: "text-rose-600",
    href: "/dashboard/attendance/leave-approvals",
  },
  manage_attendance_settings: {
    label: "ตั้งค่าเวลาเข้างาน",
    icon: FiCalendar,
    color: "text-amber-600",
    href: "/dashboard/attendance/settings",
  },
  manage_attendance: {
    label: "รายงานปฏิบัติงาน (WFH)",
    icon: FiCalendar,
    color: "text-amber-500",
    href: "/dashboard/attendance",
  },
  manage_roles_advanced: {
    label: "จัดการสิทธิ์บุคลากร",
    icon: FiUsers,
    color: "text-sky-600",
    href: "/manage-roles",
  },
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any>(null);
  const [departmentPermissions, setDepartmentPermissions] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"roles" | "departments">("roles");
  const [roleLabels, setRoleLabels] = useState<any>({});
  const [rolesOrder, setRolesOrder] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // For Adding Custom Menu
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenu, setNewMenu] = useState({ title: "", href: "", workspace: "staff", displayIn: "both" });
  const [isAddingMenu, setIsAddingMenu] = useState(false);

  // For Editing/Deleting Custom Menu
  const [customMenusList, setCustomMenusList] = useState<any[]>([]);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [editMenu, setEditMenu] = useState({ id: "", title: "", href: "", workspace: "staff", displayIn: "both" });
  const [isEditingMenu, setIsEditingMenu] = useState(false);

  // For Adding Role
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleID, setNewRoleID] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // For Editing Role
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(""); // The original ID
  const [editRoleID, setEditRoleID] = useState(""); // The potentially new ID
  const [editRoleLabel, setEditRoleLabel] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions);
        setRoleLabels(data.labels);
        setRolesOrder(data.rolesOrder || Object.keys(data.permissions));
        
        // Ensure custom features get mapped with a generic icon since we can't easily eval string to React component dynamically without a map
        const parsedCustomFeatures: any = {};
        if (data.customFeatureLabels) {
          Object.keys(data.customFeatureLabels).forEach(key => {
            parsedCustomFeatures[key] = {
              ...data.customFeatureLabels[key],
              icon: FiLayout, // generic fallback
            };
          });
        }
        setCustomFeatures(parsedCustomFeatures);
        if (data.departmentPermissions) {
          setDepartmentPermissions(data.departmentPermissions);
        }
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลสิทธิ์ได้");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/admin/menus");
      if (res.ok) {
        const data = await res.json();
        setCustomMenusList(data.menus || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchMenus();
  }, []);

  const handleToggle = async (role: string, feature: string) => {
    if (role === "super_admin") return;

    // คำนวณค่า Permissions ใหม่
    const updatedRolePermissions = {
      ...permissions[role],
      [feature]: !permissions[role][feature],
    };

    // 1. อัปเดต UI ทันที (Optimistic Update)
    setPermissions((prev: any) => ({
      ...prev,
      [role]: updatedRolePermissions,
    }));

    // 2. บันทึกลงฐานข้อมูลทันที
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              role,
              permissions: updatedRolePermissions,
              label: roleLabels[role],
            },
          ],
        }),
      });

      if (res.ok) {
        toast.success(`อัปเดตสิทธิ์ ${roleLabels[role] || role} สำเร็จ`, {
          duration: 1500,
          icon: "✅",
        });
      } else {
        toast.error("ไม่สามารถบันทึกข้อมูลได้");
        // ถ้าบันทึกพลาด ให้ดึงข้อมูลใหม่เพื่อคืนค่าเดิม
        fetchPermissions();
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      fetchPermissions();
    }
  };

  const handleToggleDepartment = (department: string, feature: string) => {
    const updatedDeptPermissions = {
      ...(departmentPermissions[department] || {}),
      [feature]: !(departmentPermissions[department]?.[feature] || false),
    };

    setDepartmentPermissions((prev: any) => ({
      ...prev,
      [department]: updatedDeptPermissions,
    }));
    
    // Auto save (similar to handleToggle)
    fetch("/api/admin/permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deptUpdates: [
          {
            department,
            permissions: updatedDeptPermissions,
          },
        ],
      }),
    }).then(res => {
      if (res.ok) toast.success(`อัปเดตสิทธิ์ ${department} สำเร็จ`, { duration: 1500, icon: "✅" });
      else fetchPermissions();
    }).catch(() => fetchPermissions());
  };

  const handleSaveAll = async () => {
    if (!permissions) return;
    try {
      setSavingRole("all");
      const updates = Object.keys(permissions)
        .filter((role) => role !== "super_admin")
        .map((role) => ({
          role,
          permissions: permissions[role],
          label: roleLabels[role],
        }));

      const deptUpdates = Object.keys(departmentPermissions).map((dept) => ({
        department: dept,
        permissions: departmentPermissions[dept],
      }));

      console.log("💾 [Frontend] Saving all permissions:", { updates, deptUpdates });

      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, deptUpdates }),
      });

      if (res.ok) {
        toast.success("บันทึกการตั้งค่าทั้งหมดเรียบร้อยแล้ว");
      } else {
        const err = await res.json();
        toast.error(err.error || "บันทึกล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSavingRole(null);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleID || !newRoleLabel) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsAdding(true);
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRoleID, label: newRoleLabel }),
      });

      if (res.ok) {
        toast.success("เพิ่มบทบาทใหม่เรียบร้อยแล้ว");
        setShowAddModal(false);
        setNewRoleID("");
        setNewRoleLabel("");
        fetchPermissions();
      } else {
        const err = await res.json();
        toast.error(err.error || "ไม่สามารถเพิ่มบทบาทได้");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (role: string) => {
    setEditingRole(role);
    setEditRoleID(role);
    setEditRoleLabel(roleLabels[role] || "");
    setShowEditModal(true);
  };

  const handleEditRole = async () => {
    if (!editRoleID || !editRoleLabel) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsEditing(true);
      const payload = {
        oldRole: editingRole,
        newRole: editRoleID,
        label: editRoleLabel,
      };

      console.log("✏️ [Frontend] Sending PATCH request:", payload);

      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res
        .json()
        .catch(() => ({ error: "ไม่สามารถอ่านข้อมูลตอบกลับจาก Server ได้" }));
      console.log("📥 [Frontend] API Response:", { status: res.status, data });

      if (res.ok) {
        toast.success("แก้ไขข้อมูลบทบาทเรียบร้อยแล้ว");
        setShowEditModal(false);
        fetchPermissions();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
      }
    } catch (error: any) {
      console.error("🔥 [Frontend] handleEditRole Error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteRole = async (role: string) => {
    if (!window.confirm(`ยืนยันการลบบทบาท "${roleLabels[role] || role}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/permissions?role=${role}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ลบบทบาทเรียบร้อยแล้ว");
        fetchPermissions();
      } else {
        const err = await res.json();
        toast.error(err.error || "ไม่สามารถลบได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const isSystemRole = (role: string) => {
    return ["super_admin", "admin"].includes(role);
  };

  if (loading || !permissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          กำลังดึงข้อมูลสิทธิ์การเข้าถึง...
        </p>
      </div>
    );
  }

  const handleAddMenu = async () => {
    if (!newMenu.title || !newMenu.href || !newMenu.workspace) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      setIsAddingMenu(true);
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMenu),
      });
      if (res.ok) {
        toast.success("เพิ่มเมนูใหม่สำเร็จ");
        setShowAddMenuModal(false);
        setNewMenu({ title: "", href: "", workspace: "staff" });
        fetchPermissions(); // Reload matrix
      } else {
        toast.error("ไม่สามารถเพิ่มเมนูได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsAddingMenu(false);
    }
  };

  const handleEditMenuSubmit = async () => {
    if (!editMenu.title || !editMenu.href || !editMenu.workspace) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      setIsEditingMenu(true);
      const res = await fetch("/api/admin/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMenu),
      });
      if (res.ok) {
        toast.success("แก้ไขเมนูสำเร็จ");
        setShowEditMenuModal(false);
        fetchPermissions();
        fetchMenus();
      } else {
        toast.error("ไม่สามารถแก้ไขเมนูได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsEditingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string, title: string) => {
    if (!window.confirm(`ยืนยันการลบเมนู "${title}" ใช่หรือไม่? (สิทธิ์ที่เกี่ยวข้องจะถูกลบไปด้วย)`)) return;
    try {
      const res = await fetch(`/api/admin/menus?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ลบเมนูสำเร็จ");
        fetchPermissions();
        fetchMenus();
      } else {
        toast.error("ไม่สามารถลบเมนูได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const rolesCustomFeatures = Object.keys(customFeatures).reduce((acc: any, key) => {
    if (customFeatures[key].displayIn === "roles" || customFeatures[key].displayIn === "both" || !customFeatures[key].displayIn) {
      acc[key] = customFeatures[key];
    }
    return acc;
  }, {});

  const deptCustomFeatures = Object.keys(customFeatures).reduce((acc: any, key) => {
    if (customFeatures[key].displayIn === "departments" || customFeatures[key].displayIn === "both") {
      acc[key] = customFeatures[key];
    }
    return acc;
  }, {});

  const MERGED_FEATURE_LABELS = { ...FEATURE_LABELS, ...rolesCustomFeatures };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[140px] dark:bg-blue-600/10 animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-600/10 blur-[140px] dark:bg-indigo-600/10 animate-pulse delay-700" />
      </div>

      <div className="max-w-[1600px] mx-auto p-6 md:p-12 relative z-10">
        <Toaster position="top-right" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-600/20 shadow-lg shadow-blue-500/10">
                <FiShield size={24} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Security Module
                </span>
              </div>
            </motion.div>
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none flex flex-wrap items-center gap-x-4">
                <span className="uppercase italic">Role</span>
                <span className="text-blue-600 uppercase">Permissions</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm sm:text-lg mt-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600/20 rounded-full" />
                กำหนดสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ แยกตามระดับผู้ใช้งาน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3 mr-4">
              <Link
                href="/dashboard/super-admin"
                className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-rose-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-95"
              >
                <FiLayout size={16} />
                <span>Super Admin</span>
              </Link>
              <Link
                href="/manage-roles"
                className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-95"
              >
                <FiUsers size={16} />
                <span>จัดการรายบุคคล</span>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowAddMenuModal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
              >
                <FiLayout size={16} />
                <span>เพิ่มเมนูใหม่</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                <FiUsers size={16} />
                <span>เพิ่มบทบาทใหม่</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8 mt-12">
          <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === "roles" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              สิทธิ์ตามบทบาท (Roles)
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === "departments" ? "bg-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              สิทธิ์ตามแผนก (Departments)
            </button>
          </div>
          
          {activeTab === "departments" && (
            <div className="xl:col-span-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-xl">
                  <FiLayers size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                    Department Permissions Matrix
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    จัดการสิทธิ์การเข้าใช้งานของแต่ละแผนก/งาน
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-auto max-h-[70vh]">
                  <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50/95 dark:bg-zinc-800/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest min-w-[220px] sticky top-0 left-0 z-50 bg-slate-50 dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-800">
                          แผนก / งาน (Department)
                        </th>

                        {/* Custom Features */}
                        {Object.keys(deptCustomFeatures).map((key) => (
                          <th
                            key={key}
                            className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center min-w-[110px] sticky top-0 z-40 bg-slate-50/95 dark:bg-zinc-800/95 border-b border-zinc-200 dark:border-zinc-800"
                          >
                            <div className="flex flex-col items-center gap-2 group">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 transition-transform group-hover:scale-110 text-amber-500">
                                <FiLayout size={14} />
                              </div>
                              <span className="truncate w-full block px-2" title={customFeatures[key].label}>
                                {customFeatures[key].label}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                      {DEPARTMENT_GROUPS.flatMap(group => group.options).map((dept) => (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={dept.value}
                          className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="p-4 sticky left-0 z-30 bg-white dark:bg-zinc-900 group-hover:bg-slate-50 dark:group-hover:bg-zinc-800 border-r border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3">
                              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                {dept.label}
                              </div>
                            </div>
                          </td>


                          
                          {Object.keys(deptCustomFeatures).map((feature) => (
                            <td
                              key={feature}
                              className="p-2 text-center border-b border-zinc-50 dark:border-zinc-800/50"
                            >
                              <button
                                onClick={() => handleToggleDepartment(dept.value, feature)}
                                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  departmentPermissions[dept.value]?.[feature]
                                    ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 hover:border-amber-300"
                                }`}
                              >
                                {departmentPermissions[dept.value]?.[feature] ? (
                                  <FiCheckCircle size={20} />
                                ) : (
                                  <FiXCircle size={20} />
                                )}
                              </button>
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={activeTab === "roles" ? "block space-y-20" : "hidden"}>
          {/* --- Section 1: Permissions Matrix --- */}
          <div className="xl:col-span-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
                <FiShield size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                  Permissions Matrix
                </h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  จัดการสิทธิ์การเข้าใช้งานของทุกบทบาท
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50/95 dark:bg-zinc-800/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest min-w-[220px] sticky top-0 left-0 z-50 bg-slate-50 dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-800">
                        บทบาท / Role Name
                      </th>
                      {Object.keys(MERGED_FEATURE_LABELS).map((key) => (
                        <th
                          key={key}
                          className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center min-w-[110px] sticky top-0 z-40 bg-slate-50/95 dark:bg-zinc-800/95 border-b border-zinc-200 dark:border-zinc-800"
                        >
                          <Link
                            href={MERGED_FEATURE_LABELS[key].href || "#"}
                            className="flex flex-col items-center gap-2 group/header cursor-pointer"
                          >
                            <div
                              className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-transform group-hover/header:scale-110 ${MERGED_FEATURE_LABELS[key].color}`}
                            >
                              {(() => {
                                const Icon = MERGED_FEATURE_LABELS[key].icon;
                                return <Icon size={18} />;
                              })()}
                            </div>
                            <span className="max-w-[100px] text-center leading-tight group-hover/header:text-blue-600 transition-colors">
                              {MERGED_FEATURE_LABELS[key].label}
                            </span>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {rolesOrder.map((role) => (
                      <motion.tr
                        key={role}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${role === "super_admin" ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                      >
                        <td className="p-6 sticky left-0 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-1.5 h-10 rounded-full ${role === "super_admin" ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : isSystemRole(role) ? "bg-indigo-400" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]"}`}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                  {role}
                                </span>
                                {role === "super_admin" && (
                                  <FiLock size={10} className="text-blue-600" />
                                )}
                              </div>
                              <span
                                className={`font-black text-sm tracking-tight leading-none ${role === "super_admin" ? "text-blue-600 uppercase" : "text-zinc-950 dark:text-white"}`}
                              >
                                {roleLabels[role] || role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {Object.keys(MERGED_FEATURE_LABELS).map((feature) => (
                          <td
                            key={feature}
                            className="p-2 text-center border-b border-zinc-50 dark:border-zinc-800/50"
                          >
                            {role === "super_admin" ? (
                              <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 border border-blue-200 dark:border-blue-800/50">
                                  <FiCheckCircle size={20} strokeWidth={3} />
                                </div>
                              </div>
                            ) : (
                              <button
                                disabled={MERGED_FEATURE_LABELS[feature].isSuperAdminOnly}
                                onClick={() =>
                                  !MERGED_FEATURE_LABELS[feature].isSuperAdminOnly &&
                                  handleToggle(role, feature)
                                }
                                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  MERGED_FEATURE_LABELS[feature].isSuperAdminOnly
                                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                                    : permissions[role][feature]
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 hover:border-emerald-300"
                                }`}
                              >
                                {permissions[role][feature] &&
                                !MERGED_FEATURE_LABELS[feature].isSuperAdminOnly ? (
                                  <FiCheckCircle size={20} />
                                ) : (
                                  <FiXCircle size={20} />
                                )}
                              </button>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Section 1.5: Advanced Permissions Matrix --- */}
          <div className="xl:col-span-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                <FiCalendar size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                  Advanced Attendance & Roles
                </h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  จัดการสิทธิ์รายหน้าของระบบลงเวลาและบทบาท
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50/95 dark:bg-zinc-800/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest min-w-[220px] sticky top-0 left-0 z-50 bg-slate-50 dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-800">
                        บทบาท / Role Name
                      </th>
                      {Object.keys(ADVANCED_FEATURE_LABELS).map((key) => (
                        <th
                          key={key}
                          className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center min-w-[110px] sticky top-0 z-40 bg-slate-50/95 dark:bg-zinc-800/95 border-b border-zinc-200 dark:border-zinc-800"
                        >
                          <Link
                            href={ADVANCED_FEATURE_LABELS[key].href || "#"}
                            className="flex flex-col items-center gap-2 group/header cursor-pointer"
                          >
                            <div
                              className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-transform group-hover/header:scale-110 ${ADVANCED_FEATURE_LABELS[key].color}`}
                            >
                              {(() => {
                                const Icon = ADVANCED_FEATURE_LABELS[key].icon;
                                return <Icon size={18} />;
                              })()}
                            </div>
                            <span className="max-w-[100px] text-center leading-tight group-hover/header:text-blue-600 transition-colors">
                              {ADVANCED_FEATURE_LABELS[key].label}
                            </span>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {rolesOrder.map((role) => (
                      <motion.tr
                        key={role}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${role === "super_admin" ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                      >
                        <td className="p-6 sticky left-0 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-1.5 h-10 rounded-full ${role === "super_admin" ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : isSystemRole(role) ? "bg-indigo-400" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]"}`}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                  {role}
                                </span>
                              </div>
                              <span
                                className={`font-black text-sm tracking-tight leading-none ${role === "super_admin" ? "text-blue-600 uppercase" : "text-zinc-950 dark:text-white"}`}
                              >
                                {roleLabels[role] || role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {Object.keys(ADVANCED_FEATURE_LABELS).map((feature) => (
                          <td
                            key={feature}
                            className="p-2 text-center border-b border-zinc-50 dark:border-zinc-800/50"
                          >
                            {role === "super_admin" ? (
                              <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 border border-blue-200 dark:border-blue-800/50">
                                  <FiCheckCircle size={20} strokeWidth={3} />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggle(role, feature)}
                                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  permissions[role] && permissions[role][feature]
                                    ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 hover:border-blue-300"
                                }`}
                              >
                                {permissions[role] && permissions[role][feature] ? (
                                  <FiCheckCircle size={20} />
                                ) : (
                                  <FiXCircle size={20} />
                                )}
                              </button>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Section 2: Custom Role Manager --- */}
          <div className="xl:col-span-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <FiUsers size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                    Role Settings
                  </h2>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    ตั้งค่าชื่อและรหัสบทบาททั้งหมดในระบบ
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden max-w-4xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        Role ID
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        Display Name (Thai)
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {rolesOrder.map((role) => (
                      <motion.tr
                        key={role}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors ${role === "super_admin" ? "bg-blue-50/20 dark:bg-blue-900/5" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold uppercase tracking-tight text-xs px-3 py-1 rounded-lg ${
                                role === "super_admin"
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              {role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-black ${role === "super_admin" ? "text-blue-600" : "text-zinc-900 dark:text-white"}`}
                            >
                              {roleLabels[role] || "-"}
                            </span>
                            {isSystemRole(role) && (
                              <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest border border-blue-500/20 px-1.5 rounded-md">
                                System
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {isSystemRole(role) ? (
                              <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                <FiLock size={14} />
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEditModal(role)}
                                  className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                  <FiEdit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role)}
                                  className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Section 3: Custom Menus Manager --- */}
          <div className="xl:col-span-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <FiLayout size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                    Custom Menus
                  </h2>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    จัดการเมนูที่กำหนดเองในระบบ
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden max-w-4xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        ชื่อเมนู (Title)
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        URL (href)
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {customMenusList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                          ยังไม่มีเมนูแบบกำหนดเอง
                        </td>
                      </tr>
                    ) : (
                      customMenusList.map((menu) => (
                        <tr key={menu._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white text-sm">
                            {menu.title}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-sm">
                            {menu.href}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-sm capitalize">
                            {menu.workspace}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditMenu({ id: menu._id, title: menu.title, href: menu.href, workspace: menu.workspace, displayIn: menu.displayIn || "both" });
                                  setShowEditMenuModal(true);
                                }}
                                className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                              >
                                <FiEdit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteMenu(menu._id, menu.title)}
                                className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-blue-600 rounded-[3.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-6 italic leading-none">
              Dynamic_Permission_System
            </h2>
            <p className="text-blue-100 font-medium text-lg leading-relaxed mb-8">
              สิทธิ์ที่กำหนดในหน้านี้จะมีผลทันทีต่อการแสดงผลเมนู Navbar และการเข้าถึง API ในอนาคต
              กรุณาตรวจสอบให้แน่ใจก่อนทำการบันทึกข้อมูลเนื่องจากจะมีผลต่อความปลอดภัยของข้อมูลหลักของวิทยาลัย
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 -mr-20 -mb-20">
            <FiShield size={450} />
          </div>
        </div>
      </div>

      {/* --- Add Role Modal --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border-2 border-zinc-100 dark:border-zinc-800 max-w-xl w-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/40">
                  <FiUsers size={28} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                    Add New Role
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    เพิ่มบทบาทการเข้าถึงระบบ
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 block">
                    Role ID (English Only)
                  </label>
                  <input
                    type="text"
                    value={newRoleID}
                    onChange={(e) => setNewRoleID(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 transition-all"
                    placeholder="เช่น teacher_admin"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 block">
                    Role Name (Thai)
                  </label>
                  <input
                    type="text"
                    value={newRoleLabel}
                    onChange={(e) => setNewRoleLabel(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 transition-all"
                    placeholder="เช่น หัวหน้างานหลักสูตร"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-5 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-widest"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAddRole}
                    disabled={isAdding}
                    className="flex-2 py-5 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/40"
                  >
                    {isAdding ? "กำลังสร้าง..." : "สร้างบทบาทใหม่"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Edit Role Modal --- */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border-2 border-blue-100 dark:border-zinc-800 max-w-xl w-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                  <FiEdit3 size={28} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                    Edit Role
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    แก้ไขข้อมูลบทบาท
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 block">
                    Role ID (English)
                  </label>
                  <input
                    type="text"
                    value={editRoleID}
                    onChange={(e) =>
                      setEditRoleID(e.target.value.toLowerCase().replace(/\s/g, "_"))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 transition-all"
                    placeholder="เช่น teacher_admin"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 block">
                    Role Name (Thai)
                  </label>
                  <input
                    type="text"
                    value={editRoleLabel}
                    onChange={(e) => setEditRoleLabel(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 transition-all"
                    placeholder="เช่น หัวหน้างานหลักสูตร"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-5 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-widest"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleEditRole}
                    disabled={isEditing}
                    className="flex-2 py-5 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30"
                  >
                    {isEditing ? "กำลังบันทึก..." : "ยืนยันการแก้ไข"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Add Custom Menu Modal --- */}
      <AnimatePresence>
        {showAddMenuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMenuModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 overflow-hidden"
            >
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                เพิ่มเมนูแบบกำหนดเอง
              </h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                ระบบจะสร้างสิทธิ์เข้าถึงเมนูนี้ในตารางโดยอัตโนมัติ
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    ชื่อเมนู
                  </label>
                  <input
                    type="text"
                    value={newMenu.title}
                    onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                    placeholder="เช่น: เมนูพิเศษ, ระบบจัดการหลังบ้าน"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    URL ของหน้าเว็บ
                  </label>
                  <input
                    type="text"
                    value={newMenu.href}
                    onChange={(e) => setNewMenu({ ...newMenu, href: e.target.value })}
                    placeholder="เช่น: /dashboard/my-page"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    แสดงในหมวดหมู่ หน้า /dashbord
                  </label>
                  <select
                    value={newMenu.workspace}
                    onChange={(e) => setNewMenu({ ...newMenu, workspace: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  >
                    <option value="student">นักเรียน นักศึกษา</option>
                    <option value="teacher">ครูผู้สอน</option>
                    <option value="staff">บุคลากร / HR</option>
                    <option value="executive">ผู้บริหาร</option>
                    <option value="superadmin">ผู้ดูแลระบบสูงสุด</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    แสดงคอลัมน์ในตาราง
                  </label>
                  <select
                    value={newMenu.displayIn}
                    onChange={(e) => setNewMenu({ ...newMenu, displayIn: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  >
                    <option value="both">แสดงทั้งสองตาราง</option>
                    <option value="roles">เฉพาะตาราง "สิทธิ์ตามบทบาท"</option>
                    <option value="departments">เฉพาะตาราง "สิทธิ์ตามแผนก"</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setShowAddMenuModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAddMenu}
                    disabled={isAddingMenu}
                    className="flex-2 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isAddingMenu ? <FiLoader className="animate-spin" /> : "บันทึกข้อมูล"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Edit Custom Menu Modal --- */}
      <AnimatePresence>
        {showEditMenuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditMenuModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 overflow-hidden"
            >
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                แก้ไขเมนู
              </h3>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    ชื่อเมนู
                  </label>
                  <input
                    type="text"
                    value={editMenu.title}
                    onChange={(e) => setEditMenu({ ...editMenu, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    URL ของหน้าเว็บ
                  </label>
                  <input
                    type="text"
                    value={editMenu.href}
                    onChange={(e) => setEditMenu({ ...editMenu, href: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    แสดงในหมวดหมู่ หน้า /dashbord
                  </label>
                  <select
                    value={editMenu.workspace}
                    onChange={(e) => setEditMenu({ ...editMenu, workspace: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  >
                    <option value="student">นักเรียน นักศึกษา</option>
                    <option value="teacher">ครูผู้สอน</option>
                    <option value="staff">บุคลากร / HR</option>
                    <option value="executive">ผู้บริหาร</option>
                    <option value="superadmin">ผู้ดูแลระบบสูงสุด</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    แสดงคอลัมน์ในตาราง
                  </label>
                  <select
                    value={editMenu.displayIn}
                    onChange={(e) => setEditMenu({ ...editMenu, displayIn: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  >
                    <option value="both">แสดงทั้งสองตาราง</option>
                    <option value="roles">เฉพาะตาราง "สิทธิ์ตามบทบาท"</option>
                    <option value="departments">เฉพาะตาราง "สิทธิ์ตามแผนก"</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setShowEditMenuModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleEditMenuSubmit}
                    disabled={isEditingMenu}
                    className="flex-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isEditingMenu ? <FiLoader className="animate-spin" /> : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
