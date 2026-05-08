import React from "react";
import { Button } from "@heroui/react";
import { ArrowRightOutlined, CheckCircleFilled, InteractionOutlined } from "@ant-design/icons";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CGCA() {
  const responsibilities = [
    "วางแผนและดำเนินการจัดตั้งศูนย์ราชการสะดวก (GECC) ของสถานศึกษาตามนโยบายของรัฐบาล",
    "อำนวยความสะดวกและให้บริการข้อมูล ข่าวสาร แก่ผู้มาติดต่อราชการในลักษณะจุดบริการเบ็ดเสร็จ (One Stop Service)",
    "ประสานงานกับงานต่างๆ ภายในสถานศึกษาเพื่อให้บริการประชาชนและผู้รับบริการอย่างรวดเร็วและมีประสิทธิภาพ",
    "สำรวจความพึงพอใจและความต้องการของผู้รับบริการเพื่อนำมาปรับปรุงการให้บริการ",
    "จัดทำรายงานการดำเนินงานและผลการให้บริการของศูนย์ราชการสะดวกเสนอต่อผู้บริหารและหน่วยงานที่เกี่ยวข้อง",
    "ดูแลและรักษาภาพลักษณ์การให้บริการที่ทันสมัย สะดวก และเข้าถึงง่าย",
    "ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย",
  ];

  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className="py-6 text-base sm:text-lg">
      <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 shadow-sm">
        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">Government Easy Contact Center (GECC)</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed mb-4">
          ศูนย์ราชการสะดวก เป็นหน่วยงานที่ทำหน้าที่ให้คำแนะนำและอำนวยความสะดวกแก่ประชาชน ให้เกิดความสะดวก รวดเร็ว และเข้าถึงง่าย ตามนโยบายของรัฐบาล
        </p>
        <Link href="/GECC">
          <Button 
            size="sm" 
            color="warning" 
            variant="flat"
            endContent={<ArrowRightOutlined />}
            className="font-bold bg-white dark:bg-zinc-800 shadow-sm border border-amber-200 dark:border-amber-900/50"
          >
            เข้าสู่หน้าศูนย์ราชการสะดวก
          </Button>
        </Link>
      </div>

      <motion.div
        variants={containerVar}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <InteractionOutlined className="text-2xl" />
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
