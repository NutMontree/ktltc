"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import PostersForm from "@/components/PostersForm";

export default function AddPosterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unlockScroll = () => {
      document.body.style.overflow = "auto";
      document.body.style.pointerEvents = "auto";
    };
    unlockScroll();
    return () => unlockScroll();
  }, [loading]);

  const handleAddPoster = async (formData: any) => {
    if (!formData.imageUrl) return toast.error("กรุณาอัปโหลดรูปภาพ");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("สร้างโปสเตอร์สำเร็จ!");
        document.body.style.overflow = "auto";
        router.push("/dashboard/posters");
        router.refresh();
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
      document.body.style.overflow = "auto";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard/posters"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          เพิ่มโปสเตอร์ใหม่
        </h1>
      </div>

      <PostersForm onSubmit={handleAddPoster} loading={loading} />
    </div>
  );
}
