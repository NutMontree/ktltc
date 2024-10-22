import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <Link href="pressrelease409">
        <BackgroundBeamsWithCollision>
          <div className="scale-95 hover:scale-110 duration-500 justify-center">
            <Image
              className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px]"
              src={"/images/ข่าวประชาสัมพันธ์/2567/กันยายน/56/2.webp"}
              alt={""}
            />
          </div>
        </BackgroundBeamsWithCollision>
      </Link>

      <div className="flex justify-center pb-[150px] pt-[52px] px-8">
        <div>
          <iframe
            className="w-full h-full"
            src={
              "images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/37/1.mp4?playlist=1.mp4&loop=1"
            }
          ></iframe>
          <br />
          <div>
            <p className="flex justify-center text-base">
              วิทยาลัยเทคนิคกันทรลักษ์ " ยินดีต้อนรับ "
            </p>
            <p className="flex justify-center text-base">
              คณะผู้บริหารอาชีวศึกษาจังหวัดศรีสะเกษ เนื่องในโอกาส
              “การประชุมสัญจร ผู้บริหารอาชีวศึกษาจังหวัดศรีสะเกษ”(สอจ.ศก.)
              ครั้งที่ 1
            </p>
            <p className="flex justify-center text-base">
              ในวันที่ 22 ตุลาคม 2567 ณ ห้องประชุมอาคารเฉลิมพระเกียรติ
              วิทยาลัยเทคนิคกันทรลักษ์
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
