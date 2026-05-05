"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HiOutlineTrash } from "react-icons/hi";

// ✅ 1. ต้องรับ title มาจากหน้า List
export default function DeleteNewsBtn({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState("เจ้าหน้าที่");

  // ดึงชื่อคนลบมาเตรียมไว้
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setCurrentUser(data.name);
        else if (data.user?.name) setCurrentUser(data.user.name);
      })
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    // ตรวจสอบว่า title มีค่าไหมก่อนลบ
    if (!confirm(`ยืนยันการลบข่าว: "${title || "ไม่มีหัวข้อ"}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        // ✅ 2. ส่งข้อมูลไป Log (ต้องสะกดให้ตรงกับ API Route)
        await fetch("/api/admin/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: currentUser, // ตรงกับ userName ใน API
            action: "DELETE_POST", // ตรงกับ action ใน API
            details: `ลบข่าวประชาสัมพันธ์หัวข้อ: "${title}"`, // ตรงกับ details ใน API
            link: null, // ลบไปแล้วไม่ต้องมี link
          }),
        });

        router.refresh();
      } else {
        // หากลบไม่สำเร็จ (เช่น ไม่ใช่เจ้าของ) ให้แจ้งเตือนด้วยข้อความจาก API
        alert(`ไม่สามารถลบได้: ${data.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700"
    >
      {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
    </button>
  );
}
