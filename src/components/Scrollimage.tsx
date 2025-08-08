"use client";
import React from "react";
import { Carousel } from "antd";
import { Image } from "@nextui-org/react";

const Scrollimage: React.FC = () => (
  <>
    <div>
      <Carousel arrows infinite={true} autoplay autoplaySpeed={4000} adaptiveHeight>
        <div>
          <Image removeWrapper className="w-full" src="/images/ข่าวประชาสัมพันธ์/2568/สิงหาคม/44/00.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/8.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/1.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/2.webp" />
        </div>
      </Carousel>
    </div>
  </>
);

export default Scrollimage;
