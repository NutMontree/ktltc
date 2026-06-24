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
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Poster {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  orderIndex?: number;
}

// Component สำหรับแต่ละ Poster ที่สามารถลากได้
function SortablePosterItem({
  poster,
  index,
  processingId,
  toggleStatus,
  handleDelete,
}: {
  poster: Poster;
  index: number;
  processingId: string | null;
  toggleStatus: (id: string, status: boolean) => void;
  handleDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: poster._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white dark:bg-zinc-900 rounded-4xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 touch-none ${
        isDragging ? "shadow-2xl scale-105 z-50" : "hover:-translate-y-2"
      }`}
    >
      {/* Drag Handle Area (Image Container) */}
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-3/4 rounded-4xl overflow-hidden mb-5 cursor-grab active:cursor-grabbing"
      >
        <Image
          src={poster.imageUrl}
          alt={poster.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
          unoptimized
        />

        {/* Overlay for drag instruction - only visible on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600/90 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              Drag to Reorder
            </span>
          </div>
        </div>
        
        {/* Order Indicator */}
        <div className="absolute left-4 top-4 bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-black italic shadow-lg z-20 pointer-events-none">
          {index + 1}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-16 z-10 group-hover:opacity-0 transition-opacity pointer-events-none">
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
      </div>

      {/* Quick Toggle (Absolute to Main Card so it's clickable and outside drag area) */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => toggleStatus(poster._id, poster.isActive)}
          disabled={processingId === poster._id}
          className="p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-xl hover:scale-110 transition-all"
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

      {/* Bottom Actions */}
      <div className="px-2 space-y-3 relative z-30">
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
  );
}

export default function ManagePostersPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPosters((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // ส่งไปบันทึกบน Server
        saveNewOrder(newItems);
        
        return newItems;
      });
    }
  };

  const saveNewOrder = async (newItems: Poster[]) => {
    const itemsToUpdate = newItems.map((item, index) => ({
      _id: item._id,
      orderIndex: index, // ลำดับใหม่
    }));

    try {
      const res = await fetch(`/api/admin/posters/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToUpdate }),
      });

      if (!res.ok) throw new Error("Failed to reorder");
      toast.success("บันทึกลำดับเรียบร้อย");
    } catch (error) {
      toast.error("ไม่สามารถบันทึกลำดับได้");
      fetchPosters(); // ย้อนกลับถ้าระบบผิดพลาด
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
            จัดการลำดับและการแสดงผลสื่อประชาสัมพันธ์ (ลากเพื่อเรียงลำดับ)
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

      {/* Grid Layout with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <SortableContext items={posters.map(p => p._id)} strategy={rectSortingStrategy}>
            {posters.map((poster, index) => (
              <SortablePosterItem
                key={poster._id}
                poster={poster}
                index={index}
                processingId={processingId}
                toggleStatus={toggleStatus}
                handleDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
