import React from "react";
import { Carousel } from "antd";
import { Image } from "@nextui-org/react";

const Scrollimage: React.FC = () => (
  <Carousel arrows infinite={true} autoplay>
    <div>
      <Image removeWrapper className="w-full" src="/images/1.webp" />
    </div>
    <div>
      <Image removeWrapper className="w-full" src="/images/4.webp" />
    </div>
    <div>
      <Image removeWrapper className="w-full" src="/images/2.webp" />
    </div>
  </Carousel>
);

export default Scrollimage;
