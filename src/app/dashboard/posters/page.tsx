"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// กำหนด Interface เพื่อแก้ปัญหา Type 'never[]' หรือ 'any[]'
interface Poster {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  orderIndex?: number;
}

export default function ManagePostersPage() {
  // กำหนด Type ให้ State อย่างชัดเจน
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPosters = async () => {
    try {
      const res = await fetch("/api/admin/posters");
      const data: Poster[] = await res.json();
      // จัดเรียงลำดับตาม orderIndex จากน้อยไปมาก
      const sortedData = data.sort(
        (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0),
      );
      setPosters(sortedData);
    } catch (error) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  // ฟังก์ชันปรับลำดับการแสดงผล
  const moveOrder = async (
    id: string,
    currentOrder: number,
    direction: "up" | "down",
  ) => {
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/posters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIndex: newOrder,
          // ส่งข้อมูลเพื่อให้ API ไปเขียน Log ได้ถูกต้อง
          logAction: "REORDER_POSTER",
          logDetails: `ปรับลำดับโปสเตอร์เป็น: ${newOrder}`,
        }),
      });

      if (res.ok) {
        await fetchPosters(); // Refresh ข้อมูลใหม่เพื่อให้ลำดับเรียงใหม่
        toast.success("ปรับลำดับเรียบร้อย");
      }
    } catch (error) {
      toast.error("ไม่สามารถปรับลำดับได้");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/posters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setPosters((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, isActive: !currentStatus } : p,
          ),
        );
        toast.success(currentStatus ? "ปิดการแสดงผลแล้ว" : "เปิดการแสดงผลแล้ว");
      }
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโปสเตอร์นี้?")) return;

    try {
      const res = await fetch(`/api/admin/posters/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบโปสเตอร์เรียบร้อย");
        setPosters(posters.filter((p) => p._id !== id));
      }
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-bold text-zinc-400 animate-pulse font-mono tracking-widest">
          SYNCING_ORDER...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto p-2 space-y-10 animate-in fade-in duration-700">
      {/* <Toaster position="bottom-right" /> */}

      {/* Header Section */}
      <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden p-6 rounded-[3rem] bg-zinc-900 text-white shadow-2xl">
        <div className="z-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <span className="bg-blue-600 px-3 py-1 rounded-2xl rotate-3 inline-block text-white">
              Main
            </span>
            Posters
          </h1>
          <p className="text-zinc-400 mt-2 font-medium">
            จัดการลำดับและการแสดงผลสื่อประชาสัมพันธ์
          </p>
        </div>

        <Link
          href="/dashboard/posters/add"
          className="z-10 group bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95"
        >
          <Plus
            size={20}
            strokeWidth={3}
            className="group-hover:rotate-90 transition-transform"
          />
          ADD NEW POSTER
        </Link>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {posters.map((poster, index) => (
          <div
            key={poster._id}
            className="group bg-white dark:bg-zinc-900 rounded-4xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="relative aspect-3/4 rounded-4xl overflow-hidden mb-5">
              <Image
                src={poster.imageUrl}
                alt={poster.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />

              {/* Order Controls - Overlay on Image */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    moveOrder(poster._id, poster.orderIndex || 0, "up")
                  }
                  className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                >
                  <ChevronUp size={20} strokeWidth={3} />
                </button>
                <div className="bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-black italic shadow-lg">
                  {index + 1}
                </div>
                <button
                  onClick={() =>
                    moveOrder(poster._id, poster.orderIndex || 0, "down")
                  }
                  className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                >
                  <ChevronDown size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10 group-hover:opacity-0 transition-opacity">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border backdrop-blur-md ${
                    poster.isActive
                      ? "bg-emerald-500/80 border-emerald-400 text-white"
                      : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
                  }`}
                >
                  {poster.isActive ? "● ONLINE" : "○ HIDDEN"}
                </span>
              </div>

              {/* Quick Toggle */}
              <button
                onClick={() => toggleStatus(poster._id, poster.isActive)}
                disabled={processingId === poster._id}
                className="absolute top-4 right-4 p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-xl hover:scale-110 transition-all"
              >
                {processingId === poster._id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : poster.isActive ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} className="text-red-500" />
                )}
              </button>
            </div>

            <div className="px-2 space-y-3">
              <h3 className="font-black text-lg text-zinc-800 dark:text-zinc-100 truncate">
                {poster.title || "ไม่มีหัวข้อ"}
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/posters/edit/${poster._id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
                >
                  <Edit3 size={14} /> EDIT
                </Link>
                <button
                  onClick={() => handleDelete(poster._id)}
                  className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
