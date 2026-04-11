"use client";

import { motion } from "framer-motion";
import {
  ShopOutlined,
  GoldOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

export default function TABPW() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // ข้อมูลหน้าที่ความรับผิดชอบ (ปรับให้ตรงกับงานส่งเสริมผลิตผลการค้าฯ)
  const responsibilities = [
    "ส่งเสริมให้ครู นักเรียน นักศึกษา และบุคลากรในสถานศึกษา ดำเนินงานส่งเสริมผลิตผล จัดทำแผนธุรกิจร่วมกับหน่วยงานภาครัฐและเอกชน",
    "ส่งเสริมการทำธุรกิจแบบอิสระของผู้เรียน และการประกอบธุรกิจต่างๆ ของสถานศึกษา",
    "ดำเนินการจำหน่ายผลิตผล ผลิตภัณฑ์ และให้บริการบริการวิชาชีพที่เกิดจากการเรียนการสอน",
    "บริหารจัดการและดูแลกิจการร้านค้าสวัสดิการ ร้านกาแฟ หรือศูนย์บ่มเพาะผู้ประกอบการของสถานศึกษา",
    "จัดทำบัญชีรายรับ-รายจ่าย สรุปผลการดำเนินงาน และรายงานผลการปฏิบัติงาน",
    "ดูแล บำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
  ];

  return (
    <section className="bg-slate-50 py-12 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <ShopOutlined /> Trade & Business Promotion
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl leading-tight">
            งานส่งเสริมผลิตผล <br className="md:hidden" />
            <span className="bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              การค้าและประกอบธุรกิจ
            </span>
          </h1>
        </motion.div>

        {/* --- Main Content --- */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <GoldOutlined className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                ขอบข่ายหน้าที่และความรับผิดชอบ
              </h2>
            </div>

            <div className="space-y-4">
              {responsibilities.map((text, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-amber-100 hover:bg-amber-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-amber-900"
                >
                  <div className="shrink-0 pt-1">
                    <CheckCircleFilled className="text-lg text-amber-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
