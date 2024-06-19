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
        <p>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </p>
        {DataDate.map((item) => (
          <div key={item.date}>
            <div className="text-xs text-slate-500">{item.date}</div>
          </div>
        ))}
        <div>
          {/* <Link
                      className="text-lg text-sky-500"
                      href="https://forms.gle/oBfcSbV3so6Ks5w59"
                    >
                      รูปภาพเพิ่มเติม
                    </Link> */}
        </div>
        <div>
          {/* <iframe
                      className="w-full aspect-video ..."
                      src="/images/ข่าวประชาสัมพันธ์/2567/มกราคม/57/4.mp4"
                    ></iframe> */}
        </div>
        <div className="flex justify-center ">
          <div className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className=" scale-90  hover:scale-110 transition duration-500 rounded-full ">
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
