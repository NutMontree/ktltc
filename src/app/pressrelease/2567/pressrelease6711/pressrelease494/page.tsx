"use client"; // top to the file

import React from "react";
import {
  DataDate,
  DataPressrelease,
  Description,
  ImageItem,
  ImageItems,
} from "./data";
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
        <div className="pt-4">
          <p className="text-sky-800 text-lg">สามารถดาวน์โหลดรูปได้ที่นี่ </p>
          <Link
            href="
https://drive.google.com/drive/folders/1gTVieOg1hUVoCriLiva9LJeDEsRHspGF?fbclid=IwY2xjawGpTpZleHRuA2FlbQIxMAABHZ0ZBLtX7ZSE4F2pZzQhidSour8PnwpN16gxjTtew5-LqGyoeWL55ehUCw_aem_Ny4lV3Syn4WsMQoN2zTwHQ
"
            className="hover:text-sky-500"
          >
            https://drive.google.com/...
          </Link>

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

        <div className="flex justify-center">
          <div className="px-2 py-2  gap-4">
            <iframe
              className="h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
                         w-[300px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
              // src="/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/30/1.webm"
              src="https://www.youtube.com/embed/_2Gnilun9X8?si=9ghGi3tGySI8-zVZ"
              title=" "
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <br />
          </div>
        </div>

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

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
            {ImageItems.map((item) => (
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
