import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, ProjectOutlined } from "@ant-design/icons";

export default function Spcs() {
  const responsibilities = [
    "จัดทำแผนปฏิบัติการฝึกอบรมและบริการวิชาชีพร่วมกับแผนกวิชาและงานที่เกี่ยวข้อง",
    "ดำเนินโครงการตามพระราชดำริ เช่น โครงงานฝึกอบรมวิชาชีพในโรงเรียน ตชด.",
    "ดำเนินโครงการฝึกอบรมและให้บริการวิชาชีพแก่ชุมชน เช่น ๑๐๘ อาชีพ",
    "ดำเนินโครงการฝึกอบรมและบริการวิชาชีพเคลื่อนที่ร่วมกับหน่วยงานอื่นๆ",
    "จัดกิจกรรมและให้บริการที่ตอบสนองต่อชุมชนตามนโยบาย (Fix it Center)",
    "บริการอาชีวศึกษาร่วมด้วยช่วยประชาชน ในกรณีเหตุเร่งด่วนหรือภัยพิบัติ",
    "เผยแพร่องค์ความรู้และทักษะวิชาชีพแก่ประชาชนเพื่อการมีงานทำ",
    "ดำเนินงานประสานงานป้องกันและปราบปรามสารเสพติด",
    "ส่งเสริมเผยแพร่ความรู้และเสนอแนวทางประกอบอาชีพผ่านสื่อต่างๆ",
    "ติดตามประเมินผลการฝึกอบรมและประสานความร่วมมือกับผู้เกี่ยวข้อง",
    "จัดทำปฏิทินปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงาน",
    "ดูแลและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <ProjectOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-indigo-100 hover:bg-indigo-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-indigo-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-indigo-500" />
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
