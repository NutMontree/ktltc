import React from "react";
import { Button } from "@heroui/react";
import { ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";

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

  return (
    <div className="py-6 text-base sm:text-lg">
      <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
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
            className="font-bold"
          >
            เข้าสู่หน้าศูนย์ราชการสะดวก
          </Button>
        </Link>
      </div>

      <p className="text-xl font-bold mb-4">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
      <div className="space-y-4">
        {responsibilities.map((text, index) => (
          <p key={index}>{index + 1}. {text}</p>
        ))}
      </div>
    </div>
  );
}
