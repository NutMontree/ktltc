"use client"; // top to the file

import React from "react";
import { DataDate, DataAnnouncement, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
// import Link from "next/link";

export default function Announcement() {
  return (
    <>
      <div>
        <div className="text-center text-xl">
          {DataAnnouncement.Item.map((item) => (
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
        {/* <div className="link">
          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://cdn2.me-qr.com/pdf/22044536.pdf"
          >
            **** สามารถดูรายชื่อได้ที่ลิ้งค์นี่ ****
          </Link>
        </div> */}
        <div className="text-xs pt-6">
          <h1 className="text-base">KTL -TC ONE TEAM </h1>
          <p className="text-sky-500">#เรียนดีมีความสุข #เทคนิคกันท์ </p>
          <p>" วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "</p>
          <p>
            ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
            เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
            มีความร่วมมือกับสถานประกอบการและชุมชน
          </p>
          <br />
          <p>👉 ช่องทางการติดต่อ</p>
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

        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
        <br />

        <div className="flex justify-center">
          <div className="   grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className=" scale-90 hover:scale-110 transition duration-500 rounded-full">
                  <Image src={item.img} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <div>
            <div className="text-lg text-sky-500">
              ประกาศองค์การนักวิชาชีพมในอนาคตแห่งประเทศไทย
            </div>
            <iframe
              className="w-full aspect-video ... "
              src="/images/ข่าวประกาศ/2567/พฤษภาคม/5/1.pdf"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}
