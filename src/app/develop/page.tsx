"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Developing from "./Developing";
import SA from "./Sa";
import Space from "./Spcs";


export default function page() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">
          ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Student Activities Development Division Page
        </h1>
      </div>

      <div className="pt-8">
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="1"
            title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา"
          >
            <Developing />
          </AccordionItem>
          <AccordionItem key="2" aria-label="2" title="งานกิจกรรมนักเรียนนักศึกษา">
            <SA />
          </AccordionItem>
          <AccordionItem key="3" aria-label="3" title="งานโครงการพิเศษและบริการชุมชน">
            <Space />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
