"use client"; // top to the file

import { Image } from "@heroui/image";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data1, Data2, Data3, Data4 } from "./data";

export default function Officer() {
  return (
    <>
      <div>
        <div className="py-24">
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            ฝ่ายบริหารทรัพยากร
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data1.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
                      <div className="hover:text-sky-500">{item.name}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>เจ้าหน้าที่งาน : {item.position}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="py-24">
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            ฝ่ายแผนงานและความร่วมมือ
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data2.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
                      <div className="hover:text-sky-500">{item.name}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>เจ้าหน้าที่งาน : {item.position}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="py-24">
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data3.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
                      <div className="hover:text-sky-500">{item.name}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>เจ้าหน้าที่งาน : {item.position}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="py-24">
          <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
            ฝ่ายวิชาการ
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data4.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
                      <div className="hover:text-sky-500">{item.name}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>เจ้าหน้าที่งาน : {item.position}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
