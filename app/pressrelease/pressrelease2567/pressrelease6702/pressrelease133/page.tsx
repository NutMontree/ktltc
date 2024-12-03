"use client"; // top to the file
import React from "react";

import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease() {
  return (
    <>
      <div className="text-center text-xl pb-6">
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

      <div className="date">
        {DataDate.map((item) => (
          <div key={item.date}>
            <div className="text-xs text-slate-500">{item.date}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center ">
          {ImageItem.map((item) => (
            <div key={item.img}>
              <div className="scale-90 hover:scale-110 transition duration-500 rounded-full ">
                <Image src={item.img} alt={""}></Image>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
