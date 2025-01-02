"use client"; // top to the file

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import Swiper core and required modules
import {
  Navigation,
  Scrollbar,
  A11y,
  Autoplay,
  FreeMode,
} from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

// import required modules
import NextLink from "next/link";

import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

import { DataPressrelease } from "../pressrelease/pressrelease2568/pressrelease6801/data";

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: "";

        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));
export default function ShowPressRelease() {
  const { styles } = useStyle();
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
        <ConfigProvider
          button={{
            className: styles.linearGradientButton,
          }}
        >
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
            400: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            800: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
            1000: {
              slidesPerView: 5,
              spaceBetween: 15,
            },
            1400: {
              slidesPerView: 6,
              spaceBetween: 15,
            },
          }}
          freeMode={true}
          modules={[Navigation, Scrollbar, A11y, Autoplay, FreeMode]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{
            clickable: true,
          }}
          scrollbar={{ draggable: true }}
          onSwiper={(swiper) => console.log(swiper)}
          onSlideChange={() => console.log("slide change")}
          centeredSlides={true}
          autoplay={{
            delay: 10500,
            disableOnInteraction: false,
          }}
          className="mySwiper"
        >
          {DataPressrelease.navItems.map((item) => (
            <SwiperSlide key={item.name}>
              <NextLink key={item.href} href={item.href}>
                <div
                  className="
                  mb-6 relative shadow-lg rounded-xl 
                  h-[150px]
                  sm:h-[200px]
                  md:h-[200px]
                  lg:h-[200px]
                  xl:h-[200px]
                  2xl:h-[250px]
                  overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat bg-center hover:scale-110 duration-500"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div className=" ">
                  <h1
                    className="
                              text-[14px] md:text-[20px] sm:text-sm md:text-base 
                            text-sky-600  
                  "
                  >
                    {item.name}
                  </h1>
                  <div
                    className=" 
                              text-[12px] md:text-[14px] sm:text-sm md:text-base 
                              mb-8
                              "
                  >
                    {item.description}
                  </div>
                </div>
              </NextLink>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
