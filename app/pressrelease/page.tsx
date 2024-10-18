"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Pressrelease2566 from "../Pressrelease2566/page";
import Pressrelease2567 from "../Pressrelease2567/page";

export default function PressReleasePage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Press Release Page
        </h1>
      </div>

      <div>
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2567"
          >
            <Pressrelease2567 />
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Accordion 2"
            title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2566"
          >
            <Pressrelease2566 />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
