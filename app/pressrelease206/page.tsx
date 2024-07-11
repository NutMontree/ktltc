"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease() {
  return (
    <>
      <div>
        <div className="text-center text-xl">
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
        <div className="text-xs">
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
        {/* <div className="iframe">
          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/มีนาคม/141/1.mp4"
          ></iframe>
        </div> */}

        <div className="flex justify-center">
          <div className="w-fit mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className=" scale-90 hover:scale-110 transition duration-500 rounded-full ">
                  <Image src={item.img} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
