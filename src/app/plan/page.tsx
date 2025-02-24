"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Planning from "./Planning";
import Link from "next/link";

export default function Resource() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">
          ฝ่ายแผนงานและความร่วมมือ
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Planning and Cooperation Division Page
        </h1>
      </div>

      <div className="pt-8">
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา"
          >
            <Planning />
          </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="งานแผน">
            {/* <Pressrelease2566 /> */}
            <Link href='https://ktltcp.vercel.app/' target="_blank">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Ktltc Plan
              </button>
            </Link>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
