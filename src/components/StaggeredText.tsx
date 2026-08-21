"use client";

import { motion, Variants } from "framer-motion";
import React from "react";

interface StaggeredTextProps {
  text: string;
  className?: string;
  staggerDuration?: number;
  delay?: number;
}

export default function StaggeredText({
  text,
  className = "",
  staggerDuration = 0.05,
  delay = 0,
}: StaggeredTextProps) {
  const characters = Array.from(text);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          className="inline-block whitespace-pre"
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
