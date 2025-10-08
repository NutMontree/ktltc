"use client"
import React from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Image, } from "@nextui-org/react";
export default function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <div className="py-24">
        <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12">
          <GridItem
            area="md:[grid-area:1/1/2/13] flex items-center justify-center"
            title={<div className="pt-6">ทรงพระเจริญ</div>}
            description={<div className="pt-2 pb-6">๘ ตุลาคม ๒๕๖๘ เนื่องในวันคล้ายวันประสูติ พระเจ้าวรวงศ์เธอ พระองค์เจ้าสิริภาจุฑาภรณ์ ด้วยเกล้าด้วยกระหม่อมขอเดชะ ข้าพระพุทธเจ้า คณะผู้บริหาร ครู บุคลากรทางการศึกษา เเละนักเรียน นักศึกษา วิทยาลัยเทคนิคกันทรลักษ์</div>}
            image={<><Image className="" isBlurred src={"/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/18/00.webp"} alt={""}></Image></>}
          />
        </ul>
      </div>

      <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12">
        <GridItem
          area="md:[grid-area:2/1/2/7] flex items-center justify-center"
          image={<><Image className="" isBlurred src={"/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/3/00.webp"} alt={""}></Image></>} title={""} description={undefined}

        />

        <GridItem
          area="md:[grid-area:2/7/2/13] flex items-center justify-center"
          image={<><Image className="" isBlurred src={"/images/ข่าวประชาสัมพันธ์/2568/กันยายน/37/1.webp"} alt={""}></Image></>} title={""} description={undefined} />
      </ul>
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
    <li className={`  ${area}`}>
      <div className="relative h-full rounded-2xl  p-2 md:rounded-3xl ">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className=" ">
          <div className="">
            <div>{image}</div>

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
      </div>
    </li>
  );
};
