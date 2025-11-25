"use client";
// Executive;
import { Image } from "@heroui/image";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";

export default function Executive() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
          ทำเนียบผู้บริหาร
        </h1>
      </div>

      <div className="flex justify-center py-[48px]">
        <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
          <Image
            src={"/images/ผู้บริหาร/1.webp"}
            alt={"Lazy loaded image"}
            data-src="image.webp"
            loading="lazy"
          />
          <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
            <div className="hover:text-sky-500">นางสาวทักษิณา ชมจันทร์</div>
          </div>
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            ตำแหน่งผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
          </div>
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            เริ่มปฏิบัติงาน พ.ศ. 2566 จนถึง ปัจุบัน
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

      <div>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Data.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-4">
                    <div className="flex justify-center">
                      <Image
                        src={item.img}
                        alt={"Lazy loaded image"}
                        data-src="image.webp"
                        loading="lazy"
                      />
                    </div>
                    <div className="mb-2 mt-4 text-center text-base text-black dark:text-neutral-200 sm:text-xl">
                      <div className="hover:text-sky-500">{item.title}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.secondary}</div>
                      <div>{item.description}</div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
