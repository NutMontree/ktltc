"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Newsletter2567 from "./newsletter2567/page";
import Newsletter2566 from "./newsletter2566/page";
import Newsletter2568 from "./newsletter2568/page";
import Link from "next/link";

export default function NewsletterPage() {
  return (
    <>
      <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
        <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
        <div className="w-full px-4">
          <div className="text-center">
            <h1 className="flex justify-center text-xl ">จดหมายข่าว</h1>
            <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
              Newsletter Page
            </h1>
            <ul className="flex items-center justify-center gap-[10px]">
              <li>
                <Link
                  href="/"
                  className="text-dark flex items-center gap-[10px] text-base font-medium dark:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <p className="text-body-color flex items-center gap-[10px] text-base font-medium">
                  <span className="text-body-color dark:text-dark-6">
                    /
                  </span>
                  pressrelease
                </p>
              </li>
            </ul>


          </div>
        </div>
      </div >

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
