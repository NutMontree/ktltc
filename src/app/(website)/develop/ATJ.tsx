import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, UserOutlined } from "@ant-design/icons";

export default function ATJ() {
  const responsibilities = [
    "เสนอแต่งตั้งครูที่ปรึกษาเพื่อรับผิดชอบดูแลนักเรียนนักศึกษาในแต่ละกลุ่ม",
    "ควบคุมดูแล ส่งเสริม การจัดทำ จัดเก็บ รวบรวมข้อมูลประวัติ ข้อมูลการเรียน และพฤติกรรม",
    "ส่งเสริม ประสานงานครูที่ปรึกษาให้คำปรึกษาแนะนำเกี่ยวกับการเข้าร่วมกิจกรรมต่างๆ",
    "ประสานงานการลงทะเบียนเรียน การเทียบโอน ความรู้และประสบการณ์ และการถอนรายวิชา",
    "ติดตาม แนะนำ ให้คำปรึกษาเกี่ยวกับการเรียน และการคำนวณค่าระดับคะแนนเฉลี่ย",
    "ประสานกับครู แผนกวิชา และงานที่เกี่ยวข้องในการแก้ปัญหาต่างๆ ของนักเรียนนักศึกษา",
    "ติดตามและประเมินผลการปฏิบัติงานของครูที่ปรึกษา และสรุปผลเสนอฝ่ายบริหาร",
    "จัดทำปฏิทินปฏิบัติงาน และเครื่องมือแบบฟอร์มที่เกี่ยวข้องกับระบบครูที่ปรึกษา",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
            <UserOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-teal-100 hover:bg-teal-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-teal-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-teal-500" />
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
