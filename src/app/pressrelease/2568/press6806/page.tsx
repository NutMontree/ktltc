"use client"; // top to the file

import NextLink from "next/link";
import { DataPressrelease } from "./data";
import Pressrelease2568 from "../page";
import { Image } from "@nextui-org/react";

export default function Page() {
  return (
    <>
      <Pressrelease2568 />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          เดือน มิถุนายน 2568
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4">
          <div
            className=" 
            grid gap-2
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
           "
          >
            {DataPressrelease.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div
                  className="mb-2 group relative rounded-xl cursor-pointer 
                  h-[170px]
                  sm:h-[170px]
                  md:h-[210px]
                  lg:h-[210px]
                  xl:h-[300px]
                "
                >
                  <div
                    className="absolute inset-0 bg-cover bg-top hover:scale-100 transition duration-500 cursor-pointer object-cover scale-95 rounded-xl"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-[14px] md:text-[20px] sm:text-sm md:text-base text-sky-600 hover:text-sky-400" >
                    {item.name}
                  </h1>
                  <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base mb-2 flex">
                    <div>
                      {item.description}
                      < p className="text-gray-500">
                        ...ดูเพิ่มเติม
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Image src='/images/icons8-calendar.gif' alt='logo-youtube' width={20} height={20} />
                    <div className="text-xs text-slate-500 text-[12px] md:text-[14px] sm:text-sm md:text-base">
                      {item.date}
                    </div>
                  </div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
