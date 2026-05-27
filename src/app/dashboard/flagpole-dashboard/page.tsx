"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  TrendingUp,
  Map as MapIcon,
  PieChart as PieIcon,
  Loader2 as LucideLoader,
  ListRestart,
  Building2,
  GraduationCap
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import dynamicImport from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// โหลดคอมโพเนนต์แผนที่เฉพาะไคลเอนต์ไซด์ (Client-side only component)
const MapDashboard = dynamicImport(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
      <div className="flex flex-col items-center gap-3">
        <LucideLoader className="animate-spin text-indigo-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">กำลังเรียกข้อมูลแผนที่เสาธง...</p>
      </div>
    </div>
  ),
});

// Animated Number Component
function AnimatedNumber({ value, duration = 0.5 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = value;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        setDisplayValue(Math.round(startValue + (endValue - startValue) * easeProgress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue, duration]);

  return (
    <motion.span
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
        color: isAnimating ? ["#1e293b", "#4f46e5", "#1e293b"] : "#1e293b",
      }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {displayValue}
    </motion.span>
  );
}

// Delta Badge Component
function DeltaBadge({ delta }: { delta: number }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (delta > 0) {
      setShow(true);
      // Hide after 1 minute
      const timer = setTimeout(() => {
        setShow(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [delta]);

  if (delta <= 0 || !show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.5 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-20"
    >
      +{delta}
    </motion.div>
  );
}

export default function StudentFlagpoleDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  });

  const [data, setData] = useState([
    { name: "ตรงเวลา", value: 0, color: "#10b981" }, // Emerald 500
    { name: "มาสาย", value: 0, color: "#f59e0b" }, // Amber 500
    { name: "ขาดแถว", value: 0, color: "#f43f5e" }, // Rose 500
  ]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [trendRange, setTrendRange] = useState<"day" | "week" | "month">("week");
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTotal, setRealTotal] = useState(0);
  const [config, setConfig] = useState({
    lat: 14.754043,
    lng: 104.65807,
    radius: 200
  });
  const [previousData, setPreviousData] = useState([
    { name: "ตรงเวลา", value: 0, color: "#10b981" },
    { name: "มาสาย", value: 0, color: "#f59e0b" },
    { name: "ขาดแถว", value: 0, color: "#f43f5e" },
  ]);
  const [deltas, setDeltas] = useState([0, 0, 0]);

  // การยืนยันสิทธิ์เข้าใช้งานฝั่งแอดมิน
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role?.toLowerCase();
      if (!["super_admin", "admin"].includes(role)) {
        router.replace("/");
      }
    }
  }, [status, session]);

  useEffect(() => {
    async function fetchStats() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch(`/api/admin/flagpole-dashboard?date=${selectedDate}&range=${trendRange}&_t=${Date.now()}`);
        const json = await res.json();
        if (json.success) {
          // Calculate deltas before updating data
          const newDeltas = json.data.map((newItem: any, idx: number) => {
            const oldValue = previousData[idx]?.value || 0;
            const newValue = newItem.value;
            return newValue - oldValue;
          });
          setDeltas(newDeltas);

          // Update previous data
          setPreviousData(json.data);

          setData(json.data);
          setMarkers(json.markers || []);
          setRealTotal(json.totalStudents || 0);
          setRecentCheckIns(json.recentCheckIns || []);
          setTrends(json.trends || []);
          setDepartmentStats(json.departmentStats || []);
          if (json.config) {
            setConfig(json.config);
          }
        }
      } catch (error) {
        console.error("Failed to fetch flagpole stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [selectedDate, trendRange, status, previousData]);

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
          <span>นร. ทั้งหมด</span>
        </text>
      </g>
    );
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 gap-4">
        <LucideLoader className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-6 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative text-left">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-500/20 border border-indigo-400 group hover:rotate-6 transition-transform">
                <Layers size={22} />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                สถิติภาพรวม <span className="text-indigo-600">การเข้าแถวเสาธง</span>
              </h1>
            </div>
            <p className="text-slate-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-[0.25em] pl-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              ระบบวิเคราะห์ข้อมูลนักเรียนนักศึกษา v1.0
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-14 pr-8 py-4 w-full md:w-auto bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl font-black text-sm text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-black/2 hover:shadow-2xl hover:border-slate-200 dark:hover:border-zinc-700 appearance-none cursor-pointer scheme-light-dark"
              />
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "นักเรียนระดับ ปวช.-ปวส. ทั้งหมด",
              val: total,
              unit: "คน",
              icon: Users,
              theme: "indigo",
              delay: 0,
              delta: 0,
            },
            {
              label: "มาเข้าแถวตรงเวลา",
              val: data[0].value,
              unit: "คน",
              icon: Activity,
              theme: "emerald",
              delay: 0.1,
              delta: deltas[0] || 0,
            },
            {
              label: "มาเข้าแถวสาย",
              val: data[1].value,
              unit: "คน",
              icon: Clock,
              theme: "amber",
              delay: 0.2,
              delta: deltas[1] || 0,
            },
            {
              label: "ขาดเข้าแถวในระบบ",
              val: data[2].value,
              unit: "คน",
              icon: AlertTriangle,
              theme: "rose",
              delay: 0.3,
              delta: deltas[2] || 0,
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
                  <div className="relative">
                    <div
                      className={`p-4 bg-${stat.theme}-50 dark:bg-${stat.theme}-500/10 text-${stat.theme}-600 dark:text-${stat.theme}-400 rounded-2xl shadow-sm border border-${stat.theme}-100 dark:border-${stat.theme}-900/30 group-hover:rotate-12 transition-transform`}
                    >
                      <Icon size={24} />
                    </div>
                    <DeltaBadge delta={stat.delta} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-2">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                        <AnimatedNumber value={stat.val} />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl shadow-black/3 overflow-hidden group relative">
              <div className="flex items-center justify-between mb-6 px-2">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    แผนที่ <span className="text-indigo-600">การเช็คพิกัดเสาธง</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">
                    พิกัด GPS ตำแหน่งเช็คชื่อเข้าแถวของนักเรียนยามเช้า
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <MapIcon size={20} />
                </div>
              </div>
              <div className="h-[480px] w-full rounded-3xl overflow-hidden relative border border-slate-100 dark:border-zinc-800 shadow-inner">
                <MapDashboard 
                  markers={markers} 
                  centerLat={config.lat}
                  centerLng={config.lng}
                  radius={config.radius}
                />
              </div>
            </div>

            {/* Trends Section */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/3 group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-1000">
                <TrendingUp size={120} className="text-emerald-500" />
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 relative z-10 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    สถิติย้อนหลัง <span className="text-emerald-500">การเข้าร่วมเสาธง</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">
                    แนวโน้มการเช็คชื่อ ({trendRange === 'day' ? 'รายชั่วโมง' : trendRange === 'week' ? 'ย้อนหลัง 7 วัน' : 'ย้อนหลัง 30 วัน'})
                  </p>
                </div>
                
                <div className="flex bg-slate-50 dark:bg-zinc-800/50 p-1 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  {[
                    { id: "day", label: "วัน" },
                    { id: "week", label: "7 วัน" },
                    { id: "month", label: "เดือน" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setTrendRange(r.id as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        trendRange === r.id
                          ? "bg-white dark:bg-zinc-700 text-emerald-500 shadow-sm"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                    <XAxis 
                      dataKey="_id" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                      tickFormatter={(val) => {
                        if (trendRange === 'day') return `${val}:00`;
                        if (typeof val === 'string' && val.includes('-')) {
                          return val.split("-").slice(1).join("/");
                        }
                        return val;
                      }}
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        borderRadius: "16px", 
                        border: "none",
                        backdropFilter: "blur(10px)",
                        color: "#fff"
                      }}
                      itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                      labelFormatter={(label) => {
                        if (trendRange === 'day') return `เวลา ${label}:00 น.`;
                        return `วันที่ ${label}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPresent)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* Pie Chart Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/3 overflow-hidden group relative flex flex-col"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all -rotate-12 duration-1000 scale-150">
                <PieIcon size={140} className="text-indigo-500" />
              </div>

              <div className="relative z-10 mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight tracking-tight uppercase mb-1">
                  สัดส่วน <span className="text-indigo-600">การร่วมเสาธง</span>
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest">
                  สรุปการเช็คแถวเสาธงวันนี้
                </p>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between gap-8">
                {loading ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-4">
                    <LucideLoader className="animate-spin text-indigo-500" size={32} />
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">กำลังดึงข้อมูล...</p>
                  </div>
                ) : (
                  <div className="h-56 relative transform hover:scale-105 transition-transform duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <CustomPieLabel />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-4">
                  {data.map((d, i) => (
                    <div key={i} className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                            {d.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {d.value} <span className="text-[9px] text-slate-400">({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: total > 0 ? `${(d.value / total) * 100}%` : "0%" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Check-ins */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/3 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    การเช็คแถว <span className="text-rose-500">ล่าสุด</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">
                    การลงเวลาของนักศึกษาล่าสุด 10 คน
                  </p>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <ListRestart size={20} />
                </div>
              </div>

              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {recentCheckIns.length > 0 ? (
                    recentCheckIns.map((item, idx) => {
                      const isInZone = item.statusTag
                        ? item.statusTag.includes("In-Site")
                        : true; // ข้อมูลเก่าไม่มี statusTag ให้ถือว่าอยู่ในพื้นที่
                      return (
                      <motion.div
                        key={item._id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 group/row"
                      >
                        <div className="relative">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-zinc-800" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400 text-xs font-black">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${item.status === 'Late' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                              {item.department}
                            </p>
                            {/* Zone badge */}
                            <span className={`inline-flex items-center text-[8px] font-black px-1.5 py-0.5 rounded-md border ${
                              isInZone
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                                : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30'
                            }`}>
                              {isInZone ? '✅ ในพื้นที่' : '⚠️ นอกพื้นที่'}
                            </span>
                            {item.distance != null && item.distance >= 0 && (
                              <span className="text-[8px] text-slate-400 font-bold">
                                {Math.round(item.distance)}ม.
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-700 dark:text-zinc-300 tabular-nums">
                            {new Date(item.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                            น.
                          </p>
                        </div>
                      </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-10 text-center space-y-3"
                    >
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ไม่มีข้อมูลการลงเวลาเช็คแถว</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Academic Level Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/3 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    สถิติ <span className="text-indigo-500">ระดับชั้นเรียน</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">
                    การเข้าแถวเสาธงแยกตามระดับชั้น
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <GraduationCap size={20} />
                </div>
              </div>

              <div className="space-y-4">
                {departmentStats.map((dept, idx) => (
                  <motion.div
                    key={dept._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (idx * 0.05) }}
                    className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          {dept._id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-800 dark:text-white">
                            {dept.total}
                          </p>
                          <p className="text-[8px] text-slate-400 font-black uppercase">ทั้งหมด</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {dept.present || 0}
                        </p>
                        <p className="text-[8px] text-emerald-600/70 dark:text-emerald-400/70 font-black uppercase">ตรงเวลา</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                          {dept.late || 0}
                        </p>
                        <p className="text-[8px] text-amber-600/70 dark:text-amber-400/70 font-black uppercase">สาย</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                          {dept.inZone || 0}
                        </p>
                        <p className="text-[8px] text-blue-600/70 dark:text-blue-400/70 font-black uppercase">ในพื้นที่</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(dept.total / (departmentStats.reduce((acc: number, d: any) => acc + d.total, 0) || 1)) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.7 + (idx * 0.05) }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="pt-16 pb-8 text-center border-t border-slate-100 dark:border-zinc-900">
          <p className="text-[10px] text-slate-300 dark:text-zinc-700 font-black uppercase tracking-[0.5em] leading-loose">
            ระบบวิเคราะห์การเข้าร่วมกิจกรรมหน้าเสาธง วิทยาลัยเทคนิคกันทรลักษ์ <br />© 2026 KTLTC DATACENTER DEPARTMENT
          </p>
        </div>
      </div>
    </div>
  );
}
