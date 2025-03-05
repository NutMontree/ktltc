"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";

import Pressrelease2566 from "./2566/page";
import Pressrelease2567 from "./2567/page";
import Pressrelease2568 from "./2568/page";
import Link from "next/link";

export default function PressReleasePage() {
  return (
    <>
      <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
        <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
        <div className="w-full px-4">
          <div className="text-center">
            <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
            <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
              Press Release Page
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
      <section className="pt-20">
        <div className="">
          {/* <div>
            <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
            <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
              Press Release Page
            </h1>
          </div> */}

          <div className="">
            <Accordion isCompact>
              <AccordionItem
                key="1"
                aria-label="Accordion 1"
                title="วิทยาลัยเทคนิคกันทรลักษ์ ปีการศึกษา 2568"
              >
                <div className="">
                  <Pressrelease2568 />
                </div>
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
