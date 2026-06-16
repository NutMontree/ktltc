"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, Settings, Layout, ArrowRight } from "lucide-react";

export default function ManageHomePage() {
  const [data, setData] = useState<any>({ components: [], siteSettings: [] });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/home-settings");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ปรับปรุง: ส่ง label ไปด้วยเพื่อบันทึก Log ให้ระบุชื่อส่วนประกอบได้
  const updateVisibility = async (
    componentId: string,
    current: boolean,
    label: string,
  ) => {
    setUpdatingId(componentId);
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMPONENT_VISIBILITY",
          componentId,
          isVisible: !current,
          label, // ส่งชื่อไปบันทึก Log
        }),
      });

      if (res.ok) {
        toast.success(`อัปเดต ${label} สำเร็จ`);
        await fetchData();
      }
    } catch (error) {
      toast.error("อัปเดตไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-bold text-zinc-400 animate-pulse font-mono uppercase">
          Syncing Settings...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] py-12 mx-auto p-2 space-y-10 animate-in fade-in duration-500">
      <Toaster position="bottom-right" />

      {/* --- Header --- */}
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          จัดการ <span className="text-blue-600">เนื้อหาหน้าหลัก</span>
        </h1>
        <p className="text-zinc-500 font-medium">
          ควบคุมระบบแสดงผลและบันทึกประวัติการแก้ไขอัตโนมัติ
        </p>
      </header>

      {/* --- Section 1: Component Visibility --- */}
      <section className="bg-white dark:bg-zinc-900 rounded-4xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-blue-500/5">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
          <Layout className="text-blue-600" />
          การมองเห็นส่วนประกอบ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.components.map((comp: any) => (
            <div
              key={comp.componentId}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-4xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-blue-300 group"
            >
              <div>
                <span className="font-black text-lg text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 transition-colors">
                  {comp.label}
                </span>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-1">
                  ID: {comp.componentId}
                </p>
              </div>

              <button
                disabled={updatingId === comp.componentId}
                onClick={() =>
                  updateVisibility(comp.componentId, comp.isVisible, comp.label)
                }
                className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                  comp.isVisible
                    ? "bg-blue-600 shadow-lg shadow-blue-500/40"
                    : "bg-zinc-300 dark:bg-zinc-700"
                } disabled:opacity-50`}
              >
                <div
                  className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${
                    comp.isVisible ? "left-9" : "left-2"
                  } ${updatingId === comp.componentId ? "animate-pulse scale-75" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Section 2: Quick Access Management --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[
          {
            title: "Hero Banners",
            sub: "แบนเนอร์หลัก (Swiper)",
            link: "/dashboard/banners",
            icon: "🖼️",
            color: "bg-blue-600",
          },
          {
            title: "Marquee Text",
            sub: "ตัวอักษรวิ่ง (Marquee)",
            link: "/dashboard/manage-marquee",
            icon: "📢",
            color: "bg-blue-600",
          },
          {
            title: "Main Posters",
            sub: "ประชาสัมพันธ์หลัก/โปสเตอร์",
            link: "/dashboard/posters",
            icon: "⚡",
            color: "bg-blue-600",
          },
          {
            title: "Social Feeds",
            sub: "YouTube / Facebook on homepage",
            link: "/dashboard/feeds",
            icon: "Feed",
            color: "bg-blue-600",
          },
          {
            title: "Visual Effects",
            sub: "เอฟเฟคตกแต่งหน้าจอ (71 แบบ)",
            link: "/dashboard/effects",
            icon: "✨",
            color: "bg-blue-600",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 rounded-4xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between group hover:-translate-y-2 transition-all"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                {card.icon}
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {card.title}
                </h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                  {card.sub}
                </p>
              </div>
            </div>
            <Link
              href={card.link}
              className={`w-full ${card.color} text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95`}
            >
              จัดการเนื้อหา
              <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
        ))}
      </div>

      <footer className="text-center pt-10 pb-6 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">
          Kantharalak Technical College • Audit Log System Enabled
        </p>
      </footer>
    </div>
  );
}
