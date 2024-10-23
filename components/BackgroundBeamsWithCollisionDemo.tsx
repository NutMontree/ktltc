import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      {/* <Link href="pressrelease409">
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

      <div className="flex justify-center px-8">
        <div>
          <div className="flex justify-center">
            <Image
              className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px] "
              src={"images/ข่าวประชาสัมพันธ์/2567/ตุลาคม/39/1.webp"}
            />
          </div>

          <br />
          <div>
            <p className="flex justify-center text-base">" วันปิยมหาราช "</p>
            <p className="flex justify-center text-base">
              ๒๓ ตุลาคม ๒๕๖๗ " วันปิยมหาราช "
              พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว ปวงข้าพระพุทธเจ้า
              น้อมรำลึกในพระมหากรุณาธิคุณ
            </p>
            <p className="flex justify-center text-base">
              👉ด้วยเกล้าด้วยกระหม่อมขอเดชะ ข้าพระพุทธเจ้า คณะผู้บริหาร ครู
              บุคลากรทางการศึกษา เเละนักเรียน นักศึกษา วิทยาลัยเทคนิคกันทรลักษ์
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
