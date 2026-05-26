"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StudentDashboardCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string; // e.g., "from-blue-500 to-blue-600"
  bgColor: string; // e.g., "bg-blue-50"
  iconColor: string; // e.g., "text-blue-600"
  badge?: ReactNode;
  onClick?: () => void;
  isExternal?: boolean;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 100 } },
  hover: { y: -8, transition: { duration: 0.3 } },
};

export default function StudentDashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  bgColor,
  iconColor,
  badge,
  onClick,
  isExternal = false,
}: StudentDashboardCardProps) {
  const cardContent = (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 cursor-pointer"
      variants={cardVariants}
      whileHover="hover"
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between">
          <div
            className={`rounded-lg p-3 ${bgColor} transition-all duration-300 group-hover:scale-110`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
          <div className="ml-auto opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="text-lg font-bold text-gray-400">→</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-gray-950 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>

      {/* Animated bottom border */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-300 group-hover:w-full`}
      ></div>
    </motion.div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick}>
      {cardContent}
    </Link>
  );
}
