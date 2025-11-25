import { Image } from "@heroui/image";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";

export default function Developing() {
  return (
    <>
      {/* ********************* ฝ่ายบริหารทรัพยากร ********************* */}
      <div className="">
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
            <Image src={"/images/ผู้บริหาร/2.webp"} alt={""} />
            <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-lg">
              นางสาววิภาวรรณ สีแดด
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              รองผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="mt-4 flex items-center space-x-1 rounded-full bg-black py-1 pl-2 pr-1 text-xs font-bold text-white dark:bg-zinc-800">
                <span>CEO</span>
                <span className="rounded-full bg-zinc-700 px-2 py-0 text-[0.6rem] text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-lg">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>{item.department}</div>
                      <div>{item.faction}</div>
                      <div>{item.description}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* ฝ่ายบริหารทรัพยากร ********************* */}
    </>
  );
}
