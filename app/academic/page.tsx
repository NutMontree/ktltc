"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Academicing from "./Academic";

export default function Academic() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">
          ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Student Activities Development Division Page
        </h1>
      </div>

      <div className="pt-8">
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา"
          >
            <Academicing />
          </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="ไม่มีข้อมูล">
            {/* <Pressrelease2566 /> */}
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
