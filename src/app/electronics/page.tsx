"use client"; // top to the file

import { Image } from "@heroui/image";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";
import { Accordion, AccordionItem } from "@heroui/react";

export default function Electronics() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
          แผนกวิชาช่างอิเล็กทรอนิกส์
        </h1>
      </div>

      <div className="">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 sm:p-4 dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mt-4 mb-2 text-center text-base text-black sm:text-xl dark:text-neutral-200">
                      <div className="hover:text-sky-500">{item.name}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>แผนกวิชา : {item.department}</div>
                      <div> {item.faction}</div>
                      <div> {item.description}</div>
                    </div>
                    <div className="flex justify-end">
                      <button className="mt-4 flex items-center space-x-1 rounded-full bg-black py-1 pr-1 pl-2 text-xs font-bold text-white dark:bg-zinc-800">
                        <span>แผนก</span>
                        <span className="rounded-full bg-zinc-700 px-2 py-0 text-[0.6rem] text-white">
                          ช่างอิเล็กทรอนิกส์
                        </span>
                      </button>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="justify-items-center pt-6">
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fktltc.ac.th.en&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
            width="340"
            height="500"
            scrolling="no"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>
    </>
  );
}
