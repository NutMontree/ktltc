"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import { FootTitle } from "@/components/FootTitle";
// import Link from "next/link";

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
        {/* <div className="pt-4">
          <p className="text-sky-800 text-lg">
            รายละเอียดสามารถเปิดดูได้ที่นี่{" "}
          </p>
          <Link
            href="
https://cdn3.me-qr.com/pdf/723b8fd5-e5fd-4b62-875d-330a6b40c138.pdf?fbclid=IwZXh0bgNhZW0CMTAAAR2HjlImvJi92r1IpE2ktqwDxK_BPxn6rLFnO58OKKHjzO94U_vzWMtI9g4_aem_P_BlarrVzwHdpUk8dINyXw
"
            className="hover:text-sky-500"
            target="_blank"
          >
            https://drive.google.com/...
          </Link>

          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/25/2.pdf"
          ></iframe>
        </div> */}
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
              // src="/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/30/1.webm"
              src="/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/31/1.mp4"
              title=" "
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
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
