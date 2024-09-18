import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <Link href="pressrelease385">
        <BackgroundBeamsWithCollision>
          <div className="scale-95 hover:scale-110 duration-500 justify-center">
            <Image
              className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px]"
              src={"/images/ข่าวประชาสัมพันธ์/2567/กันยายน/33/1.webp"}
              alt={""}
            />
          </div>
        </BackgroundBeamsWithCollision>
      </Link>
    </>
  );
}
