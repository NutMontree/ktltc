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
import { motion } from "framer-motion";

import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { DataAnnouncement } from "../announcement/announcement2568/announcement6810/data";

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

export default function ShowAnnouncement() {
  const { styles } = useStyle();
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <div className="grid grid-flow-col py-4">
          <div className="justify-items-start">
            <div className="grid grid-flow-col">
              <div className="bg-red-500 w-2" />
              <div className="pl-4">
                <h1 className="text-xxl font-bold">ข่าวประกาศ</h1>
                <h1 className="text-xxl text-[#DAA520]">Announcement New</h1>
              </div>
            </div>
          </div>
        </div >

        <div className=" py-3">
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
                slidesPerView: 2,
                spaceBetween: 15,
              },
              900: {
                slidesPerView: 3,
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
            {DataAnnouncement.navItems.slice(0, 3).map((item, index) => (
              <SwiperSlide key={`${item.href}-${index}`}>
                <NextLink href={item.href} passHref>
                  <div
                    className="
                  mb-6 relative shadow-lg rounded-xl 
                  h-[150px]
                  sm:h-[300px]
                  overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-no-repeat bg-center hover:scale-110 duration-500   "
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
                              ">
                      {item.name}
                    </h1>
                    <div
                      className=" 
                              text-[12px] md:text-[14px] sm:text-sm md:text-base 
                              ">
                      {item.description}
                    </div>
                    <div className="flex gap-1">
                      <Image src='/images/icons8-calendar.gif' alt='logo-youtube' width={20} height={20} />
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
                </NextLink>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="justify-items-center pt-4">
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
                  href="/announcement"
                >
                  เนื้อหาทั้งหมด
                </Button>
              </Space>
            </ConfigProvider>
          </div>
        </div>
      </motion.div>
    </>
  );
}
