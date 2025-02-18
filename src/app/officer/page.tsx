"use client"; // top to the file

import { Image } from "@nextui-org/react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data1, Data2, Data3, Data4 } from "./data";

export default function Officer() {
  return (
    <>
      <div>
        <div className="py-24">
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            ฝ่ายบริหารทรัพยากร
          </h1>
        </div>

        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data1.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
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
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            ฝ่ายแผนงานและความร่วมมือ
          </h1>
        </div>

        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data2.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
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
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
          </h1>
        </div>

        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data3.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
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
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            ฝ่ายวิชาการ
          </h1>
        </div>

        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data4.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
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
