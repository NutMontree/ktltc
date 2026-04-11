"use client";

import { motion } from "framer-motion";
import { ProjectOutlined } from "@ant-design/icons";

export default function Planning() {
  return (
    <section className="font-sans text-slate-800 dark:text-slate-200">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-12 text-center bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-700"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <ProjectOutlined /> Planning & Cooperation Overview
          </div>
          <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-lg mx-auto">
            แผนภูมิโครงสร้างการบริหารงานฝ่ายแผนงานและความร่วมมือ
            อยู่ในระหว่างการปรับปรุงข้อมูลให้เป็นปัจจุบัน
          </p>
        </motion.div>
      </div>
    </section>
  );
}
