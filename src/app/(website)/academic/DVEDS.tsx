import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, TeamOutlined } from "@ant-design/icons";

export default function DVEDS() {
  const responsibilities = [
    "จัดการศึกษาวิชาชีพโดยร่วมมือกับสถานประกอบการ และหน่วยงานภาครัฐและเอกชนเพื่อให้ผู้เรียนสามารถไปประกอบอาชีพได้",
    "จัดทำแผนและคู่มือการฝึกตามโครงสร้างของหลักสูตรร่วมกับสถานประกอบการในการวิเคราะห์จุดประสงค์รายวิชาและมาตรฐานรายวิชาที่จะฝึกอาชีพ",
    "วางแผนร่วมกับสถานประกอบการในการนิเทศ ติดตาม การฝึกปฏิบัติในสถานประกอบการ และมีการวัดผลประเมินผล",
    "ควบคุม กำกับดูแล และการแก้ปัญหาต่างๆ ประชุม สัมมนา ครูฝึก ครูนิเทศ เพื่อร่วมกันวางแผนพัฒนาการจัดการเรียนการสอนอาชีวศึกษาระบบทวิภาคี",
    "ติดต่อประสานงานกับแหล่งงานสถานประกอบการเพื่อการจัดหาที่ฝึกงานให้กับนักเรียน นักศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุง รักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
            <TeamOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-sky-100 hover:bg-sky-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-sky-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-sky-500" />
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
