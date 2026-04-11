import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, FlagOutlined } from "@ant-design/icons";

export default function SA() {
  const responsibilities = [
    "ส่งเสริมและสนับสนุนการจัดตั้งกิจกรรมชมรมต่างๆ ขึ้นภายในสถานศึกษาตามระเบียบที่เกี่ยวข้อง",
    "ดำเนินการจัดตั้งและควบคุมดูแลองค์การวิชาชีพต่างๆ ขึ้นในสถานศึกษา เช่น อกท., อชท., อคท., อธท., อศท.",
    "จัดดำเนินกิจกรรมที่เป็นประโยชน์แก่สถานศึกษา สังคง ชุมชน และกิจกรรมในวันสำคัญต่างๆ",
    "จัดกิจกรรมส่งเสริมคุณธรรม จริยธรรม และจรรยาบรรณในวิชาชีพ ตามนโยบายคุณธรรมพื้นฐาน",
    "ควบคุมดูแลกิจกรรมลูกเสือ เนตรนารีวิสามัญและนักศึกษาวิชาทหาร",
    "ส่งเสริมการกีฬาและนันทนาการ และศิลปวัฒนธรรมในสถานศึกษา",
    "ควบคุมการดำเนินการให้มีการจัดกิจกรรมหน้าเสาธง",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "สรุปผลการประเมินและนำผลการประเมินเสนอฝ่ายบริหาร",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงาน",
    "ดูแลบำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <FlagOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
        </div>

        <div className="space-y-4">
          {responsibilities.map((text, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-orange-100 hover:bg-orange-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-orange-900"
            >
              <div className="shrink-0 pt-1">
                <CheckCircleFilled className="text-lg text-orange-500" />
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
