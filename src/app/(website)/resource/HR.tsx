import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, UsergroupAddOutlined } from "@ant-design/icons";
import PaPage from "../pa/page";

export default function HRD() {
  const responsibilities = [
    "แนะนำ เผยแพร่ และดำเนินการเกี่ยวกับการบริหารงานบุคลากรในสถานศึกษาให้เป็นไปตามระเบียบของทางราชการ",
    "จัดทำแผนอัตรากำลังบุคลากรในสถานศึกษา",
    "จัดทำแผนและดำเนินการพัฒนาบุคลากรในสถานศึกษา",
    "ควบคุม จัดทำสถิติ และรายงานเกี่ยวกับการลงเวลาปฏิบัติราชการและการลาของบุคลากรในสถานศึกษา",
    "ดำเนินการเกี่ยวกับการขอเครื่องราชอิสริยาภรณ์ การจัดทำทะเบียนประวัติของบุคลากรในสถานศึกษา",
    "ให้คำแนะนำ อำนวยความสะดวกแก่บุคลากรในสถานศึกษาในด้านต่างๆ เช่น การขอมีบัตรประจำตัวเจ้าหน้าที่ของรัฐ การขอแก้ไขทะเบียนประวัติ การขอเปลี่ยนตำแหน่ง การขอมีและขอเลื่อนวิทยฐานะ การออกหนังสือรับรอง การขอรับเงินบำเหน็จบำนาญ เงินทดแทนและการจัดทำสมุดบันทึกผลงาน และคุณงามความดีของบุคลากรในสถานศึกษา",
    "การดำเนินการทางวินัยของบุคลากรในสถานศึกษา",
    "การจัดสวัสดิการภายในให้แก่บุคลากรในสถานศึกษา",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินปฏิบัติงานเสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแลบำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <UsergroupAddOutlined className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ขอบข่ายหน้าที่และความรับผิดชอบ</h2>
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
      </motion.div>
      
      <div className="mt-12 border-t border-slate-200 pt-8 dark:border-zinc-800">
        <PaPage />
      </div>
    </div>
  );
}
