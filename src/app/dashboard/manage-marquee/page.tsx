"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiInfo, FiLoader } from "react-icons/fi";

export default function ManageMarqueePage() {
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/home-settings");
      const json = await res.json();
      setSiteSettings(json.siteSettings || []);
    } catch (error) {
      toast.error("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateText = async (key: string, value: string, label: string) => {
    setIsSaving(key);
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SITE_SETTING",
          key,
          value,
          label, // ✅ ส่ง label ไปบันทึก Log เช่น "Marquee Text 1"
        }),
      });

      if (res.ok) {
        toast.success(`บันทึก ${label} สำเร็จ`);
        fetchData();
      } else {
        toast.error("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <FiLoader className="w-10 h-10 animate-spin text-amber-500" />
        <p className="font-bold text-zinc-400 animate-pulse uppercase tracking-widest text-xs">
          Loading Settings...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto p-2 space-y-8 animate-in fade-in duration-500">
      {/* <Toaster position="bottom-right" /> */}

      {/* Navigation & Header */}
      <div className="flex items-center gap-6 mb-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-2xl transition-all shadow-sm active:scale-90"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            แก้ไข <span className="text-amber-500">ข้อความมาร์ค</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            จัดการข้อความวิ่งและบันทึกประวัติการแก้ไขเข้าสู่ระบบ Audit Log
          </p>
        </div>
      </div>

      <section className="bg-white dark:bg-zinc-900 rounded-4xl py-6 px-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-amber-500/5">
        <div className="space-y-10">
          {[
            { key: "marquee_text_1", label: "ข้อความมาร์ค 1 (ขวาไปซ้าย)" },
            { key: "marquee_text_2", label: "ข้อความมาร์ค 2 (ซ้ายไปขวา)" },
          ].map((item, index) => {
            const setting = siteSettings.find((s: any) => s.key === item.key);
            return (
              <div key={item.key} className="group space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/30">
                    {index + 1}
                  </span>
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                    {item.label}
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <input
                      id={item.key}
                      type="text"
                      defaultValue={setting?.value || ""}
                      placeholder="กรุณากรอกข้อความที่ต้องการให้วิ่ง..."
                      className="w-full bg-transparent outline-none font-medium focus:ring-0"
                    />
                  </div>
                  <button
                    disabled={isSaving === item.key}
                    onClick={() =>
                      updateText(
                        item.key,
                        (document.getElementById(item.key) as HTMLInputElement)
                          .value,
                        item.label,
                      )
                    }
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-5 rounded-3xl font-black shadow-xl hover:bg-amber-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                  >
                    {isSaving === item.key ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiSave size={18} />
                    )}
                    {isSaving === item.key ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-4xl flex gap-4 items-start">
          <FiInfo className="text-amber-500 shrink-0 mt-1" size={20} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              💡 System Note
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-medium">
              ทุกการกดบันทึก ระบบจะลงทะเบียนชื่อผู้แก้ไข วันเวลา
              และข้อความใหม่ลงในฐานข้อมูล Audit Log โดยอัตโนมัติ
              เพื่อความโปร่งใสในการจัดการข้อมูลวิทยาลัย
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center pb-6">
        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">
          Security & Transparency System Enabled
        </p>
      </footer>
    </div>
  );
}
