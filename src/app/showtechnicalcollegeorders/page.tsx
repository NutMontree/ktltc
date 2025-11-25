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
// import { Data } from "../technicalcollegeorders/technical2568/technical6802/data";
import { Data } from "../technicalcollegeorders/Technical2567/technical6712/data";
import { motion } from "framer-motion";

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

export default function ShowTechnicalcollegeorders() {
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
              <div className="w-2 bg-red-500" />
              <div className="pl-4">
                <h1 className="text-xxl font-bold">คำสั่งวิทยาลัยเทคนิค</h1>
                <h1 className="text-xxl text-[#DAA520]">Technical College</h1>
              </div>
            </div>
          </div>
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
            {Data.navItems.map((item, index) => (
              <SwiperSlide key={`${item.href}-${index}`}>
                <NextLink href={item.href}>
                  <div className="relative mb-6 h-[150px] overflow-hidden rounded-xl shadow-lg sm:h-[300px]">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-500 hover:scale-110"
                      style={{
                        backgroundImage: `url(${item.backgroundImage})`,
                      }}
                    />
                  </div>
                  <div className=" ">
                    <h1 className="text-3.5 text-sky-600 sm:text-sm md:text-base md:text-[20px]">
                      {item.name}
                    </h1>
                    <div className="text-3 md:text-3.5 mb-8 sm:text-sm md:text-base">
                      {item.description}
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
                  href="/technicalcollegeorders"
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
