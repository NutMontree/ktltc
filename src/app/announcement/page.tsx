"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Announcement2567 from "./announcement2567/page";
import Announcement2566 from "./announcement2566/page";
import Announcement2568 from "./announcement2568/page";

// announcement
export default function AnnouncementPage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข่าวประกาศ</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Announcement New Page
        </h1>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2568"
          >
            <Announcement2568 />
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Accordion 2"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2567"
          >
            <Announcement2567 />
          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label="Accordion 3"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2566"
          >
            <Announcement2566 />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
