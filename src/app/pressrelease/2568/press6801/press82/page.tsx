"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import { FootTitle } from "@/components/FootTitle";
import Link from "next/link";
// import Link from "next/link";

// import Link from "next/link";

export default function Pressrelease() {
  return (
    <>
      <div>
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

        {/* ***************************** LInk And PDF ***************************** */}

        <FootTitle />

        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
        <br />

        {/* ***************************** Youtube ***************************** */}

        <Image
          className="w-full aspect-video py-8"
          src="/images/ข่าวประชาสัมพันธ์/2568/มกราคม/79/1.webp"
        ></Image>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div key={item.imgs}>
                <div className="scale-95 hover:scale-100 transition duration-500 rounded-full">
                  <Image src={item.imgs} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

{
  /* ***************************** LInk And PDF ***************************** */
}
{
  /* <div className="pt-4">
          <p className="text-sky-800 text-lg">
            รายชื่อนักเรียน ระดับประกาศนียบัตรวิชาชีพ (ปวช.)
          </p>
          <Link
            href="
https://cdn3.me-qr.com/pdf/2fd30bda-eb3a-4da3-abe1-ad5ee6429e7a.pdf?fbclid=IwZXh0bgNhZW0CMTAAAR0IMoDmXKnVoZf7tp4ITPz8_WgYF4yfnn0faZ_NIkfyDHFPsHUbXsRcpfI_aem_w8OfvxoMNFUMDrDWYGfYUQ
// "
            className="hover:text-sky-500"
            target="_blank"
          >
            https://drive.google.com/...
          </Link>

          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/38/1.pdf"
          ></iframe>
        </div> */
}

{
  /* ***************************** LInk And PDF ***************************** */
}

{
  /* ***************************** Youtube ***************************** */
}

{
  /* <div className="flex justify-center">
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
        </div> */
}

{
  /* ***************************** Youtube ***************************** */
}
