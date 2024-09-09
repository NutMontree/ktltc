"use client"; // top to the file

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import Swiper core and required modules
import { Navigation, Scrollbar, A11y } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

// import required modules
import NextLink from "next/link";

import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { DataPressrelease } from "../pressrelease6709/data";

export default function ShowPressRelease() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xxl pt-3 font-bold">
          ข่าวประชาสัมพันธ์
        </h1>
      </div>

      <div className="flex justify-center">
        <h1 className="flex justify-center text-xxl text-[#DAA520] ">
          Press Release Page
        </h1>
      </div>
      <div className="flex justify-end px-6 pt-3">
        <ConfigProvider>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<AntDesignOutlined />}
              href="/pressrelease"
            >
              เนื้อหาเพิ่มเติม
            </Button>
          </Space>
        </ConfigProvider>
      </div>

      <div className="px-6 py-3">
        <Swiper
          breakpoints={{
            0: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            340: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1000: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
          }}
          freeMode={true}
          modules={[Navigation, Scrollbar, A11y]}
          spaceBetween={24}
          slidesPerView={3}
          navigation={true}
          scrollbar={{ draggable: true }}
          onSwiper={(swiper) => console.log(swiper)}
          onSlideChange={() => console.log("slide change")}
        >
          {DataPressrelease.navItems.map((item) => (
            <SwiperSlide key={item.name}>
              <NextLink key={item.href} href={item.href}>
                <div className="mb-6 relative shadow-lg rounded-xl h-[110px] sm:h-[150px] lg:h-[200px] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat bg-center bg-top hover:scale-110 duration-500"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div className=" ">
                  <h1 className="text-lg lg:text-1xl text-sky-600  ">
                    {item.name}
                  </h1>
                  <div className="text-sm mb-8">{item.description}</div>
                </div>
              </NextLink>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
