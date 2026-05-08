

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleFilled, InboxOutlined } from "@ant-design/icons";

export default function PW() {
  const responsibilities = [
    "จัดวางระบบและปฏิบัติงานเกี่ยวกับการจัดหา การซื้อ การจ้าง การควบคุม การเก็บรักษา และการเบิกจ่ายพัสดุและการจำหน่ายพัสดุให้เป็นไปตามระเบียบ",
    "จัดทำทะเบียยนที่ดินและสิ่งก่อสร้างทุกประเภทของสถานศึกษา",
    "จัดวางระบบและควบคุมการใช้ยานพาหนะ การเบิกจ่ายน้ำมันเชื้อเพลิง การบำรุงรักษาและการพัสดุต่างๆ ที่เกี่ยวกับยานพาหนะของสถานศึกษาให้เป็นไปตามระเบียบ",
    "ควบคุมการเบิกจ่ายเงินตามประเภทเงิน ให้เป็นไปตามแผนปฏิบัติการประจำปี",
    "ควบคุม ดูแล ปรับปรุงซ่อมแซมบำรุงรักษาครุภัณฑ์ให้อยู่ในสภาพเรียบร้อยพร้อมใช้",
    "ให้คำแนะนำ ชี้แจงอำนวยความสะดวกแก่บุคลากรในสถานศึกษาเกี่ยวกับงานในหน้าที่",
    "เก็บรักษาเอกสารและหลักฐานต่างๆ ไว้เพื่อการตรวจสอบและดำเนินการทำลายเอกสารตามระเบียบ",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแลบำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
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
            <InboxOutlined className="text-2xl" />
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
    </div>
  );
}
