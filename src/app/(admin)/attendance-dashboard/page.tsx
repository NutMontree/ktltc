"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  PieChart as PieIcon,
  Loader2 as LucideLoader,
} from "lucide-react";
import dynamic from "next/dynamic";

const MapDashboard = dynamic(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
      <div className="flex flex-col items-center gap-3">
        <LucideLoader className="animate-spin text-blue-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">กำลังเรียกข้อมูล...</p>
      </div>
    </div>
  ),
});

export default function AdminAttendanceDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  });

  const [data, setData] = useState([
    { name: "มาทำงานตรงเวลา", value: 0, color: "#10b981" }, // Emerald 500
    { name: "มาสาย", value: 0, color: "#f59e0b" }, // Amber 500
    { name: "ลา / ขาด", value: 0, color: "#f43f5e" }, // Rose 500
  ]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTotal, setRealTotal] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/dashboard?date=${selectedDate}&_t=${Date.now()}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setMarkers(json.markers || []);
          setRealTotal(json.totalEmployees || 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedDate]);

  const total = realTotal || data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomPieLabel = ({ cx, cy }: any) => {
    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill="currentColor"
          className="font-black text-2xl md:text-3xl fill-slate-800 dark:fill-white transition-colors duration-500"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy}
          dy={-22}
          textAnchor="middle"
          fill="#94a3b8"
          className="uppercase text-[9px] font-black tracking-[0.2em] fill-slate-400"
        >
          <span>ทั้งหมด</span>
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-6 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-2xl shadow-blue-500/20 border border-blue-400 group hover:rotate-6 transition-transform">
                <Layers size={22} />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                ระบบข้อมูล <span className="text-blue-600">ภาพรวมการเข้างาน</span>
              </h1>
            </div>
            <p className="text-slate-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-[0.25em] pl-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ระบบติดตามผลการปฏิบัติงานองค์กร v2.0
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-14 pr-8 py-4 w-full md:w-auto bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl font-black text-sm text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xl shadow-black/2 hover:shadow-2xl hover:border-slate-200 dark:hover:border-zinc-700 appearance-none cursor-pointer scheme-light-dark"
              />
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "จำนวนบุคลากรทั้งหมด",
              val: total,
              unit: "คน",
              icon: Users,
              theme: "indigo",
              delay: 0,
            },
            {
              label: "สถานะการมาทำงานปกติ (ตรงเวลา)",
              val: data[0].value,
              unit: "staff",
              icon: Activity,
              theme: "emerald",
              delay: 0.1,
            },
            {
              label: "สถานะการเข้างาน (สาย)",
              val: data[1].value,
              unit: "staff",
              icon: Clock,
              theme: "amber",
              delay: 0.2,
            },
            {
              label: "สถานะการลางาน / ขาดงาน",
              val: data[2].value,
              unit: "staff",
              icon: AlertTriangle,
              theme: "rose",
              delay: 0.3,
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, type: "spring", damping: 15 }}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-4xl p-6 shadow-2xl shadow-black/3 relative group overflow-hidden transition-all hover:shadow-indigo-500/5 hover:-translate-y-1.5"
              >
                <div
                  className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-125 duration-700 text-${stat.theme}-600`}
                >
                  <Icon size={120} />
                </div>
                <div className="flex flex-col items-start gap-6 relative z-10">
                  <div
                    className={`p-4 bg-${stat.theme}-50 dark:bg-${stat.theme}-500/10 text-${stat.theme}-600 dark:text-${stat.theme}-400 rounded-2xl shadow-sm border border-${stat.theme}-100 dark:border-${stat.theme}-900/30 group-hover:rotate-12 transition-transform`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-2">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                        {stat.val}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 ">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className=""
          >
            {/* <div className="absolute top-10 left-10 z-20">
              <div className="px-2 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-zinc-300">
                  Personnel Heatmap
                </span>
              </div>
            </div> */}
            <div className="h-[580px] w-full rounded-3xl overflow-hidden relative border border-slate-50 dark:border-zinc-800 shadow-inner">
              <MapDashboard markers={markers} />
            </div>
          </motion.div>

          {/* Stats Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-4xl p-6 shadow-2xl shadow-black/3 overflow-hidden group relative flex flex-col"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all -rotate-12 duration-1000 scale-150">
              <PieIcon size={140} className="text-blue-500" />
            </div>

            <div className="relative z-10 mb-10">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tighter uppercase mb-2">
                สัดส่วน <span className="text-blue-600">สถานะ</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest pl-1">
                สรุปภาพรวมการเข้างานรายวัน
              </p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-between gap-12">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <LucideLoader className="animate-spin text-blue-500" size={48} />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                    กำลังประมวลผลข้อมูล...
                  </p>
                </div>
              ) : (
                <div className="h-64 relative transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-zinc-800 transition-colors duration-500" />
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        innerRadius={78}
                        outerRadius={105}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        animationBegin={600}
                        animationDuration={1500}
                      >
                        {data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="focus:outline-none hover:opacity-85 transition-opacity cursor-pointer shadow-xl"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          borderRadius: "20px",
                          border: "none",
                          backdropFilter: "blur(12px)",
                          padding: "16px 20px",
                          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                        }}
                        itemStyle={{
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "900",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      />
                      <CustomPieLabel />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="space-y-6">
                {data.map((d, i) => (
                  <div key={i} className="group/item relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-800"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">
                          {d.value}
                        </span>
                        <div className="h-4 w-px bg-slate-100 dark:bg-zinc-800" />
                        <span className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                          {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: total > 0 ? `${(d.value / total) * 100}%` : "0%",
                        }}
                        transition={{
                          duration: 1.5,
                          ease: [0.34, 1.56, 0.64, 1],
                          delay: 0.8 + i * 0.15,
                        }}
                        className="h-full rounded-full shadow-lg"
                        style={{ backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-emerald-500 group-hover:translate-x-1 transition-transform">
                  <TrendingUp size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    ประสิทธิภาพการทำงานปกติ
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl text-slate-300 dark:text-zinc-600 hover:text-blue-500 transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pt-16 pb-8 text-center border-t border-slate-100 dark:border-zinc-900">
          <p className="text-[10px] text-slate-300 dark:text-zinc-700 font-black uppercase tracking-[0.5em] leading-loose">
            ระบบศูนย์กลางข้อมูล KTL-Hub (Enterprise Edition) <br />© 2026 DATACENTER DEPARTMENT
          </p>
        </div>
      </div>
    </div>
  );
}
