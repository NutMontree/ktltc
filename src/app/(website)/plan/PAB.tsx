"use client";

import { motion } from "framer-motion";
import {
  FundProjectionScreenOutlined,
  ContainerFilled,
  CheckCircleFilled,
} from "@ant-design/icons";

export default function PAB() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // const itemVar = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  // };

  const responsibilities = [
    "จัดทำแผนปฏิบัติราชการ แผนพัฒนาสถานศึกษา และแผนปฏิบัติการประจำปีตามนโยบายให้สอดคล้องกับแผนระดับชาติและนโยบายต้นสังกัด",
    "จัดทำข้อมูลแผนการรับนักเรียน นักศึกษา การยุบ ขยาย และเพิ่มประเภทวิชา สาขาวิชาเปิดสอน ให้สอดคล้องกับความต้องการของตลาดแรงงาน",
    "ตรวจสอบและควบคุมการใช้จ่ายเงินงบประมาณ เงินนอกงบประมาณให้เป็นไปตามแผน และดำเนินการปรับแผนการใช้จ่ายเงิน",
    "รวบรวมแผนการใช้จ่ายเงินงบประมาณ เงินนอกงบประมาณ (ค่าวัสดุฝึก) และสำรวจความต้องการครุภัณฑ์เพื่อการจัดซื้อจัดจ้าง",
    "วิเคราะห์รายจ่ายของสถานศึกษาเพื่อปรับปรุงการใช้จ่ายให้มีประสิทธิภาพ",
    "จัดทำรายงานสรุปผลการปฏิบัติงานตามตัวชี้วัด การใช้เงินงบประมาณและนอกงบประมาณ เสนอต่อหน่วยงานต้นสังกัดภายในเวลาที่กำหนด",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
    "ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย",
  ];

  return (
    <section className="bg-slate-50 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className=" ">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
            <FundProjectionScreenOutlined /> Planning & Budgeting
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl leading-tight">
            งานวางแผน <br className="md:hidden" />
            <span className="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              และงบประมาณ
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                <ContainerFilled className="text-2xl" />
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
                  className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-teal-100 hover:bg-teal-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-teal-900"
                >
                  <div className="shrink-0 pt-1">
                    <CheckCircleFilled className="text-lg text-teal-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
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
