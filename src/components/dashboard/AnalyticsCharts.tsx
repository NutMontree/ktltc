"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Loader2, Globe, Monitor, Smartphone, Trash2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics?days=7");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearData = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสถิติการเข้าชมทั้งหมด? (การกระทำนี้ไม่สามารถกู้คืนได้)")) return;
    
    setIsClearing(true);
    try {
      const res = await fetch("/api/admin/analytics", { method: "DELETE" });
      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ!");
        fetchAnalytics(); // Refresh
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const latestVisitorsShort = data.latestVisitors.slice(0, 50); // Show max 50 in standard view

  return (
    <div className="space-y-6 mt-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">สถิติขั้นสูง (Advanced Analytics)</h2>
        <button 
          onClick={handleClearData}
          disabled={isClearing}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 font-bold text-sm rounded-xl transition-all disabled:opacity-50"
        >
          {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span>เคลียร์ข้อมูลสถิติ</span>
        </button>
      </div>

      {/* 1. Daily Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-6 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-blue-500" />
          แนวโน้มผู้เข้าชมเว็บไซต์ (7 วันล่าสุด)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
            <LineChart data={data.dailyTrendChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              />
              <Line type="monotone" dataKey="visitors" name="ผู้เข้าชม (คน)" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Device Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-6 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-500" />
            สัดส่วนอุปกรณ์ (Devices)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
              <PieChart>
                <Pie
                  data={data.deviceChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.deviceChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Latest Visitors / Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-6 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              ผู้เข้าใช้งานล่าสุด (พิกัด & IP)
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" /> ดูทั้งหมด
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {latestVisitorsShort.map((v: any, i: number) => (
              <div key={i} className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
                    {v.device === 'mobile' ? <Smartphone className="w-4 h-4 text-zinc-500 shrink-0" /> : <Monitor className="w-4 h-4 text-zinc-500 shrink-0" />}
                    <span>{v.location}</span>
                    {v.count > 1 && (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {v.count} ครั้ง
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium tracking-widest mt-1 break-words">
                    IP: {v.ip} • {v.browser} ({v.os})
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0 max-w-full">
                  <a 
                    href={v.path || '/'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-2 py-1 rounded-md inline-block break-all transition-colors"
                  >
                    {v.path || '/'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Full Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-2xl flex flex-col h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-emerald-500" />
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                      ข้อมูลผู้เข้าใช้งานทั้งหมด (พิกัด & IP)
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                      แสดงรายการผู้เข้าเยี่ยมชมทั้งหมดที่บันทึกไว้ในระบบ
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {data.latestVisitors.map((v: any, i: number) => (
                  <div key={i} className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-emerald-200 dark:hover:border-emerald-900/50">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
                        {v.device === 'mobile' ? <Smartphone className="w-5 h-5 text-emerald-500 shrink-0" /> : <Monitor className="w-5 h-5 text-emerald-500 shrink-0" />}
                        <span className="text-base">{v.location}</span>
                        {v.count > 1 && (
                          <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-md ml-1 shadow-sm">
                            เข้าชม {v.count} ครั้ง
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-zinc-500 font-bold bg-zinc-200/50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                          IP: {v.ip}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
                          {v.browser} ({v.os})
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium tracking-widest">
                          {new Date(v.time).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right shrink-0 max-w-full md:max-w-[40%]">
                      <a 
                        href={v.path || '/'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 hover:bg-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-3 py-2 rounded-xl inline-block break-all transition-all shadow-sm"
                      >
                        {v.path || '/'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
