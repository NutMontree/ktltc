"use client";
import React from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Image } from "@heroui/react";
import { motion } from "framer-motion";
import { LinkPreview } from "./ui/link-preview";

export default function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <div className="py-24">
          <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12">
            <GridItem
              area="md:[grid-area:1/1/2/13] flex items-center justify-center"
              title={<div className="pt-6">๒๔ ตุลาคม ๒๕๖๘</div>}
              description={
                <div className="pt-2 pb-6">
                  สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ
                  <br />
                  พระบรมราชชนนีพันปีหลวง เสด็จสวรรคต
                  <br />
                  ธ สถิตในดวงใจไทยนิรันดร์
                  <br />
                  ด้วยเกล้าด้วยกระหม่อมขอเดชะ ข้าพระพุทธเจ้า
                  <br />
                  คณะผู้บริหาร ครู บุคลากรทางการศึกษา เเละนักเรียน นักศึกษา{" "}
                  <br />
                  วิทยาลัยเทคนิคกันทรลักษ์
                </div>
              }
              image={
                <>
                  <Image
                    className="rounded-xl"
                    isBlurred
                    src={"/63/00.webp"}
                    alt={""}
                  ></Image>
                </>
              }
            />
          </ul>
        </div>

        <GridItem
          area="md:[grid-area:2/7/2/13] flex items-center justify-center"
          image={
            <>
              <LinkPreview url="https://ktltcv2.vercel.app/pressrelease/2568/press6810/press77">
                <Image
                  className="rounded-xl"
                  isBlurred
                  src={"/77/00.webp"}
                  alt={""}
                ></Image>
              </LinkPreview>
            </>
          }
          title={""}
          description={undefined}
        />
      </motion.div>
    </>
  );
}

interface GridItemProps {
  area: string;
  title: React.ReactNode;
  description: React.ReactNode;
  image: React.ReactNode;
}

const GridItem = ({ area, image, title, description }: GridItemProps) => {
  return (
    <li className={` ${area}`}>
      <div className="relative h-full rounded-3xl p-2 md:rounded-3xl">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="m-4">
          <div className="">{image}</div>

          <div className="space-y-3 text-center">
            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
              {title}
            </h3>
            <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
              {description}
            </h2>
          </div>
        </div>
      </div>
    </li>
  );
};
