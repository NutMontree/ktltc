"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Accordion, AccordionItem, Image } from "@nextui-org/react";
import Link from "next/link";
import { FootTitle } from "@/components/FootTitle";

export default function Pressrelease() {
  return (
    <>
      <div>
        {/* ***************************** Map Title ***************************** */}

        <div className="text-center text-xl pb-6 px-2">
          {DataPressrelease.Item.map((item) => (
            <div key={item.title}>{item.title}</div>
          ))}
        </div>

        <div className='px-2'>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </div>
        {/* ***************************** Map Title ***************************** */}

        {/* ***************************** LInk And PDF ***************************** */}
        <div>
          {/* <br />
          <p className="text-sky-800 text-lg">สามารถกดลิ้งค์โหวตได้ที่นี่ </p>
          <Link
            href="
https://docs.google.com/forms/d/e/1FAIpQLSeQJJhhMigByXhluAXU1YX-Vu546FAXseeZHiavtDwlL_h24w/viewform?fbclid=IwY2xjawGVKw9leHRuA2FlbQIxMAABHSWycuu7W8Tomyo6THhyna5eRXDaPGQqdi8ccYgLI9_XdbDHNd4IB6_VBA_aem_O1sf0HHCPmm9QgKqCWm2-A                "
            className="hover:text-sky-500"
          >
            https://drive.google.com/...
          </Link>
          <br /> <br />
          <p>หรือสเเกนคิวอาร์โค้ดได้เลย</p>
          <p>**** จะทำการปิดการโหวตในวันอังคารที่ 5 พฤศจิกายน 2567 ****</p> */}
          {/* <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/54/1.pdf"
          ></iframe> */}
        </div>
        {/* ***************************** LInk And PDF ***************************** */}

        {/* ***************************** Foot Title ***************************** */}
        <FootTitle />
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

        {/* ***************************** Youtube ***************************** */}

        {/* <div className="flex justify-center">
          <div className="px-2 py-2  gap-4">
            <iframe
              className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
                         w-[200px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
              src="https://www.youtube.com/embed/1qwOVzMyCQU?si=JlO30KsNt-hv68Ls"
              title="เข้าค่ายลูกเสือ ปี 2567 part 1"
              // frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              // referrerpolicy="strict-origin-when-cross-origin"
              // allowfullscreen
            />
            <br />
          </div>
        </div> */}
        {/* ***************************** Youtube ***************************** */}

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
