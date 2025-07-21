"use client"
import React from "react";
import { Image } from "@nextui-org/react";
import Link from "next/link";
// import { Cover } from "@/components/ui/cover";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      <div className="">
        {/* ******************************************* เรื่องที่ 1 ******************************************* */}
        <div className="pt-3 pb-[48px]">
          <div className="flex justify-center">
            <div className="flex justify-center">
              <div className="">
                <div className="flex justify-center">
                  <Image
                    className="scale-90 hover:scale-100 transition duration-500 rounded-lg"
                    src={"/images/ข่าวประชาสัมพันธ์/2568/กรกฎาคม/42/00.webp"}
                    alt=''
                  />
                </div>
                <div className="text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                  <div className="px md:px-8 pt-2">
                    <div className="text-center">
                      วิทยาลัยเทคนิคกันทรลักษ์
                      <br />
                      ผู้ว่าราชการจังหวัดศรีสะเกษ เชิญชวนพี่น้องชาวจังหวัดศรีสะเกษ แจ้งเบาะแสเกี่ยวกับยาเสพติด “แจ้ง จับ จบ” สยบยาเสพติด                       <br />
                      <p className="">จังหวัดศรีสะเกษ ผ่านช่องทาง ดังนี้</p>
                      <p className=""> ๑. สแกน QR Code  แอปพลิเคชันไลน์ แจ้งเบาะแสยาเสพติดสายตรงผู้ว่าราชการจังหวัดศรีสะเกษ </p>
                      <p className="">๒. แจ้งเบาะแสผ่านช่องทาง สายด่วน ป.ป.ส. 1386 </p>
                      <p className="">  ๓. สายด่วนศูนย์ดำรงธรรม 1567</p>
                      <p className=""> ๔. หรือศูนย์ดำรงธรรมอำเภอ ทุกอำเภอ</p>
                      <p className="">และสามารถสมัครใจเข้ารับการ บำบัดฟรี ไม่เสียประวัติ  ไม่มีความผิด</p>
                      <p className="">วิทยาลัยเทคนิคกันทรลักษ์ รวมพลังหยุดยั้งภัยยาเสพติด
                        <p className="text-sky-600 dark:text-sky-300">
                          “ปฏิเสธผู้ค้า รักษาผู้เสพ”
                        </p>
                      </p>
                      <p className="text-sky-600 dark:text-sky-300">"คนเมืองศรี เป็นหนึ่งโดย ไม่พึ่งยาเสพติด"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ******************************************* เรื่องที่ 1 ******************************************* */}

        {/* ******************************************* เรื่องที่ 2 ******************************************* */}
        {/* <div className="pb-[48px] py-[48px]">
              <div className="flex justify-center">
                <div className="flex justify-center">
                  <div className="">
                    <div className="flex justify-center">
                      <Image
                        // className="h-[300px] sm:h-[600px] lg:h-[600px] xl:h-[600px]"
                        className="scale-90 hover:scale-100 transition duration-500 rounded-lg"
                        src={"/images/14.webp"}
                      />
                    </div>
                    <div className="text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                      <div className="text-center pt-2">
                        วิทยาลัยเทคนิคกันทรลักษ์
                        <br />
                        เป็นสถานศึกษา เขตปลอดบุหรี่ตามกฎหมาย <br />
                        ห้าม‼️ นำเข้าสถานศึกษา หากฝ่าฝืนมีโทษตามกฎหมายทันที
                        <br />
                        สามารถเข้ารับการปรึกษาได้ที่
                      </div>
                      <div className="flex gap-4">
                        <div>👉 ช่องทางเพจ</div>
                        <Link
                          href="https://www.facebook.com/profile.php?id=61571228871228"
                          target="_blank"
                          className="hover:text-sky-600"
                        >
                          ตู้เสมารักษ์ สถานศึกษาสีขาว วิทยาลัยเทคนิคกันทรลักษ์
                        </Link>
                      </div>
                      <div className="flex  gap-4">
                        <div>👉 ช่องทางไลน์</div>
                        <Link
                          href="https://line.me/ti/g/EkPDxkVehb"
                          target="_blank"
                          className="hover:text-sky-600"
                        >
                          https://line.me/ti/g/EkPDxkVehb
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
        {/* ******************************************* เรื่องที่ 2 ******************************************* */}
      </div >

    </>
  );
}
