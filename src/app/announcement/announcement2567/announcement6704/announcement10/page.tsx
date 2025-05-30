"use client"; // top to the file

import React from "react";
import { DataDate, DataAnnouncement, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";

export default function Announcement() {
  return (
    <>
      <div>
        <div className="text-center text-xl pb-6 px-2">
          {DataAnnouncement.Item.map((item) => (
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
        <div className="text-xs pt-6">
          <h1 className="text-base">KTL-TC ONE TEAM </h1>
          <div className="text-sky-500">#เรียนดีมีความสุข #เทคนิคกันท์ </div>
          <div className="border-t pt-[12px] ">
            " วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "
          </div>
          <div>
            ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
            เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
            มีความร่วมมือกับสถานประกอบการและชุมชน
          </div>
          <br />
          <div className="border-t pt-[12px]">
            "ค่านิยม วิทยาลัยเทคนิคกันทรลักษ์ "
          </div>
          <p className="">
            "ยิ้ม ไหว้ เเต่งกายดี รู้จักสวัสดี ขอบคุณ เเละขอโทษ
          </p>
          <br />
          <p className="border-t pt-[12px]">👉 ช่องทางการติดต่อ</p>
          <div>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</div>
          <div>
            เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ เเละ
            วิทยาลัยเทคนิคกันทรลักษ์ Today
          </div>
          <div>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </div>
          <div>Website : www.ktltc.ac.th</div>
          <div>Gmail : ktl11022021@gmail.com</div>
          <div>สอบถามข้อมูลเพิ่มเติม</div>
          <div>โทร : ๐๖๑ - ๔๑๒๒๗๖๕ หรือ ๐๔๕ - ๘๑๑๗๕๓ </div>
          <div>โทร : 061-4122765 หรือ 045-811053</div>
        </div>

        {/* <div className="link">
          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://drive.google.com/drive/folders/109VcUHY2qHagLaktmlIflTzDJZTG4XJo?fbclid=IwZXh0bgNhZW0CMTAAAR0icdZSoZKZspAO-TXFYMBGQt3caK5Jqe45hZZO1aIFxSvNRT_WxHLgjxY_aem_3KIoaUg0lZUB_x2xtiyKPg"
          >
            รูปภาพเพิ่มเติม 1
          </Link>
        </div> */}
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

        <div className="   ">
          <div>
            <iframe
              className="w-full aspect-video ..."
              src="/images/ข่าวประกาศ/2567/เมษายน/3/1.pdf"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}
