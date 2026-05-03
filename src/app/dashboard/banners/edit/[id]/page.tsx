// src\app\dashboard\banners\edit\[id]\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import {
  FiArrowLeft,
  FiSave,
  FiLink,
  FiImage,
  FiLoader,
  FiRefreshCw,
  FiHash,
} from "react-icons/fi";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id;

  const [formData, setFormData] = useState({
    title: "",
    linkUrl: "",
    order: 0,
    isActive: true,
    imageUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`/api/banners/${bannerId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            title: data.title || "",
            linkUrl: data.linkUrl || "",
            order: data.order || 0,
            isActive: data.isActive ?? true,
            imageUrl: data.imageUrl || "",
          });
          setPreviewUrl(data.imageUrl);
        } else {
          toast.error("ไม่พบข้อมูลแบนเนอร์");
          router.push("/dashboard/banners");
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    if (bannerId) fetchBanner();
  }, [bannerId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const res = await fetch(`/api/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl,
        }),
      });

      if (res.ok) {
        toast.success("อัปเดตแบนเนอร์สำเร็จ");
        setTimeout(() => router.push("/dashboard/banners"), 1500);
      } else {
        toast.error("บันทึกข้อมูลล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center max-w-[1600px] mx-auto">
        <FiLoader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-400 font-bold italic tracking-tighter">
          กำลังดึงข้อมูลแบนเนอร์...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto bg-[#f8fafc] pb-20 font-sans">
      <Toaster position="top-center" />

      <nav className="bg-white border-b border-slate-200 sticky top-20 z-10 px-2 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-slate-600" />
            </button>
            <h2 className="font-bold text-slate-800 italic uppercase">
              แก้ไขแบนเนอร์
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {bannerId}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-2 mt-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-4xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <FiImage className="w-5 h-5" />
                  <h3 className="font-black uppercase tracking-wider text-sm italic">
                    ตัวอย่างแบนเนอร์
                  </h3>
                </div>
                {selectedFile && (
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-full font-bold">
                    มีการเปลี่ยนรูปภาพ
                  </span>
                )}
              </div>

              <div className="relative aspect-21/9 rounded-4xl overflow-hidden border-4 border-white shadow-xl group bg-slate-900">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      priority
                    />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                      <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        <FiRefreshCw /> เปลี่ยนรูปภาพใหม่
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300 italic text-sm">
                    ไม่พบรูปภาพ
                  </div>
                )}
              </div>
              <p className="mt-4 text-[11px] text-slate-400 italic text-center">
                * ภาพจะแสดงผลแบบ Contain เพื่อป้องกันเนื้อหาถูกตัด
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-4xl p-4 shadow-sm border border-slate-200">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    หัวข้อแบนเนอร์
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    ลิงก์ปลายทาง
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      ลำดับ
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      สถานะ
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className={`w-full p-4 rounded-xl font-bold transition-all ${
                        formData.isActive
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {formData.isActive ? "แสดงผล" : "ปิดไว้"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase disabled:bg-slate-300"
                >
                  {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                  {saving ? "กำลังอัปเดต..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
