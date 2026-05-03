/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiShield,
  FiActivity,
  FiLoader,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import {
  UserOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useRef } from "react";

interface UserFormData {
  name: string;
  email: string;
  role:
    | "super_admin"
    | "admin"
    | "hr"
    | "director"
    | "editor"
    | "user"
    | "staff"
    | "teacher"
    | "janitor";
  department: string;
  position?: string;
  faction?: string;
  description?: string;
  phone: string;
  lineId: string;
  isActive: boolean;
  image?: string; // Added image
  coverImage?: string; // Added coverImage
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "editor",
    department: "ไม่มีสังกัด",
    position: "",
    faction: "",
    description: "",
    phone: "",
    lineId: "",
    isActive: true,
    image: "",
    coverImage: "",
  });

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState(""); // เพิ่ม State สำหรับรหัสผ่านใหม่
  const [showPassword, setShowPassword] = useState(false); // เพิ่ม State สำหรับเปิด/ปิดการมองเห็นรหัสผ่าน
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [adminRes, userRes] = await Promise.all([
          fetch("/api/profile"),
          fetch(`/api/admin/users/${userId}`),
        ]);

        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setAdminProfile(adminData);
        }

        if (userRes.ok) {
          const data = await userRes.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "editor",
            department: data.department || "ไม่มีสังกัด",
            position: data.position || "",
            faction: data.faction || "",
            description: data.description || "",
            phone: data.phone || "",
            lineId: data.lineId || "",
            isActive: data.isActive ?? true,
            image: data.image || "",
            coverImage: data.coverImage || "",
          });
          setUsername(data.username || "ไม่ระบุ");
        } else {
          toast.error("ไม่พบข้อมูลผู้ใช้ในระบบ");
          router.push("/dashboard/super-admin");
        }
      } catch (_error) {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchInitialData();
  }, [userId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return toast.error("กรุณารอข้อมูลระบบสักครู่");

    // ตรวจสอบความยาวรหัสผ่านถ้ามีการกรอก
    if (newPassword && newPassword.length < 6) {
      return toast.error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          username: username.toLowerCase().trim(), // ส่ง Username ที่อาจถูกแก้ไขไปด้วย
          password: newPassword || undefined, // ส่งรหัสผ่านใหม่ไปถ้ามีการกรอก
        }),
      });

      if (res.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
        setTimeout(() => router.push("/dashboard/super-admin"), 1000);
      } else {
        const err = await res.json();
        toast.error(err.error || "บันทึกล้มเหลว");
      }
    } catch (_error) {
      toast.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center max-w-[1600px] mx-auto bg-white">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          กำลังตรวจสอบข้อมูลอัตลักษณ์...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto bg-[#f8fafc] pb-20">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-20 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="font-bold text-slate-800 text-lg">
              แก้ไขข้อมูลผู้ใช้งาน
            </h2>
          </div>
          <Link
            href="/dashboard/super-admin"
            className="text-sm font-semibold text-slate-500 hover:text-rose-500 transition-colors"
          >
            ยกเลิกการแก้ไข
          </Link>
        </div>
      </nav>

      {/* Profile & Cover Header Area */}
      <div className="max-w-[1600px] mx-auto px-2 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/5 border border-white/50 dark:border-zinc-800/50"
        >
          {/* Cover Photo */}
          <div
            className="relative h-48 sm:h-72 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 cursor-pointer group/cover"
            onClick={() => coverInputRef.current?.click()}
          >
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-black/10" />
            )}

            {/* Animated Gradient Mesh Overlay */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/40 via-transparent to-black/40" />

            {/* Change Cover Label */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full flex items-center gap-2 text-white font-bold">
                <PictureOutlined className="text-xl" />
                <span>CHANGE COVER</span>
              </div>
            </div>

            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Profile Photo Area */}
          <div className="px-6 pb-8 sm:px-12 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-10 -mt-16 sm:-mt-24 relative z-10 w-full">
            {/* Avatar Upload */}
            <div
              className="relative group/avatar cursor-pointer "
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-32 w-32 sm:h-48 sm:w-48 rounded-full overflow-hidden border-4 sm:border-[6px] border-white dark:border-zinc-900 shadow-2xl shadow-black/20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-105">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserOutlined className="text-4xl sm:text-6xl text-zinc-300 dark:text-zinc-600" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                  <CameraOutlined className="text-white text-3xl mb-1 sm:mb-2" />
                  <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    Change Photo
                  </span>
                </div>
              </div>

              {/* Camera Badge Overlay */}
              <div className="absolute bottom-1 right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 text-white bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-white dark:border-zinc-900 shadow-blue-900/30 transition-transform group-hover/avatar:scale-110">
                <CameraOutlined className="text-sm sm:text-lg" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* User Title & Badge */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white leading-none tracking-tight pt-2 sm:pt-12">
                {formData.name || "ผู้ใช้งานระบบ"}
              </h2>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                  <SafetyCertificateOutlined /> {formData.role || "Member"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                  <span className="text-blue-500 italic mr-1">@</span>
                  {username}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm ${formData.isActive ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                  />
                  {formData.isActive ? "Active Account" : "Suspended"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1600px] mx-auto px-2 mt-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-8 text-blue-600">
                <FiUser className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  ข้อมูลส่วนบุคคล
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    ชื่อผู้ใช้งาน (ระบบ){" "}
                    <span className="text-blue-600 font-normal italic">
                      * แก้ไขได้เฉพาะ Super Admin
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.replace(/\s/g, ""))
                      }
                      className="w-full bg-blue-50/30 border border-blue-200 rounded-xl p-4 pl-10 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold italic"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    อีเมลติดต่อ
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="0xx-xxx-xxxx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    LINE ID
                  </label>
                  <div className="relative">
                    <FiMessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.lineId}
                      onChange={(e) =>
                        setFormData({ ...formData, lineId: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="ไอดีไลน์"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    ตำแหน่งหลัก{" "}
                    <span className="font-normal text-slate-400">
                      (เช่น หัวหน้าแผนกวิชา, ครู คศ.3)
                    </span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="กรอกตำแหน่ง"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    ฝ่ายงานย่อย{" "}
                    <span className="font-normal text-slate-400">
                      (เช่น งานวิทยบริการฯ)
                    </span>
                  </label>
                  <div className="relative">
                    <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.faction}
                      onChange={(e) =>
                        setFormData({ ...formData, faction: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="กรอกฝ่ายงานย่อย"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    คำอธิบาย / วิทยฐานะ
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="เช่น พนักงานราชการ ครู"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนเปลี่ยนรหัสผ่าน (เพิ่มใหม่) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-2 mb-8 text-amber-500">
                <FiLock className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  ความปลอดภัย (เปลี่ยนรหัสผ่าน)
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    รหัสผ่านใหม่{" "}
                    <span className="text-slate-400 font-normal ml-1">
                      (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
                    </span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 pr-12 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic ml-1">
                  * หากมีการเปลี่ยนรหัสผ่าน
                  ระบบจะทำการเข้ารหัสข้อมูลใหม่เพื่อความปลอดภัยสูงสุด
                </p>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <FiShield className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  ระดับสิทธิ์และการเข้าถึง
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    ระดับผู้ใช้งาน
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="user">พนักงานทั่วไป (User)</option>
                    <option value="editor">บรรณาธิการ (Editor)</option>
                    <option value="hr">ฝ่ายบุคคล (HR)</option>
                    <option value="staff">เจ้าหน้าที่ (Staff)</option>
                    <option value="teacher">ครู (Teacher)</option>
                    <option value="janitor">
                      แม่บ้าน/นักการ (Maid/Janitor)
                    </option>
                    <option value="director">ผู้บริหาร (Director)</option>
                    <option value="deputy_resource">
                      รอง ผอ (บริหารทรัพยากร)
                    </option>
                    <option value="deputy_strategy">รอง ผอ (ยุทธศาสตร์)</option>
                    <option value="deputy_academic">รอง ผอ (วิชาการ)</option>
                    <option value="deputy_student_affairs">
                      รอง ผอ (กิจการนักเรียน)
                    </option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                    <option value="super_admin">
                      ผู้ดูแลระบบสูงสุด (Super Admin)
                    </option>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    สังกัด / แผนก
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="ไม่มีสังกัด">- ไม่มีสังกัด -</option>
                    <option value="ผู้บริหารสถานศึกษา">
                      ผู้บริหารสถานศึกษา
                    </option>

                    <optgroup label="ฝ่ายบริหารทรัพยากร">
                      <option value="งานบริหารงานทั่วไป">
                        งานบริหารงานทั่วไป
                      </option>
                      <option value="งานบริหารและพัฒนาทรัพยากรบุคคล">
                        งานบริหารและพัฒนาทรัพยากรบุคคล
                      </option>
                      <option value="งานการเงิน">งานการเงิน</option>
                      <option value="งานการบัญชี">งานการบัญชี</option>
                      <option value="งานพัสดุ">งานพัสดุ</option>
                      <option value="งานอาคารสถานที่">งานอาคารสถานที่</option>
                      <option value="งานแม่บ้าน/นักการ">
                        งานแม่บ้าน/นักการ
                      </option>
                      <option value="งานทะเบียน">งานทะเบียน</option>
                    </optgroup>

                    <optgroup label="ฝ่ายยุทธศาสตร์และแผนงาน">
                      <option value="งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ">
                        งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ
                      </option>
                      <option value="งานมาตรฐานและการประกันคุณภาพ">
                        งานมาตรฐานและการประกันคุณภาพ
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
                      <option value="งานติดตามและประเมินผล">
                        งานติดตามและประเมินผล
                      </option>
                    </optgroup>

                    <optgroup label="ฝ่ายกิจการนักเรียน นักศึกษา">
                      <option value="งานกิจกรรมนักเรียนนักศึกษา">
                        งานกิจกรรมนักเรียนนักศึกษา
                      </option>
                      <option value="งานครูที่ปรึกษาและการแนะแนว">
                        งานครูที่ปรึกษาและการแนะแนว
                      </option>
                      <option value="งานปกครองและความปลอดภัยนักเรียนนักศึกษา">
                        งานปกครองและความปลอดภัยนักเรียนนักศึกษา
                      </option>
                      <option value="งานสวัสดิการนักเรียนนักศึกษา">
                        งานสวัสดิการนักเรียนนักศึกษา
                      </option>
                      <option value="งานโครงการพิเศษและการบริการ">
                        งานโครงการพิเศษและการบริการ
                      </option>
                    </optgroup>

                    <optgroup label="แผนกวิชา">
                      <option value="สามัญสัมพันธ์">สามัญสัมพันธ์</option>
                      <option value="การบัญชี">การบัญชี</option>
                      <option value="การตลาด">การตลาด</option>
                      <option value="การตลาด/โลจิสติก์">
                        การตลาด/โลจิสติก์
                      </option>
                      <option value="เทคโนโลยีธุรกิจดิจิทัล">
                        เทคโนโลยีธุรกิจดิจิทัล
                      </option>
                      <option value="การโรงแรม">การโรงแรม</option>
                      <option value="เทคนิคพื้นฐาน">เทคนิคพื้นฐาน</option>
                      <option value="ช่างอิเล็กทรอนิกส์">
                        ช่างอิเล็กทรอนิกส์
                      </option>
                      <option value="ช่างยนต์">ช่างยนต์</option>
                      <option value="ยานยนต์ไฟฟ้า">ยานยนต์ไฟฟ้า</option>
                      <option value="ช่างไฟฟ้ากำลัง">ช่างไฟฟ้ากำลัง</option>
                      <option value="ช่างกลโรงงาน">ช่างกลโรงงาน</option>
                      <option value="ช่างเชื่อมโลหะ">ช่างเชื่อมโลหะ</option>
                      <option value="ช่างก่อสร้าง">ช่างก่อสร้าง</option>
                    </optgroup>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiActivity
                      className={
                        formData.isActive ? "text-emerald-500" : "text-rose-500"
                      }
                    />
                    <span className="text-sm font-bold text-slate-600">
                      สถานะบัญชี
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`h-7 w-12 rounded-full transition-all duration-300 relative p-1 ${
                      formData.isActive ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${formData.isActive ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center italic">
                  ID: {userId}
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                  {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
