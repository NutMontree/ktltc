"use client"; // top to the file
import React from "react";
import { Image } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import Contents1 from "./contents/contents1";
import Contents2 from "./contents/contents2";

export default function page() {
  return (
    <>
      <div className="flex justify-center">
        <div className="scale-90 hover:scale-100 transition duration-500 rounded-ful w-70">
          <Image src="/images/logo/1.webp" alt={""}></Image>
        </div>
      </div>

      <div className="pt-8">
        <h1 className="flex justify-center pt-3 font-bold text-[14px] sm:text-sm md:text-md lg:text-lg xl:text-xl">
          Convenient Government Center
        </h1>
      </div>
      <div className="flex justify-center">
        <h1 className="flex justify-center text-[#DAA520] text-[14px] sm:text-sm md:text-md lg:text-lg xl:text-xl">
          ศูนย์ราชการสะดวก
        </h1>
      </div>

      <div>
        <div>
          <div>
            <Accordion isCompact>
              <AccordionItem
                key="1"
                aria-label="Accordion 1"
                title="หัวข้อที่ 1"
              >
                <Contents1 />
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Accordion 2"
                title="หัวข้อที่ 2"
              >
                <Contents2 />
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
