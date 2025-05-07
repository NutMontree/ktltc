"use client"; // top to the file
// Mechanic

import { Image } from "@nextui-org/react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";

export default function Mechanic() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          แผนกวิชาช่างยนต์
        </h1>
      </div>

      <div className=" flex justify-center   ">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
          {Data.map((item) => (
            <div className="" key={item.img}>
              <div className="scale-100">
                <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                  <Image className="" src={item.img} alt={""}></Image>
                  <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                    <div className="hover:text-sky-500">{item.name}</div>
                  </div>
                  <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    <div>{item.position}</div>
                    <div>แผนกวิชา : {item.department}</div>
                    <div> {item.faction}</div>
                    <div>ตำแหน่ง {item.description}</div>
                  </div>
                  <div className="flex justify-end ">
                    <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                      <span>แผนก</span>
                      <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                        ช่างยนต์
                      </span>
                    </button>
                  </div>
                </BackgroundGradient>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
