"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";
import {
  Newspaper,
  Image as ImageIcon,
  Users,
  Navigation,
  FileText,
  Database,
  Cloud,
  MessageSquare,
  Globe,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";

// Framer Motion Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardLoader() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return;
      try {
        setLoading(true);
        const [statsRes, permRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats?_t=" + Date.now()),
          fetch("/api/auth/permissions")
        ]);

        if (!statsRes.ok) throw new Error("Failed to fetch dashboard statistics");
        const statsData = await statsRes.json();
        setStats(statsData);

        if (permRes.ok) {
          const permData = await permRes.json();
          setPermissions(permData);
        }
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Initializing Executive Dashboard...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            การเข้าถึงโดยไม่ได้รับอนุญาต
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงศูนย์บัญชาการผู้บริหาร
          </p>
        </div>
        <Link
          href="/login"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-amber-500" />
        <p className="text-zinc-500 font-bold italic">
          {error || "Unable to sync dashboard data. Please try again."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 font-black uppercase text-xs hover:underline"
        >
          ระบบรีเฟรช
        </button>
      </div>
    );
  }

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  return (
    <div className="max-w-[1600px] mx-auto bg-transparent transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* --- Statistics Section --- */}
          {((session?.user as any)?.role === "super_admin" || permissions?.manage_users) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-4">
                  Core Infrastructure Telemetry
                  <span className="h-px bg-blue-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  การตรวจสอบความพร้อมของระบบและฐานข้อมูล
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Stat Grid */}
                <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    label="ข่าวสารทั้งหมด"
                    value={stats.totalNews}
                    icon={Newspaper}
                    color="blue"
                    variants={item}
                  />
                  <StatCard
                    label="แบนเนอร์ประชาสัมพันธ์"
                    value={stats.totalBanners}
                    icon={ImageIcon}
                    color="pink"
                    variants={item}
                  />
                  <StatCard
                    label="User ในระบบ"
                    value={stats.totalUsers}
                    icon={Users}
                    color="emerald"
                    variants={item}
                  />
                  <StatCard
                    label="โครงสร้างเมนู"
                    value={stats.totalNav}
                    icon={Navigation}
                    color="purple"
                    variants={item}
                  />
                  <StatCard
                    label="หน้าเนื้อเมนู"
                    value={stats.totalPages}
                    icon={FileText}
                    color="amber"
                    variants={item}
                  />
                  <StatCard
                    label="จำนวนรูปภาพในระบบ"
                    value={stats.totalImagesCount}
                    icon={Layers}
                    color="indigo"
                    unit=" ไฟล์"
                    variants={item}
                  />
                </div>

                {/* Usage Cards */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  <UsageCard
                    title="MongoDB"
                    value={stats.dbSizeMB}
                    max={512}
                    unit="MB"
                    icon={Database}
                    color="emerald"
                    variants={item}
                  />
                  <UsageCard
                    title="Local Storage"
                    value={stats.cloudUsageMB}
                    max={stats.cloudLimitMB}
                    unit="MB"
                    icon={Database}
                    color="blue"
                    variants={item}
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- Quick Actions Section --- */}
          <div>
            <motion.div variants={item} className="mb-8 flex flex-col gap-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 flex items-center gap-4">
                Administrative Operations
                <span className="h-px bg-indigo-500/10 flex-1" />
              </h2>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                การจัดการและบริหารข้อมูลเว็บไซต์
              </span>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {permissions?.manage_news && (
                <ActionCard
                  href="/dashboard/news"
                  title="จัดการส่วนข่าว"
                  icon={Newspaper}
                  desc="Manage all news & activities"
                  variants={item}
                />
              )}
              {(session?.user as any)?.role === "super_admin" && (
                <ActionCard
                  href="/dashboard/manage-home"
                  title="จัดการหน้าแรก"
                  icon={Globe}
                  desc="Hero sections & Visibility"
                  variants={item}
                />
              )}
              {(session?.user as any)?.role === "super_admin" && (
                <ActionCard
                  href="/dashboard/navbar"
                  title="จัดการเมนูหลัก"
                  icon={Navigation}
                  desc="Website navigation tree"
                  variants={item}
                />
              )}
              {permissions?.manage_pages && (
                <ActionCard
                  href="/dashboard/pages"
                  title="จัดการเนื้อหาหน้า"
                  icon={FileText}
                  desc="Independent page builder"
                  variants={item}
                />
              )}
              {permissions?.manage_qa && (
                <ActionCard
                  href="/dashboard/questions"
                  title="ระบบถาม-ตอบ"
                  icon={MessageSquare}
                  desc="User Q&A & Support"
                  badge={stats.totalPendingQA > 0 ? stats.totalPendingQA : null}
                  variants={item}
                />
              )}
              <ActionCard
                href="/"
                title="เข้าสู่หน้าหลัก"
                icon={ArrowUpRight}
                desc="View production site"
                external
                variants={item}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700">
            KTL Management System • Core v2026.03
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// --- Premium Sub-Components ---

function StatCard({ label, value, icon: Icon, color, unit, variants }: any) {
  const colors: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-500/5 dark:bg-pink-500/10 border-pink-500/20",
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20",
    indigo:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20",
  };

  const glow: any = {
    blue: "group-hover:shadow-blue-500/20",
    purple: "group-hover:shadow-purple-500/20",
    amber: "group-hover:shadow-amber-500/20",
    pink: "group-hover:shadow-pink-500/20",
    emerald: "group-hover:shadow-emerald-500/20",
    indigo: "group-hover:shadow-indigo-500/20",
  };

  return (
    <motion.div
      variants={variants}
      className={`group relative p-6 rounded-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${glow[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {value.toLocaleString()}
          </h3>
          {unit && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase">
              {unit}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function UsageCard({
  title,
  value,
  max,
  unit,
  icon: Icon,
  color,
  variants,
}: any) {
  const percentage = Math.min((parseFloat(value) / max) * 100, 100);
  const colorClass =
    color === "emerald"
      ? "bg-emerald-500 shadow-emerald-500/40"
      : "bg-blue-500 shadow-blue-500/40";
  const iconColor = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  const bgColor = color === "emerald" ? "bg-emerald-500/5" : "bg-blue-500/5";

  return (
    <motion.div
      variants={variants}
      className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${bgColor} ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {title}
            </span>
          </div>
          <span className={`text-sm font-black ${iconColor}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="mb-4">
          <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
            {value}
            <span className="text-sm text-zinc-400 font-bold ml-1.5">
              {unit}
            </span>
          </p>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mt-2 uppercase tracking-wide">
            ที่เหลืออยู่: {(max - parseFloat(value)).toFixed(2)} {unit}
          </p>
        </div>

        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-[2px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
            className={`h-full ${colorClass} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({
  href,
  title,
  icon: Icon,
  desc,
  external,
  badge,
  variants,
}: any) {
  return (
    <motion.div variants={variants}>
      <Link
        href={href}
        target={external ? "_blank" : "_self"}
        className="group relative flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-4xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
      >
        {badge && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-rose-500/30 animate-bounce">
            {badge}
          </div>
        )}
        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-1 truncate">
          {title}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-tight leading-none mb-4">
          {desc}
        </p>
        <div className="mt-auto pt-2 flex items-center text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Launch Module <ArrowUpRight className="w-3 h-3 ml-1" />
        </div>
      </Link>
    </motion.div>
  );
}
