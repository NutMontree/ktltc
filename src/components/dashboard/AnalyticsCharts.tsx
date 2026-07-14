"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Loader2, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 mt-8">
      {/* 1. Daily Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-8 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-blue-500" />
          แนวโน้มผู้เข้าชมเว็บไซต์ (7 วันล่าสุด)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-8 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-500" />
            สัดส่วนอุปกรณ์ (Devices)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-zinc-900 rounded-4xl p-8 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col h-[400px]">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            ผู้เข้าใช้งานล่าสุด (พิกัด & IP)
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {data.latestVisitors.map((v: any, i: number) => (
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
                  <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md inline-block break-all">
                    {v.path || '/'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
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
