import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Settings } from "lucide-react";
import { useDashboard } from "./DashboardContext";

export function StatCard({ label, value, icon: Icon, color, unit, variants, onClick }: any) {
  const colors: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  const glows: any = {
    blue: "group-hover:shadow-blue-500/20",
    purple: "group-hover:shadow-purple-500/20",
    amber: "group-hover:shadow-amber-500/20",
    pink: "group-hover:shadow-pink-500/20",
    emerald: "group-hover:shadow-emerald-500/20",
    indigo: "group-hover:shadow-indigo-500/20",
    orange: "group-hover:shadow-orange-500/20",
  };

  return (
    <motion.div
      variants={variants}
      onClick={onClick}
      className={`group relative p-6 rounded-[2.5rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-2 border-zinc-100 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/30 ${glows[color]} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex justify-between items-start mb-5">
        <div
          className={`p-3.5 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {value.toLocaleString()}
          </h3>
          {unit && (
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {unit}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function UsageCard({
  title,
  value,
  max,
  unit,
  icon: Icon,
  color,
  variants,
  isSuperAdmin,
  onEdit,
  serverTotalMB = 0,
  serverUsedMB = 0,
  serverAvailableMB = 0,
}: any) {
  const isUnlimited = max <= 0;
  const displayValue = isUnlimited ? serverUsedMB : value;
  const effectiveMax = isUnlimited ? serverTotalMB || 1 : max;
  const percentage = Math.min((parseFloat(displayValue) / effectiveMax) * 100, 100);
  const colorClass =
    color === "emerald" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-blue-600 shadow-blue-600/50";
  const iconColor = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  const bgColor = color === "emerald" ? "bg-emerald-500/10" : "bg-blue-500/10";

  return (
    <motion.div
      variants={variants}
      className="group relative p-6 rounded-[3rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:border-blue-500/30 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${bgColor} ${iconColor} shadow-inner`}>
              <Icon size={20} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-blue-500 hover:border-blue-500/50 transition-all"
              >
                <Settings size={14} />
              </button>
            )}
            <div className={`px-3 py-1 rounded-full ${bgColor} ${iconColor} text-xs font-black`}>
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {parseFloat(value).toLocaleString()}
            </h4>
            <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">
              {unit}
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest leading-relaxed">
              {isUnlimited
                ? `การใช้งานระบบ: ${(serverUsedMB / 1024).toFixed(1)}GB จากทั้งหมด ${(serverTotalMB / 1024).toFixed(1)}GB`
                : `การจัดสรรโควตา: ${((parseFloat(value) / max) * 100).toFixed(1)}% ของความจุ ${(max / 1024).toFixed(1)}GB`}
            </p>
          </div>
        </div>

        <div className="h-3 w-full bg-zinc-200/50 dark:bg-zinc-900 rounded-full p-1 border border-zinc-200/60 dark:border-zinc-800/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 2, ease: "circOut" }}
            className={`h-full ${colorClass} rounded-full shadow-[0_0_15px]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ActionCard({ href, title, icon: Icon, desc, external, badge, variants }: any) {
  const { searchQuery } = useDashboard();
  const gradients: any = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-pink-700",
    "from-emerald-600 to-teal-700",
    "from-orange-600 to-red-700",
    "from-sky-600 to-blue-700",
    "from-zinc-800 to-black",
  ];
  const colorIdx = title.length % gradients.length;

  if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase()) && !(desc || "").toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <motion.div variants={variants}>
      <Link
        href={href}
        target={external ? "_blank" : "_self"}
        className="group relative flex flex-col h-full p-px rounded-[2.5rem] bg-zinc-200 dark:bg-zinc-800 hover:bg-linear-to-br hover:from-blue-500 hover:to-indigo-600 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
      >
        <div className="relative flex flex-col h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-7 rounded-[2.45rem] overflow-hidden transition-colors group-hover:bg-white/95 dark:group-hover:bg-zinc-950/95 border border-white/50 dark:border-zinc-800/50">
          {badge && (
            <div className="absolute top-5 right-5 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-rose-500/30 z-10 animate-bounce">
              {badge}
            </div>
          )}

          <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <Icon size={120} />
          </div>

          <div
            className={`w-14 h-14 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-linear-to-br ${gradients[colorIdx]} group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}
          >
            <Icon size={24} />
          </div>

          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2 truncate">
            {title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-snug mb-6">
            {desc}
          </p>

          <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
            เข้าสู่ระบบจัดการ <ArrowUpRight size={14} strokeWidth={3} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
