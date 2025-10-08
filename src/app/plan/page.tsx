"use client"; // top to the file

import { Accordion, AccordionItem } from "@nextui-org/react";
import Planning from "./Planning";
import Link from "next/link";
import PAB from "./PAB";
import CW from "./CW";
import TABPW from "./TABPW";
import RDIAI from "./RDIAI";
import QAES from "./QAES";
import DataCenter from "./DataCenter";
import KTCVS from "./KTCVS";
import FFEE from "./FFEE";

export default function page() {
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

      <div className="py-8">
        <Accordion isCompact>
          <AccordionItem key="1" aria-label="1" title="แผนภูมิโครงสร้างการบริหารงานสถานศึกษา"
          >
            <Planning />
          </AccordionItem>
          <AccordionItem key="2" aria-label="2" title="งานวางแผน และงบประมาณ">
            <PAB />
            <div className="grid gap-4 py-4">
              <Link href='https://ktltcp.vercel.app/' target="_blank">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full">
                  Ktltc Plan
                </button>
              </Link>
              <Link href='https://ktltc.vercel.app/pdca'>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full">
                  แบบฟอร์ม PDCA
                </button>
              </Link>
            </div>
          </AccordionItem>
          <AccordionItem key="3" aria-label="3" title="งานศูนย์ข้อมูลและสารสนเทศ">
            <DataCenter />
          </AccordionItem>
          <AccordionItem key="4" aria-label="4" title="งานความร่วมมือ">
            <CW />
          </AccordionItem>
          <AccordionItem key="5" aria-label="5" title="งานส่งเสริมผลิตผล การค้าและประกอบธุรกิจ">
            <TABPW />
          </AccordionItem>
          <AccordionItem key="6" aria-label="6" title="งานวิจัย พัฒนา นวัตกรรมและสิ่งประดิษฐ์">
            <RDIAI />
          </AccordionItem>
          <AccordionItem key="7" aria-label="7" title="งานประกันคุณภาพและมาตรฐานการศึกษา">
            <QAES />
          </AccordionItem>
          <AccordionItem key="8" aria-label="8" title="งานร้านค้าสวัสดิการวิทยาลัยเทคนิคกันทรลักษ์">
            <KTCVS />
          </AccordionItem>
          <AccordionItem key="9" aria-label="9" title="งานกองทุนเพื่อความเสมอภาคทางการศึกษา">
            <FFEE />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
