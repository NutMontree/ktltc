"use client";

import { motion } from "framer-motion";
import {
  GlobalOutlined,
  UsergroupAddOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

export default function CW() {
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

  // ข้อมูลหน้าที่ความรับผิดชอบ
  const responsibilities = [
    "ประสานความร่วมมือและดำเนินกิจกรรมต่างๆ ของสถานศึกษา ประสานความร่วมมือกับต่างประเทศและความช่วยเหลือจากภายนอกในการร่วมลงทุนเพื่อการศึกษา",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
  ];

  return (
    <section className="bg-slate-50 py-12 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400">
            <GlobalOutlined /> Collaboration Work
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl leading-tight">
            งานความร่วมมือ <br className="md:hidden" />
            <span className="bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              และเครือข่าย
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <UsergroupAddOutlined className="text-2xl" />
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
