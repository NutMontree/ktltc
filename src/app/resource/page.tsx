"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import StructureResource from "./StructureResource";

import Finance from "./Finance";
import GA from "./GA";
import HR from "./HR";
import AW from "./AW";
import PW from "./PW";
import BASW from "./BASW";
import PRW from "./PRW";
import RW from "./RW";

export default function page() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ฝ่ายบริหารทรัพยากร</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          resource
        </h1>
      </div>

      <div className="py-8">
        <Accordion isCompact>
          <AccordionItem key="1" aria-label="1" title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา">
            <StructureResource />
          </AccordionItem>
          <AccordionItem key="2" aria-label="2" title="งานบริหารงานทั่วไป">
            <GA />
          </AccordionItem>
          <AccordionItem key="3" aria-label="3" title="งานบุคลากร">
            <HR />
          </AccordionItem>
          <AccordionItem key="4" aria-label="4" title="งานการเงิน">
            <Finance />
          </AccordionItem>
          <AccordionItem key="5" aria-label="5" title="งานบัญชี">
            <AW />
          </AccordionItem>
          <AccordionItem key="6" aria-label="6" title="งานพัสดุ">
            <PW />
          </AccordionItem>
          <AccordionItem key="7" aria-label="7" title="งานอาคารและสถานที่">
            <RW />
          </AccordionItem>
          <AccordionItem key="8" aria-label="8" title="งานทะเบียน">
            <BASW />
          </AccordionItem>
          <AccordionItem key="9" aria-label="9" title="งานประชาสัมพันธ์">
            <PRW />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
