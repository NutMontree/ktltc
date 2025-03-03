"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Pressrelease2566 from "./2566/page";
import Pressrelease2567 from "./2567/page";
import Pressrelease2568 from "./2568/page";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function PressReleasePage() {
  return (
    <>
      <section className="">
        <Breadcrumb pageName="PressRelease Page" />
        <div className="py-12">
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
                title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2568"
              >
                <Pressrelease2568 />
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Accordion 2"
                title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2567"
              >
                <Pressrelease2567 />
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Accordion 3"
                title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2566"
              >
                <Pressrelease2566 />
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
