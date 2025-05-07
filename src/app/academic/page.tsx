"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Academicing from "./Academic";
import DVEDS from "./DVEDS";
import MAEW from "./MAEW";
import TMW from "./TMW";
import CDW from "./CDW";
import ARAL from "./ARAL";

export default function page() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">
          ฝ่ายวิชาการ
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Academic Affairs
        </h1>
      </div>

      <div className="py-8">
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา"
          >
            <Academicing />
          </AccordionItem>
          <AccordionItem key="2" aria-label="2" title="งานอาชีวศึกษาระบบทวิภาคี">
            <DVEDS />
          </AccordionItem>
          <AccordionItem key="3" aria-label="3" title="งานวัดผลและประเมินผล">
            <MAEW />
          </AccordionItem>
          <AccordionItem key="4" aria-label="4" title="งานสื่อการเรียนการสอน">
            <TMW />
          </AccordionItem>
          <AccordionItem key="5" aria-label="5" title="งานพัฒนาหลักสูตรการเรียนการสอน">
            <CDW />
          </AccordionItem>
          <AccordionItem key="6" aria-label="6" title="งานวิทยบริการและห้องสมุด">
            <ARAL />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
