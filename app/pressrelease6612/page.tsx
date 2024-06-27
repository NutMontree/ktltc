// Pressrelease6612
"use client"; // top to the file
// หน้าหลัก ข่าวประชาสัมพันธ์

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// import required modules
import { FreeMode, Pagination } from "swiper/modules";

// technicalcollegeorders
import { DataPressrelease6612 } from "./data";

import NextLink from "next/link";
import PressReleasePage from "../pressrelease/page";

export default function Pressrelease6612() {
  return (
    <>
      <PressReleasePage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          เดือน ธันวาคม 2566
        </h1>
      </div>

      <div className="flex justify-center pt-4">
        <div className="grid grid-rows-2 gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3  justify-items-center justify-center ">
          {DataPressrelease6612.navItems.map((item) => (
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
    </>
  );
}
