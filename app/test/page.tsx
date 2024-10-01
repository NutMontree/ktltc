"use client"; // top to the file

import React from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

export default function TestPage() {
  return (
    <>
      <div>Test Page</div>

      <AnimatedTooltipPreview />
    </>
  );
}

const people = [
  {
    id: 1,
    name: "admin",
    designation: "Software Engineer ",
    image: "/images/admin.webp",
  },
  {
    id: 2,
    name: "admin",
    designation: "Product Manager",
    image: "/images/admin.webp",
  },
  {
    id: 3,
    name: "admin",
    designation: "Data Scientist",
    image: "/images/admin.webp",
  },
];

export function AnimatedTooltipPreview() {
  return (
    <>
      <div className="flex flex-row items-center justify-center   ">
        <AnimatedTooltip items={people} />
      </div>
      <div className="flex flex-row items-center justify-center   ">
        <AnimatedTooltip items={people} />
      </div>
    </>
  );
}
