"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StudentNavButtonProps {
  label: string;
  icon: LucideIcon;
  href: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isExternal?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  className?: string;
}

const buttonVariants = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
  secondary: "bg-blue-100 text-blue-900 hover:bg-blue-200 shadow-sm hover:shadow-md",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700",
};

const motionVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

export default function StudentNavButton({
  label,
  icon: Icon,
  href,
  variant = "primary",
  size = "md",
  isExternal = false,
  onClick,
  badge,
  className = "",
}: StudentNavButtonProps) {
  const buttonContent = (
    <motion.button
      className={`group relative inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-300 ${buttonVariants[size]} ${variantClasses[variant]} ${className}`}
      variants={motionVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      <span>{label}</span>
      {badge && (
        <span className="absolute top-0 right-0 flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white w-5 h-5 -translate-y-1/2 translate-x-1/2">
          {badge}
        </span>
      )}
    </motion.button>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {buttonContent}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick}>
      {buttonContent}
    </Link>
  );
}
