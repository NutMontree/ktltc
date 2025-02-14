"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Accordion, AccordionItem, Image } from "@nextui-org/react";
import Link from "next/link";

export default function Pressrelease() {
  return (
    <>
      <div>
        {/* ***************************** Map Title ***************************** */}

        <div className="text-center text-xl pb-6">
          {DataPressrelease.Item.map((item) => (
            <div key={item.title}>{item.title}</div>
          ))}
        </div>
        <div>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </div>
        {/* ***************************** Map Title ***************************** */}

        {/* ***************************** LInk And PDF ***************************** */}
        <div>
          <br />
          <p className="text-red-500">รูปภาพเพิ่มเติม </p>
          <Link
            href="https://drive.google.com/drive/folders/1T3RSnuR2XNiz3o3uaOr4FC9F1k-q4lm-?fbclid=IwY2xjawGJW1VleHRuA2FlbQIxMAABHQl9VrTgad3VWuTR196IN9bhSSDpNy3HAmvq2ZhmdFf7l6vmNgMc7SRKfw_aem_NiXfLdpaAp06z3SvaI3jNw"
            className="hover:text-sky-500"
          >
            https://drive.google.com/...
          </Link>
          {/* <br /> <br />
          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/กันยายน/52/1.pdf"
          ></iframe> */}
        </div>
        {/* ***************************** LInk And PDF ***************************** */}

        {/* ***************************** Foot Title ***************************** */}
        <div className="text-xs pt-6">
          <h1 className="text-base">KTL-TC ONE TEAM </h1>
          <p className="text-sky-500">#เรียนดีมีความสุข #เทคนิคกันท์ </p>
          <p className="border-t pt-[12px] ">
            " วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "
          </p>
          <p>
            ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
            เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
            มีความร่วมมือกับสถานประกอบการและชุมชน
          </p>
          <br />
          <p className="border-t pt-[12px]">
            "ค่านิยม วิทยาลัยเทคนิคกันทรลักษ์ "
          </p>
          <p className="">
            "ยิ้ม ไหว้ เเต่งกายดี รู้จักสวัสดี ขอบคุณ เเละขอโทษ
          </p>
          <br />
          <p className="border-t pt-[12px]">👉 ช่องทางการติดต่อ</p>
          <p>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</p>
          <p>
            เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ เเละ
            วิทยาลัยเทคนิคกันทรลักษ์ Today
          </p>
          <p>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </p>
          <p>Website : www.ktltc.ac.th</p>
          <p>Gmail : ktl11022021@gmail.com</p>
          <p>สอบถามข้อมูลเพิ่มเติม</p>
          <p>โทร : ๐๖๑ - ๔๑๒๒๗๖๕ หรือ ๐๔๕ - ๘๑๑๗๕๓ </p>
          <p>โทร : 061-4122765 หรือ 045-811753</p>
        </div>
        {/* ***************************** Foot Title ***************************** */}

        {/* ***************************** Map Image ***************************** */}

        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
        <br />

        {/* <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-90 hover:scale-110 transition duration-500 rounded-full">
                  <Image src={item.img} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div> */}
        <div className="flex justify-center">
          <div className="px-2 py-2  gap-4">
            <iframe
              className="w-[auto]"
              src="https://www.youtube.com/embed/TOaUl6O1CTY"
              title="เข้าค่ายลูกเสือ ปี 2567 part 1"
              // frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              // referrerpolicy="strict-origin-when-cross-origin"
              // allowfullscreen
            />
            <br />
            <iframe
              src="https://www.youtube.com/embed/mNuLKUUotoM"
              title="26 ตุลาคม ค.ศ. 2024"
              // frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              // referrerpolicy="strict-origin-when-cross-origin"
              // allowfullscreen
            ></iframe>
          </div>
        </div>
        <Accordion isCompact>
          <AccordionItem key="2" aria-label="Accordion 2" title="รูปภาพ ">
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
                {ImageItem.map((item) => (
                  <div className="" key={item.img}>
                    <div className="scale-90 hover:scale-110 transition duration-500 rounded-full">
                      <Image src={item.img} alt={""}></Image>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* ************ Foot-Image ************ */}
        {/* <div className="Foot-Image">
          <div className="flex scale-90 hover:scale-110 transition duration-500 rounded-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center justify-center ">
            <Image
              src={"/images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/6/1.webp"}
              alt={""}
            />
          </div>
        </div> */}
        {/* ************ Foot-Image ************ */}

        {/* ***************************** Map Image ***************************** */}
      </div>
    </>
  );
}
