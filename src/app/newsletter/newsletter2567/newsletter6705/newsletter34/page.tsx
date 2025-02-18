"use client"; // top to the file
import React from "react";

import { DataDate, Data, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease() {
  return (
    <>
      <div>
        <div className="text-center text-xl pb-6 px-2">
          {Data.Item.map((item) => (
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
        {DataDate.map((item) => (
          <div key={item.date}>
            <div className="text-xs text-slate-500">{item.date}</div>
          </div>
        ))}
        <div className="flex justify-center">
          <div className="w-fit mx-auto grid justify-items-center justify-center">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-95 hover:scale-100 transition duration-500 rounded-full">
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
