"use client"
import React from "react";
import { Image } from "@heroui/react";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 justify-items-center justify-center pb-12 gap-8">
        {/* ******************************************* เรื่องที่ 1 ******************************************* */}
        <div className="">
          <div className="flex justify-center">
            <div className="">
              <div className="flex justify-center">
                <Image
                  isBlurred
                  //  className="scale-90 hover:scale-100 transition duration-500 rounded-xl shadow-2xl"
                  className="rounded-xl shadow-2xl"
                  src={"/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/3/00.webp"}
                  alt=''
                />
              </div>
            </div>
          </div>
          {/* <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base lg:text-base hidden xl:flex">
            <div className="px md:px-8 pt-2">
              วิทยาลัยเทคนิคกันทรลักษ์  <br />
            </div>
          </div> */}
        </div>
        {/* ******************************************* เรื่องที่ 1 ******************************************* */}
        {/* ******************************************* เรื่องที่ 2 ******************************************* */}
        <div className="">
          <div className="flex justify-center">
            <div className="">
              <div className="flex justify-center">
                <Image
                  isBlurred
                  //  className="scale-90 hover:scale-100 transition duration-500 rounded-xl shadow-2xl"
                  className="rounded-xl shadow-2xl"
                  src={"/images/ข่าวประชาสัมพันธ์/2568/กันยายน/37/1.webp"}
                  alt=''
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}