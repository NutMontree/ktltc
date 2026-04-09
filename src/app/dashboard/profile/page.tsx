"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FullPageLoader from "@/components/FullPageLoader";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  LockOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  SaveOutlined,
  PictureOutlined,
} from "@ant-design/icons";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    lineId: "",
    role: "",
    department: "",
    program: "", // Added program
    image: "",
    coverImage: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            lineId: data.lineId || "",
            role: data.role || "",
            department: data.department || "ไม่มีสังกัด",
            program: data.program || "", // Added program
            image: data.image || "",
            coverImage: data.coverImage || "",
            password: "",
            confirmPassword: "",
          });
          if (data.image) setPreviewImage(data.image);
          if (data.coverImage) setPreviewCover(data.coverImage);
        }
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("❌ รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: previewImage,
          coverImage: previewCover,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        router.refresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("❌ เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("❌ เชื่อมต่อ Server ไม่ได้");
    } finally {
      setSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return <FullPageLoader message="กำลังรวบรวมข้อมูลผู้ใช้งาน..." />;
  }

  return (
    <div className="px-2 pt-1 max-w-[1600px] mx-auto overflow-x-hidden relative">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-600/10 transition-colors duration-1000" />
        <div className="absolute top-1/2 right-0 sm:right-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[120px] dark:bg-purple-600/10 transition-colors duration-1000" />
      </div>

      <motion.div
        className="relative z-10 max-w-[1600px] mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* --- Header & Cover Photo --- */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-[2.5rem] shadow-2xl shadow-blue-900/5 dark:shadow-none bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/50 dark:border-zinc-800/50 mb-10 overflow-hidden group"
        >
          {/* Cover Banner */}
          <div
            className="relative h-40 sm:h-72 w-full overflow-hidden bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 cursor-pointer group/cover"
            onClick={() => coverInputRef.current?.click()}
          >
            {previewCover ? (
              <img
                src={previewCover}
                alt="Cover"
                className="h-full w-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-black/10" />
            )}

            {/* Animated Gradient Mesh Overlay */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/40 via-transparent to-black/40" />

            {/* Change Cover Label */}
            <div className="absolute inset-0  bg-black/20 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full flex items-center gap-2 text-white font-bold">
                <PictureOutlined className="text-xl" />
                <span>CHANGE COVER</span>
              </div>
            </div>

            {/* <div className="absolute top-6 left-8 pointer-events-none">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                Profile Setting
              </h1>
              <p className="text-blue-100 mt-1 font-medium italic opacity-90 drop-shadow-md">
                อัปเดตข้อมูล และสถานะของคุณให้เป็นปัจจุบัน
              </p>
            </div> */}

            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Avatar & Role Floating Area */}
          <div className="px-6 pb-8 sm:px-12 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-10 -mt-16 sm:-mt-24 relative z-10 w-full">
            {/* Avatar Upload */}
            <div
              className="relative group/avatar cursor-pointer "
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-32 w-32 sm:h-48 sm:w-48 rounded-full overflow-hidden border-4 sm:border-[6px] border-white dark:border-zinc-900 shadow-2xl shadow-black/20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-105">
                {previewImage ? (
                  <img
                    src={previewImage}
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
                {formData.username ||
                  (loading ? "กำลังโหลด..." : "ไม่มีชื่อผู้ใช้งาน")}
              </h2>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                  <SafetyCertificateOutlined />{" "}
                  {formData.role === "super_admin"
                    ? "Super Admin (ผู้ดูแลระบบสูงสุด)"
                    : formData.role === "admin"
                      ? "Admin (ผู้ดูแลระบบ)"
                      : formData.role === "hr"
                        ? "ฝ่ายบริหารงานบุคคล (HR)"
                        : formData.role === "director"
                          ? "ผู้อำนวยการ (Director)"
                          : formData.role === "deputy_resource"
                            ? "รองผู้อำนวยการ ฝ่ายบริหารทรัพยากร"
                            : formData.role === "deputy_strategy"
                              ? "รองผู้อำนวยการ ฝ่ายแผนงานและความร่วมมือ"
                              : formData.role === "deputy_academic"
                                ? "รองผู้อำนวยการ ฝ่ายวิชาการ"
                                : formData.role === "deputy_student_affairs"
                                  ? "รองผู้อำนวยการ ฝ่ายกิจการนักเรียน"
                                  : formData.role === "teacher"
                                    ? "คณะครู (Teacher)"
                                    : formData.role === "staff"
                                      ? "เจ้าหน้าที่ (Staff)"
                                      : formData.role === "janitor"
                                        ? "แม่บ้าน/นักการ (Maid/Janitor)"
                                        : formData.role === "editor"
                                          ? "Editor (ผู้ดูแลเนื้อหา)"
                                          : formData.role || "สมาชิกทั่วไป"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Active Member
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10 pb-20">
          {/* --- Personal Information Card --- */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 rounded-3xl shadow-sm transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                <UserOutlined />
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                รายละเอียดส่วนบุคคล
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="md:col-span-2 group">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-blue-500">
                  ชื่อ-นามสกุลจริง
                </label>
                <div className="relative">
                  <UserOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors " />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-3.5 sm:py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    placeholder="นายกมล เทคนิค"
                  />
                </div>
              </div>

              <div className="md:col-span-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-blue-500">
                  ชื่อผู้ใช้งาน (ระบบ){" "}
                  <span className="text-blue-600 font-normal italic">
                    * แก้ไขได้เฉพาะ Super Admin
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.replace(/\s/g, ""),
                      })
                    }
                    readOnly={formData.role !== "super_admin"}
                    className={`w-full ${formData.role === "super_admin" ? "bg-blue-50/30 border-blue-200 text-slate-800" : "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"} rounded-2xl pl-12 pr-5 py-4 outline-none transition-all font-bold italic`}
                    placeholder="username"
                  />
                  {formData.role !== "super_admin" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-md text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                      Read-Only
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-blue-500">
                  สังกัด / แผนก
                </label>
                <div className="relative group">
                  <SafetyCertificateOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors z-10" />
                  <select
                    id="department_select"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold cursor-pointer"
                  >
                    <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>
                    <option value="ผู้บริหารสถานศึกษา">
                      ผู้บริหารสถานศึกษา
                    </option>
                    <optgroup label="1. ฝ่ายบริหารทรัพยากร">
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
                      <option value="งานทะเบียน">งานทะเบียน</option>
                      <option value="งานแม่บ้าน/นักการ">
                        งานแม่บ้าน/นักการ
                      </option>
                    </optgroup>
                    <optgroup label="2. ฝ่ายยุทธศาสตร์และแผนงาน">
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
                    <optgroup label="3. ฝ่ายพัฒนากิจการนักเรียน นักศึกษา">
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
                    <optgroup label="4. ฝ่ายวิชาการ">
                      <option value="งานพัฒนาหลักสูตรและการจัดการเรียนรู้">
                        งานพัฒนาหลักสูตรและการจัดการเรียนรู้
                      </option>
                      <option value="งานวัดผลและประเมินผล">
                        งานวัดผลและประเมินผล
                      </option>
                      <option value="งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ">
                        งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ
                      </option>
                      <option value="งานวิทยบริการและเทคโนโลยีการศึกษา">
                        งานวิทยบริการและเทคโนโลยีการศึกษา
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
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block">
                  อีเมล
                </label>
                <div className="relative">
                  <MailOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    placeholder="name@ktltc.ac.th"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-blue-500">
                  เบอร์ติดต่อ
                </label>
                <div className="relative">
                  <PhoneOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-blue-500">
                  Line ID
                </label>
                <div className="relative">
                  <MessageOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.lineId}
                    onChange={(e) =>
                      setFormData({ ...formData, lineId: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    placeholder="@ktltc"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- ความปลอดภัย Card --- */}
          <motion.div
            variants={itemVariants}
            className="mt-6 bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm transition-all duration-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                  <LockOutlined />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                  ความปลอดภัย
                </h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-amber-500">
                  รหัสผ่านใหม่ (ไม่บังคับ)
                </label>
                <div className="relative">
                  <LockOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors " />
                  <input
                    type="password"
                    value={formData.password}
                    autoComplete="new-password"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1 mb-2 block transition-colors group-focus-within:text-amber-500">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <LockOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border rounded-2xl pl-12 pr-5 py-4 text-zinc-800 dark:text-zinc-200 outline-none transition-all ${
                      formData.password &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-400 focus:ring-4 focus:ring-red-500/5"
                        : "border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500"
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {formData.password &&
                    formData.password !== formData.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-[11px] font-medium mt-2 ml-1"
                      >
                        * รหัสผ่านไม่ตรงกัน
                      </motion.p>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* --- Action Buttons --- */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center sm:justify-end pt-6"
          >
            <button
              type="submit"
              disabled={saving}
              className={`group relative overflow-hidden flex items-center justify-center gap-4 w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-6 rounded-full font-black text-white transition-all duration-300 shadow-2xl ${
                saveSuccess
                  ? "bg-emerald-500 shadow-emerald-500/40 scale-105"
                  : saving
                    ? "bg-zinc-400 cursor-wait shadow-none"
                    : "bg-linear-to-r from-blue-600 to-indigo-700 hover:shadow-indigo-600/50 hover:-translate-y-1.5 active:scale-95 active:translate-y-0"
              }`}
            >
              {!saving && !saveSuccess && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}

              <span className="relative px-2 sm:px-6 z-10 flex items-center justify-center gap-3 sm:gap-4 tracking-widest sm:tracking-widest uppercase text-base sm:text-lg">
                {saveSuccess ? (
                  <>
                    <CheckCircleFilled className="text-xl sm:text-2xl" />
                    SUCCESS!
                  </>
                ) : saving ? (
                  <>
                    <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                    SAVING...
                  </>
                ) : (
                  <>
                    CONFIRM & SAVE
                    <SaveOutlined className="text-lg sm:text-xl group-hover:scale-125 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
