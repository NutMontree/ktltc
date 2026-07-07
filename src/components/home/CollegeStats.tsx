"use client";

import { motion, Variants } from "framer-motion";
import { FiGrid, FiBriefcase, FiBookOpen, FiUsers, FiUserCheck } from "react-icons/fi";

export interface StatItem {
  id?: number | string;
  _id?: string;
  number: string;
  title: string;
  desc: string;
  icon: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

function getIcon(iconName: string) {
  switch (iconName) {
    case "FiGrid": return <FiGrid className="w-8 h-8 text-orange-500" />;
    case "FiBriefcase": return <FiBriefcase className="w-8 h-8 text-orange-500" />;
    case "FiBookOpen": return <FiBookOpen className="w-8 h-8 text-orange-500" />;
    case "FiUsers": return <FiUsers className="w-8 h-8 text-orange-500" />;
    case "FiUserCheck": return <FiUserCheck className="w-8 h-8 text-orange-500" />;
    default: return <FiGrid className="w-8 h-8 text-orange-500" />;
  }
}

export default function CollegeStats({ statsData = [] }: { statsData?: StatItem[] }) {
  if (!statsData || statsData.length === 0) return null;
  return (
    <section className="py-16">
      <div className="max-w-[1400px] mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {statsData.map((stat) => (
            <motion.div
              key={stat.id || stat._id}
              variants={itemVariants}
              className="group relative bg-white dark:bg-zinc-900 rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-transparent hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
            >
              {/* Icon Container */}
              <div className="w-20 h-20 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {getIcon(stat.icon)}
              </div>

              {/* Number */}
              <h3 className="text-4xl md:text-5xl font-black text-orange-500 mb-2">
                {stat.number}
              </h3>

              {/* Title */}
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                {stat.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                {stat.desc}
              </p>

              {/* Progress Bar (Bottom Line) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full w-full bg-orange-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
