"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";
import Mechanic from "../mechanic/page";
import Machine from "../machine/page";
import Welder from "../welder/page";
import Electricity from "../electricity/page";
import Electronics from "../electronics/page";
import Technique from "../technique/page";
import Construct from "../construct/page";
import Accounting from "../accounting/page";
import Marketing from "../marketing/page";
import Technology from "../technology/page";
import Hotel from "../hotel/page";
import Ordinary from "../ordinary/page";
import PersonnelInformation from "./PersonnelInformation";
import ExecutiveBoard from "../executiveboard/page";

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
            <ExecutiveBoard />
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
            <Machine />
          </AccordionItem>
          <AccordionItem
            key="4"
            aria-label="Accordion 4"
            title="แผนกวิชาช่างเชื่อมโลหะ"
          >
            <Welder />
          </AccordionItem>
          <AccordionItem
            key="5"
            aria-label="Accordion 5"
            title="แผนกวิชาช่างไฟฟ้ากำลัง"
          >
            <Electricity />
          </AccordionItem>
          <AccordionItem
            key="6"
            aria-label="Accordion 6"
            title="แผนกวิชาช่างอิเล็กทรอนิกส์"
          >
            <Electronics />
          </AccordionItem>
          <AccordionItem
            key="7"
            aria-label="Accordion 7"
            title="แผนกวิชาช่างเทคนิคพื้นฐาน"
          >
            <Technique />
          </AccordionItem>
          <AccordionItem
            key="8"
            aria-label="Accordion 8"
            title="แผนกวิชาช่างก่อสร้าง"
          >
            <Construct />
          </AccordionItem>
          <AccordionItem
            key="9"
            aria-label="Accordion 9"
            title="แผนกวิชาการบัญชี"
          >
            <Accounting />
          </AccordionItem>
          <AccordionItem
            key="10"
            aria-label="Accordion 10"
            title="แผนกวิชาการตลาด"
          >
            <Marketing />
          </AccordionItem>
          <AccordionItem
            key="11"
            aria-label="Accordion 11"
            title="แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล"
          >
            <Technology />
          </AccordionItem>
          <AccordionItem
            key="12"
            aria-label="Accordion 12"
            title="แผนกวิชาการโรงแรม"
          >
            <Hotel />
          </AccordionItem>
          <AccordionItem
            key="13"
            aria-label="Accordion 13"
            title="แผนกวิชาสามัญสัมพันธ์"
          >
            <Ordinary />
          </AccordionItem>
        </Accordion>
      </div>

      <PersonnelInformation />
    </>
  );
}
