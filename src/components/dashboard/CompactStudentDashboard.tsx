"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, BookOpen, MessageSquare } from "lucide-react";

interface CompactStudentDashboardProps {
  className?: string;
  columns?: 1 | 2 | 3;
}

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
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function CompactStudentDashboard({
  className = "",
  columns = 3,
}: CompactStudentDashboardProps) {
  const dashboardItems = [
    {
      id: "flagpole",
      title: "เช็คชื่อเข้าแถว",
      icon: CheckCircle2,
      href: "/student/flagpole",
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      hoverBg: "hover:from-blue-100 hover:to-blue-200",
    },
    {
      id: "dve",
      title: "ศูนย์การศึกษา DVE",
      icon: BookOpen,
      href: "/dashboard/dve/student",
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      hoverBg: "hover:from-purple-100 hover:to-purple-200",
    },
    {
      id: "chat",
      title: "กล่องข้อความ",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "text-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      hoverBg: "hover:from-emerald-100 hover:to-emerald-200",
    },
  ];

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <motion.div
      className={`grid gap-4 ${gridColsClass[columns]} ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {dashboardItems.map((dashItem) => {
        const Icon = dashItem.icon;
        return (
          <motion.div key={dashItem.id} variants={item}>
            <Link href={dashItem.href}>
              <div
                className={`group bg-gradient-to-br ${dashItem.bgGradient} ${dashItem.hoverBg} rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-lg bg-white p-2 transition-transform group-hover:scale-110">
                    <Icon className={`h-6 w-6 ${dashItem.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-950">
                      {dashItem.title}
                    </h3>
                  </div>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-lg font-semibold text-gray-400">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
