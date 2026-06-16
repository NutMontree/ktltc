"use client";

import { useState, useEffect } from "react";
import { effectCategories } from "@/lib/effectsConfig";
import { toast, Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function AdminEffectsPage() {
  const [activeEffect, setActiveEffect] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // โหลดค่าเอฟเฟคปัจจุบันจาก Database
  const fetchCurrentEffect = async () => {
    try {
      const res = await fetch("/api/admin/home-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      
      const effectSetting = json.siteSettings?.find(
        (s: any) => s.key === "global_effect"
      );
      
      if (effectSetting) {
        setActiveEffect(effectSetting.value);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดการตั้งค่าเอฟเฟคได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentEffect();
  }, []);

  const handleSelectEffect = async (id: string, name: string) => {
    if (activeEffect === id) return;
    
    setSaving(true);
    setActiveEffect(id);

    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SITE_SETTING",
          key: "global_effect",
          value: id,
          label: "เอฟเฟคหน้าเว็บ (Global Visual Effect)",
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success(`เปลี่ยนเอฟเฟคเป็น "${name}" สำเร็จ`);
      
      // ส่ง Event ไปยังหน้าเว็บเพื่อให้เปลี่ยนเอฟเฟคทันทีสำหรับแอดมินที่กำลังดูอยู่
      window.dispatchEvent(new CustomEvent("effectChange", { detail: id }));
      
    } catch (error) {
      toast.error("บันทึกเอฟเฟคไม่สำเร็จ");
      // Revert if failed
      await fetchCurrentEffect();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-bold text-zinc-400 animate-pulse font-mono uppercase">
          Loading Effects...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] py-12 mx-auto p-2 space-y-10 animate-in fade-in duration-500">
      <Toaster position="bottom-right" />

      {/* --- Header --- */}
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          จัดการ <span className="text-blue-600">เอฟเฟคหน้าจอ</span> (Global Effects)
        </h1>
        <p className="text-zinc-500 font-medium">
          เลือกเอฟเฟคที่จะแสดงผลบนหน้าเว็บไซต์ เอฟเฟคที่เลือกจะแสดงให้กับ <span className="text-red-500 font-bold">"ผู้เยี่ยมชมทุกคน"</span> ทันที
        </p>
      </header>

      <div className="pt-4 pb-8">
        <button
          disabled={saving}
          onClick={() => handleSelectEffect("none", "ปิดการใช้งาน")}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
            activeEffect === "none"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          } disabled:opacity-50`}
        >
          🚫 ปิดการใช้งานเอฟเฟคทั้งหมด
        </button>
      </div>

      <div className="space-y-16">
        {effectCategories.map((category, index) => (
          <div key={index} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {category.title}
              </h2>
              <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {category.effects.map((effect) => {
                const isActive = activeEffect === effect.id;

                return (
                  <button
                    key={effect.id}
                    disabled={saving}
                    onClick={() => handleSelectEffect(effect.id, effect.name)}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 overflow-hidden outline-none ${
                      isActive
                        ? "bg-white dark:bg-zinc-900 shadow-2xl shadow-blue-500/30 scale-105 ring-2 ring-blue-500 z-10"
                        : "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:scale-105 border border-slate-100 dark:border-zinc-800"
                    } disabled:opacity-50`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    )}

                    {/* Background Gradient for Hover */}
                    <div
                      className={`absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${effect.color}`}
                    ></div>

                    {/* Icon Container */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110 ${
                        isActive
                          ? `bg-linear-to-br text-white shadow-lg ${effect.color}`
                          : "bg-slate-50 dark:bg-zinc-800"
                      }`}
                    >
                      <span className={isActive && effect.id !== "none" ? "animate-bounce" : ""}>
                        {effect.icon}
                      </span>
                    </div>

                    {/* Text */}
                    <h3
                      className={`font-bold text-sm text-center transition-colors ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {effect.name}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
