import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, BookOutlined } from "@ant-design/icons";

export default function CDW() {
  const responsibilities = [
    "จัดทำ รวบรวมและตรวจสอบแผนการเรียนของทุกแผนกวิชาให้ตรงกับโครงสร้างของหลักสูตร",
    "จัดทำตารางสอนตารางเรียนร่วมกับแผนกวิชาต่างๆ และสถานประกอบการที่เกี่ยวข้อง",
    "จัดทำแบบฟอร์มต่างๆ ที่เกี่ยวกับงานหลักสูตรการเรียนการสอน",
    "พัฒนาหลักสูตรการเรียนการสอนสมรรถนะร่วมกับสถานประกอบการและหน่วยงานภายนอกเพื่อจัดรายวิชาและสาขางานให้สอดคล้องกับนโยบาย ความต้องการของตลาดแรงงาน ชุมชน ท้องถิ่น สภาพเศรษฐกิจ และวัฒนธรรม เทคโนโลยีและสิ่งแวดล้อม",
    "จัดหา รวบรวม พัฒนาหลักสูตรที่จัดขึ้นเพื่อความรู้หรือทักษะในการประกอบอาชีพหรือการศึกษาต่อซึ่งจัดขึ้นเป็นโครงการหรือกลุ่มเป้าหมายเฉพาะ",
    "ส่งเสริมสนับสนุนให้ครูและผู้สอนในสถานศึกษาได้มีความรู้ความเข้าใจในหลักการ จุดหมายและหลักเกณฑ์การใช้หลักสูตร ตลอดจนระเบียบการจัดสถานศึกษา",
    "ประสานงานกับแผนกวิชาเกี่ยวกับการจัดการเรียนการสอน ทั้งระบบการเทียบโอนความรู้และประสบการณ์ วิชาชีพและสะสมหน่วยกิต",
    "ส่งเสริมและพัฒนาการเรียนการสอนให้ตรงตามหลักสูตร",
    "ส่งเสริมสนับสนุนให้ครูผู้สอน จัดทำเอกสารประกอบการสอน และจัดการเรียนการสอน สื่อเทคโนโลยีการสอนที่ทันสมัย",
    "รวบรวมเผยแพร่ผลงานวิชาการที่มีคุณค่าต่อการจัดการเรียนการสอนเพื่อประโยชน์ทางการศึกษา",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
            <BookOutlined className="text-2xl" />
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
