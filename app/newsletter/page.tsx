"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Newsletter2567 from "./newsletter2567/page";
import Newsletter2566 from "./newsletter2566/page";
import Newsletter2568 from "./newsletter2568/page";

export default function NewsletterPage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">จดหมายข่าว</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Newsletter Page
        </h1>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2568"
          >
            <Newsletter2568 />
          </AccordionItem>

          <AccordionItem
            key="2"
            aria-label="Accordion 2"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2567"
          >
            <Newsletter2567 />
          </AccordionItem>

          <AccordionItem
            key="3"
            aria-label="Accordion 3"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2566"
          >
            <Newsletter2566 />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
