"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Developing from "./Developing";
import SA from "./Sa";
import Space from "./Spcs";
import ATJ from "./ATJ";
import AW from "./AW";
import CGAE from "./CGAE";
import SWW from "./SWW";
import VEMI from "./VEMI";
import WSP from "./WSP";


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
          <AccordionItem key="4" aria-label="4" title="งานครูที่ปรึกษา">
            <ATJ />
          </AccordionItem>
          <AccordionItem key="5" aria-label="5" title="งานปกครอง">
            <AW />
          </AccordionItem>
          <AccordionItem key="6" aria-label="6" title="งานแนะแนวอาชีพและการจัดหางาน">
            <CGAE />
          </AccordionItem>
          <AccordionItem key="7" aria-label="7" title="งานสวัสดิการนักเรียนนักศึกษา">
            <SWW />
          </AccordionItem>
          <AccordionItem key="8" aria-label="8" title="งานสถานศึกษาคุณธรรมอาชีวศึกษา">
            <VEMI />
          </AccordionItem>
          <AccordionItem key="9" aria-label="9" title="งานโครงการสถานศึกษาสีขาว">
            <WSP />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
