"use client";

import { useEffect, useRef } from "react";
import { incrementVisitor } from "@/app/actions";

export default function VisitorTracker() {
  // ใช้ useRef ป้องกันการรันซ้ำซ้อนใน React Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      incrementVisitor(); // เรียก Server Action
      hasRun.current = true;
    }
  }, []);

  return <div style={{ display: "none" }} aria-hidden="true" data-visitor-tracker="true"></div>;
}
