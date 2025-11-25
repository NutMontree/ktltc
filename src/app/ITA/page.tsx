"use client";
import O1 from "./01/page";
import O2 from "./02/page";
import O3 from "./03/page";
import O4 from "./04/page";
import O5 from "./05/page";
import O6 from "./06/page";
import O7 from "./07/page";
import O8 from "./08/page";
import O9 from "./09/page";
import O10 from "./010/page";
import O11 from "./011/page";
import O12 from "./012/page";
import O13 from "./013/page";
import O14 from "./014/page";
import O15 from "./015/page";
import O16 from "./016/page";
import O17 from "./017/page";
import O18 from "./018/page";
import O19 from "./019/page";
import O20 from "./020/page";
import O21 from "./021/page";
import O22 from "./022/page";
import O23 from "./023/page";
import O24 from "./024/page";
import O25 from "./025/page";
import O26 from "./026/page";
import O27 from "./027/page";
import O28 from "./028/page";
import O29 from "./029/page";
import O30 from "./030/page";
import O31 from "./031/page";
import O32 from "./032/page";
import O33 from "./033/page";
import O34 from "./034/page";
import O35 from "./035/page";
import O36 from "./036/page";
import O37 from "./037/page";
import Link from "next/link";
import { Accordion, AccordionItem } from "@heroui/react";
import { JSX, SVGProps } from "react";
import { Breadcrumb } from "antd";
import { Image } from "@heroui/react";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "motion/react";
import { TageLink } from "@/app/pressrelease/2568/press6811/press11/data";
import {
  DataDate,
  DataPressrelease,
  Description,
  ImageItem,
} from "@/app/pressrelease/2568/press6811/press11/data";
import { FootTitle } from "@/components/FootTitle";

const AnchorIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) => {
  return (
    // <svg
    //     aria-hidden="true"
    //     focusable="false"
    //     height="24"
    //     role="presentation"
    //     viewBox="0 0 24 24"
    //     width="24"
    //     {...props}
    // >
    //     <path
    //         d="M8.465,11.293c1.133-1.133,3.109-1.133,4.242,0L13.414,12l1.414-1.414l-0.707-0.707c-0.943-0.944-2.199-1.465-3.535-1.465 S7.994,8.935,7.051,9.879L4.929,12c-1.948,1.949-1.948,5.122,0,7.071c0.975,0.975,2.255,1.462,3.535,1.462 c1.281,0,2.562-0.487,3.536-1.462l0.707-0.707l-1.414-1.414l-0.707,0.707c-1.17,1.167-3.073,1.169-4.243,0 c-1.169-1.17-1.169-3.073,0-4.243L8.465,11.293z"
    //         fill="currentColor"
    //     />
    //     <path
    //         d="M12,4.929l-0.707,0.707l1.414,1.414l0.707-0.707c1.169-1.167,3.072-1.169,4.243,0c1.169,1.17,1.169,3.073,0,4.243 l-2.122,2.121c-1.133,1.133-3.109,1.133-4.242,0L10.586,12l-1.414,1.414l0.707,0.707c0.943,0.944,2.199,1.465,3.535,1.465 s2.592-0.521,3.535-1.465L19.071,12c1.948-1.949,1.948-5.122,0-7.071C17.121,2.979,13.948,2.98,12,4.929z"
    //         fill="currentColor"
    //     />
    // </svg>
    <p>คลิก</p>
  );
};
const TageFucntion = () => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl md:p-8">
      {" "}
      <div className="mb-4 flex items-center border-b border-sky-100 pb-3">
        {" "}
        <svg
          className="mr-3 h-8 w-8 animate-bounce text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          ></path>{" "}
        </svg>{" "}
        <p className="text-xl font-bold text-sky-800">
          {" "}
          <span className="rounded-md bg-sky-100 px-2 py-1">
            {" "}
            ดาวน์โหลดเอกสาร PDF{" "}
          </span>{" "}
        </p>{" "}
      </div>
      <div className="space-y-4">
        {" "}
        <div className="flex flex-col justify-between rounded-lg bg-sky-50 p-4 transition duration-200 hover:bg-sky-100 md:flex-row md:items-center">
          <div className="mb-3 min-w-0 flex-1 md:mb-0">
            <p className="truncate text-base text-gray-500">ชื่อไฟล์:</p>
            <p className="text-lg font-semibold text-sky-700">
              2587 - สอศ แจ้งผลประเมิน ITA ประจำปีงบประมาณ พศ 2568
            </p>
          </div>
          <Link
            href="/images/ข่าวประชาสัมพันธ์/2568/พฤศจิกายน/11/2587-สอศแจ้งผลประเมินITAประจำปีงบประมาณพศ2568.pdf"
            className="inline-flex transform items-center justify-center rounded-full border border-transparent bg-sky-500 px-5 py-2 text-base font-medium text-white shadow-lg transition duration-150 hover:scale-105 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 focus:outline-none"
            target="_blank"
            download
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>{" "}
            </svg>{" "}
            ดาวน์โหลด PDF
          </Link>
        </div>
      </div>
    </div>
  );
};

