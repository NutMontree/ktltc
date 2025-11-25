"use client";

import { Accordion, AccordionItem } from "@heroui/react";

import DocumentsAcademic from "../DocumentsAcademic/page";
import DocumentsResource from "../DocumentsResource/page";

export default function ExternalInternal() {
  return (
    <>
      <div>
        <div className="pb-8 pt-8">
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            แบบฟอร์มหนังสือภายนอก-ภายใน
          </h1>
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            External-internal book form
          </h1>
        </div>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="ExternalInternal 1"
            title="ฝ่ายบริหารทรัพยากร"
          >
            <DocumentsResource />
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="ExternalInternal 2"
            title="ฝ่ายวิชาการ"
          >
            <DocumentsAcademic />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
