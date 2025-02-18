"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import Link from "next/link";

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
        {/* <div>
          <br />
          <p>รายละเอียดการลงทะเบียนเเละค่าลงทะเบียน สามารถกดได้ที่นี่ </p>
          <Link
            href="https://cdn.me-qr.com/pdf/efafff39-a2ec-4d9b-bc82-9102fa9f62e2.pdf?fbclid=IwY2xjawFoMNJleHRuA2FlbQIxMAABHZ6COWXf5J33t24yc3UcnPdUxBs-yFG6eOUx0rX-dBjYgqjF6jJ3Jk4W6g_aem_LX27tj-0AI0-Em03aDmgDg"
            className="hover:text-sky-500"
          >
            https://cdn.me-qr.com/pdf/efafff39-a2ec-...
          </Link>
          <br /> <br />
          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/กันยายน/52/1.pdf"
          ></iframe>
          <p className="pt-4">จึงมาประกาศให้ทราบโดยทั่วกัน</p>
        </div> */}
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

        <div className="flex justify-center">
          <div className="  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
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
