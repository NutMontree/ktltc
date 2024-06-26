"use client"; // top to the file

// technicalcollegeorders
import { DataPressrelease6702 } from "./data";

import NextLink from "next/link";

export default function Pressrelease6702() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          เดือน กุมภาพันธ์ 2567
        </h1>
      </div>

      <div className="2556">
        <div className="flex justify-center pt-4">
          <div className="grid grid-rows-2 gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3  justify-items-center justify-center ">
            {DataPressrelease6702.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div className="mb-2 group relative rounded-xlcursor-pointer min-h-52 hover:min-h-ful">
                  <div
                    className="absolute inset-0 bg-contain bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover scale-90  rounded-xl" //    lg:max-h-[180px] sm:max-h-[110px] rounded-lg
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div className=" ">
                  <h1 className="text-lg lg:text-1xl text-sky-600  ">
                    {item.name}
                  </h1>
                  <div className="text-sm  ">{item.description}</div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
