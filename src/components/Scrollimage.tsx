"use client";
import React from "react";
import { Carousel } from "antd";
import { Image } from "@nextui-org/react";
import { motion } from "framer-motion";

const Scrollimage: React.FC = () => (
  <>
    <motion.section
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className=""
    >
      <motion.div
        className="text-gray-600 mt-4 text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
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
      </motion.div>
    </motion.section>


  </>
);

export default Scrollimage;
