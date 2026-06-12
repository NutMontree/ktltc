"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PostersForm from "@/components/PostersForm";
import { toast, Toaster } from "react-hot-toast";

export default function EditPosterPage() {
  const { id } = useParams();
  const router = useRouter();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลเดิมมาใส่ในฟอร์ม
  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const res = await fetch(`/api/admin/posters/${id}`);
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
        const data = await res.json();
        setPoster(data);
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };
    fetchPoster();
  }, [id]);

  const handleUpdate = async (updatedData: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posters/${id}`, {
        method: "PATCH",
        // จุดสำคัญ: ต้องระบุ Headers ให้ Server ทราบว่าเป็น JSON
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        toast.success("อัปเดตข้อมูลสำเร็จ!");

        // ปลดล็อก scroll (กรณีเปิด Cloudinary ค้างไว้)
        document.body.style.overflow = "auto";

        // หน่วงเวลาเล็กน้อยให้ User เห็น Toast แล้วค่อย Redirect
        setTimeout(() => {
          router.push("/dashboard/posters");
          router.refresh(); // บังคับให้หน้า List โหลดข้อมูลใหม่
        }, 1000);
      } else {
        const err = await res.json();
        toast.error(err.error || "แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
      document.body.style.overflow = "auto";
    }
  };

  if (!poster)
    return (
      <div className="flex justify-center p-20 italic text-zinc-400">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-2">
      <h1 className="text-2xl font-black uppercase mb-8 tracking-tight">
        แก้ไขโปสเตอร์
      </h1>

      <PostersForm
        initialData={poster}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  );
}