const ImageFunction = () => {
  return (
    <div>
      <div className="flex justify-center">
        <div className="grid-cols-1 justify-center justify-items-center pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ImageItem.map((item) =>
            item ? (
              <div key={item.imgs}>
                <div className="scale-95 rounded-full transition duration-500 hover:scale-100">
                  <Image isBlurred src={item.imgs} alt={""}></Image>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};

export default function ITA() {
  return (
    <>
      <Breadcrumb
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
            className: "dark:text-white dark:hover:text-white",
          },
          {
            href: "/pressrelease/2568/press6809",
            className: "dark:text-white dark:hover:text-white",
            title: (
              <>
                {" "}
                <UserOutlined /> <span>Application List</span>{" "}
              </>
            ),
          },
          { title: "Application", className: "dark:text-gray-400" },
        ]}
      />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-32 w-1 bg-linear-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        {" "}
        <div className="absolute h-40 w-px bg-linear-to-b from-transparent via-blue-500 to-transparent" />{" "}
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
              {DataPressrelease.Item.map((item) => (
                <div key={item.title}>{item.title}</div>
              ))}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.4 }}
          className="relative z-10 mx-auto py-6 font-normal text-neutral-600 dark:text-neutral-400"
        >
          <div className="grid gap-2">
            {Description.map((item) => (
              <div key={item?.description ?? "undefined"}>
                {" "}
                {item?.description && <div>{item.description}</div>}{" "}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.6 }}
        >
          {TageLink.map((item) => (
            <Link key={item.href} href={item.href} target="_blank">
              <div className="text-sky-500 hover:text-sky-600 dark:text-sky-400 hover:dark:text-sky-600">
                {item.tage}
              </div>
            </Link>
          ))}
          <TageFucntion />
          <br />
          <FootTitle />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.8 }}
        >
          <div className="date flex gap-2 py-2">
            <Image
              isBlurred
              src="/images/icon/time-svgrepo-com.svg"
              alt="logo-youtube"
              className="pt-1"
              width={20}
              height={20}
            />
            {DataDate.map((item) => (
              <div key={item.date}>
                {" "}
                <div className="pt-1 text-xs text-slate-500">
                  {item.date}
                </div>{" "}
              </div>
            ))}{" "}
          </div>
          {/* ***************************** Youtube / Image *****************************  */}
          <ImageFunction />
        </motion.div>
      </div>

      <div className="py-[84px]">
        <p className="text-center text-xl">
          ประเมินคุณธรรมและความโปร่งใส (ITA)
        </p>
        <p className="pt-2 text-center">
          การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ <br />
          ( Integrity and Transparency Assessment)
          <br />
          ระบบช่วยตรวจสอบข้อมูล สำหรับเจ้าหน้าที่ผู้ปฏิบัติงาน
          <br />
          วิทยาลัยเทคนิคกันทรลักษ์
        </p>
      </div>

      <div className="pb-12">
        <Accordion variant="splitted" disabledKeys={["2"]}>
          <AccordionItem
            key="1"
            aria-label="ITA คืออะไร ?"
            title="ITA คืออะไร ?"
          >
            <div className="py-4">
              <div className="grid md:grid-flow-col">
                <div className="rounded-xl">
                  <img
                    src="/images/ita/ita.webp"
                    alt="ITA Image"
                    className="mx-auto"
                  />
                </div>
                <div className="bg-slate-300rounded-xl">
                  <div className="text-center text-xl font-bold">
                    <div>ITA คืออะไร ?</div>
                  </div>
                  <div className="flex">
                    <div className="font-bold">I</div>
                    <div className="pr-1">ntegrity</div>
                    <div className="pr-1">and</div>
                    <div className="font-bold">T</div>
                    <div className="pr-1">ransparency</div>
                    <div className="font-bold">A</div>
                    <div className="pr-1">ssessment</div>
                  </div>
                  <div>
                    <div>
                      การประเมินคุณธรรม
                      และความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ
                      แบบตรวจการเปิดเผยข้อมูลสาธารณะ (OIT)
                      มีวัตถุประสงค์เพื่อเป็นการประเมินระดับการเปิดเผยข้อมูลต่อสาธารณะของหน่วยงาน
                      เพื่อให้ประชาชนทั่วไปสามารถเข้าถึงได้
                      ในตัวชี้วัดการเปิดเผยข้อมูล และการป้องกันการทุจริต
                      สำหรับการประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 9.1 ข้อมูลพื้นฐาน (o1 - o6)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="1"
            aria-label="1"
            title="O1 โครงสร้าง"
          >
            <O1 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="2"
            aria-label="2"
            title="O2 ข้อมูลผู้บริหาร"
          >
            <O2 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="3"
            aria-label="3"
            title="O3 อำนาจหน้าที่"
          >
            <O3 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="4"
            aria-label="4"
            title="O4 แผนพัฒนา สถานศึกษา"
          >
            <O4 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="5"
            aria-label="5"
            title="O5 ข้อมูลการติดต่อ"
          >
            <O5 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="6"
            aria-label="6"
            title="O6 กฎหมายที่เกี่ยวข้อง"
          >
            <O6 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 9.2 การบริหารงาน (o7 - o16)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="7"
            aria-label="7"
            title="O7 ข่าวประชาสัมพันธ์"
          >
            <O7 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="8"
            aria-label="8"
            title="O8 Q&A"
          >
            <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
              – แสดงตำแหน่งบนเว็บไซต์ของสถานศึกษาที่บุคคลภายนอก
              สามารถสอบถามข้อมูลต่าง ๆ ได้ และหน่วยงานสามารถสื่อสารให้คำตอบกับ
              ผู้สอบถามได้
              โดยมีลักษณะเป็นการสื่อสารได้สองทางบนหน้าเว็บไซต์ของสถานศึกษา (Q&A)
              ยกตัวอย่าง เช่น Web board, กล่องข้อความถาม-ตอบ,Messenger Live
              Chat, Chatbot เป็นต้น
            </div>
            <O8 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="9"
            aria-label="9"
            title="O9 Social Network"
          >
            <O9 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="10"
            aria-label="10"
            title="O10 แผนดำเนินงานประจำปี"
          >
            <O10 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="11"
            aria-label="11"
            title="O11 รายงานผลการดําเนินงานประจําปี"
          >
            <O11 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="12"
            aria-label="12"
            title="O12 คู่มือหรือมาตรฐานการปฏิบัติงาน"
          >
            <O12 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="13"
            aria-label="13"
            title="O13 คู่มือหรือมาตรฐาน การให้บริการ"
          >
            <O13 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="14"
            aria-label="14"
            title="O14 ข้อมูลเชิงสถิติ การให้บริการ"
          >
            <O14 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="15"
            aria-label="15"
            title="O15 รายงานผลการ สํารวจความ พึงพอใจการให้บริการ"
          >
            <O15 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="16"
            aria-label="16"
            title="O16 E-Service"
          >
            <O16 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 9.3 การบริหารเงินงบประมาณ (o17 - o22)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="17"
            aria-label="17"
            title="O17 แผนการใช้จ่าย งบประมาณ ประจําปี"
          >
            <O17 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="18"
            aria-label="18"
            title="O18 ผลการใช้จ่าย งบประมาณ ประจําปี"
          >
            <O18 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="19"
            aria-label="19"
            title="O19 แผนการจัดซื้อจัด จ้างหรือแผนการจัดหาพัสดุ"
          >
            <O19 />
          </AccordionItem>
          {/* <AccordionItem indicator={<AnchorIcon />} subtitle={<span> ทำเอกสารเพิ่มเติม <strong>ข้อมูลไม่ครบ</strong> </span>} key="20" aria-label="20" title="O20 ประกาศต่าง ๆ เกี่ยวกับการจัดซื้อจัดจ้างหรือการ จัดหาพัสดุ"> */}
          <AccordionItem
            indicator={<AnchorIcon />}
            key="20"
            aria-label="20"
            title="O20 ประกาศต่าง ๆ เกี่ยวกับการจัดซื้อจัดจ้างหรือการ จัดหาพัสดุ"
          >
            <O20 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="21"
            aria-label="21"
            title="O21 สรุปผลการจัดซื้อ จัดจ้างหรือจัดหาพัสดุรายเดือน"
          >
            <O21 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="22"
            aria-label="22"
            title="O22 แผนการจัดซื้อจัดจ้างหรือแผนการจัดหาพัสดุ"
          >
            <O22 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 9.4 การบริหารและพัฒนาทรัพยากรบุคคล (o23 - o25)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="23"
            aria-label="23"
            title="O23 การดําเนิน โครงการ/กิจกรรม ที่แสดงถึง การพัฒนา ทรัพยากรบุคคล"
          >
            <O23 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="24"
            aria-label="24"
            title="O24 หลักเกณฑ์การ บริหารและพัฒนา ทรัพยากรบุคคล"
          >
            <O24 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="25"
            aria-label="25"
            title="O25 รายงานผลการ ดําเนินโครงการ/ กิจกรรมที่แสดงถึง การพัฒนา ทรัพยากรบุคคล"
          >
            <O25 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 9.5 การส่งเสริมความโปร่งใสในสถานศึกษา (o26 - o29)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="26"
            aria-label="26"
            title="O26 แนวทางปฏิบัติการ จัดการร้องเรียนการทุจริตและ ประพฤติมิชอบ"
          >
            <O26 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="27"
            aria-label="27"
            title="O27 ช่องทางแจ้งเรื่อง ร้องเรียนการทุจริตและประพฤติ มิชอบ"
          >
            <O27 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="28"
            aria-label="28"
            title="O28 ข้อมูลเชิงสถิติเรื่อง ร้องเรียนการทุจริตและประพฤติมิชอบ"
          >
            <O28 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="29"
            aria-label="29"
            title="O29 การเปิดโอกาสให้ เกิดการมีส่วนร่วม"
          >
            <O29 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อยที่ 10.1 การดำเนินการ เพื่อป้องกันทุจริต (o30 - o35)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="30"
            aria-label="30"
            title="O30 นโยบายไม่รับ ของขวัญ (No Gift Policy)"
          >
            <O30 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="31"
            aria-label="31"
            title="O31 การมีส่วนร่วมของ ผู้บริหาร สถานศึกษา"
          >
            <O31 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="32"
            aria-label="32"
            title="O32 การประเมินผล ควบคุมภายใน"
          >
            <O32 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="33"
            aria-label="33"
            title="O33 การเสริมสร้าง วัฒนธรรมองค์กร"
          >
            <O33 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="34"
            aria-label="34"
            title="O34 โครงการ/กิจกรรม ที่เกี่ยวข้องกับ การป้องกัน การทุจริต"
          >
            <O34 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="35"
            aria-label="35"
            title="O35 รายงานผลการ ดําเนินโครงการ/ กิจกรรมที่เกี่ยวกับ การป้องกัน การ ทุจริตประจําปี"
          >
            <O35 />
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <div>
          <p className="py-6 text-xl font-bold text-sky-500">
            ตัวชี้วัดย่อย 10.2 มาตรการภายในเพื่อป้องกันการทุจริต (o36 - o37)
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          variant="splitted"
          disabledKeys={[]}
        >
          <AccordionItem
            indicator={<AnchorIcon />}
            key="36"
            aria-label="36"
            title="O36 มาตรการส่งเสริม คุณธรรมและความโปร่งใส ภายในสถานศึกษา"
          >
            <O36 />
          </AccordionItem>
          <AccordionItem
            indicator={<AnchorIcon />}
            key="37"
            aria-label="37"
            title="O37 การดําเนินการ ตามมาตรการ ส่งเสริม คุณธรรมและ ความโปร่งใส ภายในสถานศึกษา"
          >
            <O37 />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
