"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 1. เพิ่ม useRouter
import Image from "next/image";
import {
  Plus,
  ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { uploadFile } from "@/lib/upload";

interface PostersFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function PostersForm({
  initialData,
  onSubmit,
  loading,
}: PostersFormProps) {
  const router = useRouter(); // 2. เรียกใช้งาน router
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    isActive: initialData?.isActive ?? true,
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file, "ktltc_posters");
      if (url) {
        setFormData({ ...formData, imageUrl: url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Top Navigation: ปุ่มย้อนกลับ */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} />
        ย้อนกลับ
      </button>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 animate-in fade-in duration-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Upload Section (เหมือนเดิม) */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              <ImageIcon size={18} className="text-blue-500" />
              รูปภาพโปสเตอร์
            </label>
            <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-all hover:border-blue-400">
              {formData.imageUrl ? (
                <div className="relative aspect-3/4 w-full h-full animate-in zoom-in-95 duration-300">
                  <Image
                    src={formData.imageUrl}
                    alt="Poster Preview"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl transform transition hover:scale-110"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full aspect-3/4 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleFileChange}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      <p className="text-sm font-bold text-zinc-500">
                        กำลังอัปโหลด...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-zinc-700 dark:text-zinc-200">
                          คลิกเพื่ออัปโหลด
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 text-balance">
                          รองรับ JPG, PNG (ระบบจะบีบอัดให้อัตโนมัติ)
                        </p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                หัวข้อวันสำคัญ
              </label>
              <input
                type="text"
                placeholder="เช่น วันแม่แห่งชาติ..."
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all text-zinc-800 dark:text-zinc-100"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                รายละเอียด
              </label>
              <textarea
                rows={4}
                placeholder="ระบุรายละเอียดเพิ่มเติม..."
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all text-zinc-800 dark:text-zinc-100 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Status Switcher (เหมือนเดิม) */}
            <div
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                formData.isActive
                  ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800"
                  : "bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* ไอคอนสถานะ */}
                <div
                  className={`p-2 rounded-xl transition-colors ${formData.isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-zinc-200 dark:bg-zinc-800"}`}
                >
                  {formData.isActive ? (
                    <CheckCircle2
                      className="text-emerald-600 dark:text-emerald-400"
                      size={20}
                    />
                  ) : (
                    <AlertCircle
                      className="text-zinc-500 dark:text-zinc-400"
                      size={20}
                    />
                  )}
                </div>

                {/* ข้อความประกอบ */}
                <div>
                  <p
                    className={`text-sm font-black uppercase tracking-wide ${formData.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"}`}
                  >
                    {formData.isActive ? "แสดงผลทันที" : "ปิดการแสดงผลชั่วคราว"}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    กำหนดสถานะการมองเห็นบนหน้าหลักของระบบ
                  </p>
                </div>
              </div>

              {/* ตัวปุ่ม Switch */}
              <div
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isActive ? "bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-none" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                    formData.isActive ? "left-7" : "left-1"
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons: บันทึก และ ยกเลิก */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard/posters")} // ยกเลิกแล้วกลับไปหน้ารวม
                className="flex-1 py-4 bg-red-500  text-white dark:bg-zinc-800 dark:text-zinc-400 rounded-2xl font-bold uppercase tracking-widest transition-all hover:bg-red-600 dark:hover:bg-zinc-700 active:scale-[0.98]"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-4 bg-sky-900 hover:bg-sky-600 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-widest transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {loading
                  ? "กำลังดำเนินการ..."
                  : initialData
                    ? "บันทึกการแก้ไข"
                    : "ยืนยันการเพิ่ม"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
