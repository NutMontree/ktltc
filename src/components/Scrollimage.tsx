"use client";
import React from "react";
import { Carousel } from "antd";
import { Image } from "@nextui-org/react";

const Scrollimage: React.FC = () => (
  <>
    <div>
      <Carousel arrows infinite={true} autoplay autoplaySpeed={4000} adaptiveHeight>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/19.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/17.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/18.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/8.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/1.webp" />
        </div>
        <div>
          <Image removeWrapper className="w-full" src="/images/ปก/2.webp" />
        </div>
      </Carousel>
    </div>
  </>
);

export default Scrollimage;
