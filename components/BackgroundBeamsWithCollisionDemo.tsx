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

      <div className="flex justify-center pb-[200px] pt-[52px] px-8">
        <div>
          <iframe
            className="w-full h-full"
            src={
              "/images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/33/1.mp4?playlist=1.mp4&loop=1"
            }
          ></iframe>
          <br />
          <div>
            <p className="flex justify-center text-base">
              " Welcome Back to School! "
            </p>
            <p className="flex justify-center text-base">
              วิทยาลัยเทคนิคกันทรลักษ์ ยินดีต้อนรับ นักเรียน นักศึกษา
              เนื่องในโอกาสเปิดภาคเรียนที่ 2 ประจำปีการศึกษา 2567
            </p>
            <p className="flex justify-center text-base">
              👉เวลา 07.40 น.
              เริ่มทำกิจกรรมเข้าเเถวเคารพธงชาติโดยพร้อมเพียงกัน🇹🇭 **
            </p>
            <p className="flex justify-center text-base">
              ขอให้นักเรียน นักศึกษา ทุกคน พร้อมที่จะเรียนรู้ เก็บประสบการณ์
              เเละพัฒนาตนเอง เพื่อสิ่งที่ตั้งว้ในอนาคต
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
