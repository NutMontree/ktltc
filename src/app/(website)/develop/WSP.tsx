import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, SafetyOutlined } from "@ant-design/icons";

export default function WSP() {
  const responsibilities = [
    "จัดทำมาตรฐานการป้องกันและแก้ไขปัญหายาเสพติด รวมถึงการสร้างความรู้ความเข้าใจเกี่ยวกับโทษและพิษภัย",
    "จัดกิจกรรมเพื่อสร้างความตระหนักและส่งเสริมความรู้เกี่ยวกับโทษและพิษภัยของยาเสพติดและอบายมุข",
    "ส่งเสริมความร่วมมือระหว่างครู อาจารย์ นักเรียน ผู้ปกครอง และชุมชน ในการป้องกันและแก้ไขปัญหา",
    "สร้างและพัฒนาเครือข่ายกับหน่วยงานภายนอก เพื่อการป้องกันและแก้ไขปัญหายาเสพติดอย่างยั่งยืน",
    "ติดตามและประเมินผลการดำเนินงานโครงการสถานศึกษาสีขาวอย่างต่อเนื่อง",
    "จัดทำรายงานผลการดำเนินงานเสนอต่อต้นสังกัดและหน่วยงานที่เกี่ยวข้อง",
    "ปฏิบัติงานอื่น ๆ ที่ได้รับมอบหมาย",
  ];

  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className="py-6 text-base sm:text-lg">
      <motion.div
        variants={containerVar}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <SafetyOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-green-100 hover:bg-green-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-green-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-green-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
