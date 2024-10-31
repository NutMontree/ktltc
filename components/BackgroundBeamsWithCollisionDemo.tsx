import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      {/* <Link href="pressrelease450">
        <BackgroundBeamsWithCollision>
          <div className="scale-95 hover:scale-110 duration-500 justify-center">
            <Image
              className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px]"
              src={"/images/ข่าวประชาสัมพันธ์/2567/กันยายน/56/2.webp"}
              alt={""}
            />
          </div>
        </BackgroundBeamsWithCollision>
      </Link> */}
      <Link href="pressrelease460">
        <div className="flex justify-center px-8">
          <div>
            <div className="flex justify-center">
              <Image
                className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px] "
                src={"/images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/54/1.webp"}
              />
            </div>

            <br />

            <div>
              <p className="flex justify-center text-base">" ประกาศรายชื่อ "</p>
              <p className="flex justify-center text-base">
                ผลการสอบคัดเลือก ตำเเหน่ง ครูพิเศษสอน สาขาวิชาช่างไฟฟ้ากำลัง
                ผู้ที่มีรายชื่อลำดับที่ 1 ให้มารายงานตัวตามวันเวลาที่กำหนด
              </p>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
