"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";

import DocumentsAcademic from "../DocumentsAcademic/page";
import DocumentsResource from "../DocumentsResource/page";

export default function ExternalInternal() {
  return (
    <>
      <div>
        <div className="pt-8 pb-8">
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            แบบฟอร์มหนังสือภายนอก-ภายใน
          </h1>
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
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
