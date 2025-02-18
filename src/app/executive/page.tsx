"use client";
// Executive;
import { Image } from "@nextui-org/react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data } from "./data";

export default function Executive() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          ทำเนียบผู้บริหาร
        </h1>
      </div>

      <div className="flex justify-center py-[48px]">
        <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
          <Image
            src={"/images/ผู้บริหาร/1.webp"}
            alt={"Lazy loaded image"}
            data-src="image.webp"
            loading="lazy"
          />
          <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
            <div className="hover:text-sky-500">นางสาวทักษิณา ชมจันทร์</div>
          </div>
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            ตำแหน่งผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
          </div>
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            เริ่มปฏิบัติงาน พ.ศ. 2566 จนถึง ปัจุบัน
          </div>
          <div className="flex justify-end">
            <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>CEO</span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                KTLTC
              </span>
            </button>
          </div>
        </BackgroundGradient>
      </div>

      <div>
        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <div className="flex justify-center">
                      <Image
                        src={item.img}
                        alt={"Lazy loaded image"}
                        data-src="image.webp"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                      <div className="hover:text-sky-500">{item.title}</div>
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.secondary}</div>
                      <div>{item.description}</div>
                    </div>
                    <div className="flex justify-end ">
                      <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                        <span>CEO</span>
                        <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
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
