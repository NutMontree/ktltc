"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StudentDashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StudentDashboardSection({
  title,
  subtitle,
  icon,
  className = "",
}: StudentDashboardSectionProps) {
  return (
    <motion.div
      className={`mb-8 flex flex-col gap-2 ${className}`}
      variants={titleVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-3xl">{icon}</div>}
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h2>
      </div>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </motion.div>
  );
}
