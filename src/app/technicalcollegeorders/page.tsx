"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Technical2566 from "./technical2566/page";
import Technical2567 from "./Technical2567/page";
import Technical2568 from "./Technical2568/page";

export default function TechnicalcollegeordersPage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">คำสั่งวิทยาลัยเทคนิค</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Technical College Page
        </h1>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2568"
          >
            <Technical2568 />
          </AccordionItem>

          <AccordionItem
            key="2"
            aria-label="Accordion 2"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2567"
          >
            <Technical2567 />
          </AccordionItem>

          <AccordionItem
            key="3"
            aria-label="Accordion 3"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2566"
          >
            <Technical2566 />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
