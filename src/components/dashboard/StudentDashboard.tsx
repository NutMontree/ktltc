"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, BookOpen, MessageSquare } from "lucide-react";

interface StudentDashboardProps {
  className?: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 100 } },
};

export default function StudentDashboard({ className = "" }: StudentDashboardProps) {
  const dashboardItems = [
    {
      id: "flagpole",
      title: "เช็คชื่อเข้าแถว",
      description: "ระบบเช็คชื่อและแถวแปดริ้ว",
      icon: CheckCircle2,
      href: "/student/flagpole",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "dve",
      title: "ศูนย์การศึกษาระบบทวิภาคี",
      description: "DVE Portal สำหรับนักศึกษา",
      icon: BookOpen,
      href: "/dashboard/dve/student",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: "chat",
      title: "กล่องข้อความ",
      description: "ติดต่อและแชทกับอื่นๆ",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
                  className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-gray-300 hover:shadow-xl ${dashItem.bgColor}`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${dashItem.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Icon */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`rounded-lg p-3 ${dashItem.bgColor} transition-all duration-300 group-hover:scale-110`}
                      >
                        <Icon className={`h-6 w-6 ${dashItem.iconColor}`} />
                      </div>
                      <div className="opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="text-sm font-semibold text-gray-600">→</div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-gray-950">
                      {dashItem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{dashItem.description}</p>
                  </div>

                  {/* Animated bottom border */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${dashItem.color} transition-all duration-300 group-hover:w-full`}
                  ></div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
