import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, SafetyCertificateOutlined } from "@ant-design/icons";

export default function AW() {
  const responsibilities = [
    "ปกครองดูแลนักเรียน นักศึกษา ให้อยู่ในระเบียบวินัย ตามที่กำหนดไว้ในกฎหมายและระเบียบที่เกี่ยวข้อง",
    "ประสานงานกับครูที่ปรึกษา แผนกวิชา และหัวหน้างานในการแก้ปัญหาของนักเรียนนักศึกษา",
    "ประสานงานกับพนักงานเจ้าหน้าที่ส่งเสริมความประพฤติและหน่วยงานอื่นที่เกี่ยวข้อง",
    "เสนอแต่งตั้งคณะกรรมการงานปกครอง เพื่อพิจารณาการลงโทษนักเรียน นักศึกษา",
    "พิจารณาเสนอระเบียบว่าด้วยหลักเกณฑ์การตัดคะแนนความประพฤติและการลงโทษ",
    "ประสานงานเพื่อป้องกันและปราบปรามยาเสพติด และป้องกันการก่อความไม่สงบในสถานศึกษา",
    "จัดทำระเบียนนักเรียนนักศึกษาที่ได้รับการพิจารณาตัดคะแนนความประพฤติและลงโทษ",
    "สรุปผลการประเมินและนำผลการประเมินเสนอต่อฝ่ายบริหาร",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงาน",
    "ดูแล บำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
    "ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <SafetyCertificateOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-rose-100 hover:bg-rose-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-rose-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-rose-500" />
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
