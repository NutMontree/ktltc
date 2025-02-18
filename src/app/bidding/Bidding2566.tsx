"use client"; // top to the file

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// import required modules
import { FreeMode, Pagination } from "swiper/modules";

// technicalcollegeorders
import { dataBidding } from "./data/data";

import NextLink from "next/link";

export default function Bidding2566() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">2566</h1>

        <div className="swiper-2556">
          <Swiper
            slidesPerView={3}
            spaceBetween={30}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              340: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              700: {
                slidesPerView: 3,
                spaceBetween: 15,
              },
            }}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="max-w-[90%] lg:max-w-[80%]" // min-w-[90%]
          >
            {/* ดึงข้อมูลจากหน้า  DataPressRelease มาแสดงผลที่หน้า SwipperPressRelease*/}
            {dataBidding.navitems.map((item) => (
              <SwiperSlide key={item.name}>
                <NextLink key={item.href} href={item.href}>
                  <div className="mb-4 group relative shadow-lg text-white rounded-xl px-6 py-8  h-[150px] lg:h-[200px] lg:w-[full] overflow-hidden cursor-pointer lg:max-h-[180px] min-h-0 hover:min-h-ful">
                    <div
                      className="absolute inset-0 bg-contain bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover" //    lg:max-h-[180px] sm:max-h-[110px] rounded-lg
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}
