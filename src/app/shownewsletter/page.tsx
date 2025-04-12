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

import NextLink from "next/link";
import { Image } from "@nextui-org/react";

import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

import { Data } from "../newsletter/newsletter2568/newsletter6804/data";

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
      <div className="grid grid-flow-col py-4">
        <div className="justify-items-start">
          <div className="grid grid-flow-col">
            <div className="bg-red-500 w-2" />
            <div className="pl-4">
              <h1 className="text-xxl font-bold">จดหมายข่าว</h1>
              <h1 className="text-xxl text-[#DAA520]">Newsletter</h1>
            </div>
          </div>
        </div>
        <div className="justify-items-end">
          <div className=" ">
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
        </div>
      </div >

      <div className="py-3             
            grid gap-2
            grid-cols-1
            sm:grid-cols-1
            lg:grid-cols-3">
        {/* <Swiper
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
        > */}
        {Data.navItems.slice(0, 3).map((item) => (
          <SwiperSlide key={item.name}>
            <NextLink key={item.href} href={item.href}>
              <div
                className="
                mb-6 relative shadow-lg rounded-xl 
                h-[500px]
                xs:h-[500px] 
                sm:h-[750px]
                lg:h-[450px]
                xl:h-[600px]
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
                  <div className="flex gap-1">
                    <Image src='/images/icon/time-svgrepo-com.svg' alt='logo-youtube' className="pt-1" width={20} height={20} />
                    <div
                      className="text-xs text-slate-500
                              text-[12px] md:text-[14px] sm:text-sm md:text-base 
                              mb-10 pt-1 md:pt-0
                              "
                    >
                      {item.date}
                    </div>
                  </div>
                </div>
              </div>
            </NextLink>
          </SwiperSlide>
        ))}
        {/* </Swiper> */}
      </div>
    </>
  );
}
