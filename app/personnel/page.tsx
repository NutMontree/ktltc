"use client";
// Personnel;

import { Accordion, AccordionItem } from "@nextui-org/react";
import Executive from "../executive/page";
import Mechanic from "../mechanic/page";

export default function Personnel() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข้อมูลบุคลากร</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Personnel Information
        </h1>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="ผู้บริหารสถานศึกษา"
          >
            <Executive />
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Accordion 2"
            title="แผนกวิชาช่างยนต์"
          >
            <Mechanic />
          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label="Accordion 3"
            title="แผนกวิชาช่างกลโรงงาน"
          >
            <Mechanic />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
