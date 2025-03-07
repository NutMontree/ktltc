"use client"; // top to the file

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import Swiper core and required modules
import { Navigation, Scrollbar, A11y, FreeMode } from "swiper/modules";

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

import { Data } from "../newsletter/newsletter2568/newsletter6803/data";

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

export default function ShowNewsletter() {
  const { styles } = useStyle();
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xxl pt-3 font-bold">
          จดหมายข่าว
        </h1>
      </div>

      <div className="flex justify-center">
        <h1 className="flex justify-center text-xxl text-[#DAA520] ">
          Newsletter
        </h1>
      </div>

      <div className="flex justify-end pt-3">
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
              href="/newsletter"
            >
              เนื้อหาเพิ่มเติม
            </Button>
          </Space>
        </ConfigProvider>
      </div>

      <div className="py-3">
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
            800: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
          }}
          freeMode={true}
          modules={[Navigation, Scrollbar, A11y, FreeMode]}
          spaceBetween={24}
          slidesPerView={3}
          navigation={true}
          scrollbar={{ draggable: true }}
          onSwiper={(swiper) => console.log(swiper)}
          onSlideChange={() => console.log("slide change")}
        >
          {Data.navItems.map((item) => (
            <SwiperSlide key={item.name}>
              <NextLink key={item.href} href={item.href}>
                <div
                  className="
                mb-6 relative shadow-lg rounded-xl 
                h-[250px]
                xs:h-[200px] 
                sm:h-[300px]
                lg:h-[400px]
                xl:h-[500px]
                lg:w-[full] overflow-hidden 
                "
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
                  <div>
                    <div className="text-sm">{item.description}</div>
                    <div className="text-xs text-slate-500 pb-12">
                      {item.date}
                    </div>
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
