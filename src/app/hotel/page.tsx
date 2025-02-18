"use client"; // top to the file

import { Image } from "@nextui-org/react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function Hotel() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          แผนกวิชาการโรงแรม
        </h1>
      </div>

      <div className="">
        <Accordion isCompact>
          <AccordionItem
            key="1"
            aria-label="Accordion 1"
            title="คณะครู แผนกวิชาการโรงแรม"
            className=" border rounded-xl px-4 py-1 shadow-2xl "
          >
            <div className=" flex justify-center   ">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ">
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
                          <div> {item.description}</div>
                        </div>
                        <div className="flex justify-end ">
                          <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                            <span>แผนก</span>
                            <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                              การโรงแรม
                            </span>
                          </button>
                        </div>
                      </BackgroundGradient>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        <div className="justify-items-center pt-[24px]">
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100065239134417&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
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
