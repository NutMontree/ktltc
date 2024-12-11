import React from "react";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import { Cover } from "@/components/ui/cover";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      {/* ******************************************* เรื่องที่ 1 ******************************************* */}

      <div className="py-4 px-8 pb-[48px]">
        <Cover className="flex justify-center">
          <Link href="/pressrelease/pressrelease2567/pressrelease6712/pressrelease562">
            <div className="flex justify-center">
              <div>
                <div className="flex justify-center">
                  <Image
                    className="h-[150px] sm:h-[280px] lg:h-[400px] xl:h-[600px]"
                    src={"/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/19/1.webp"}
                  />
                </div>
                <div className="text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base px-8">
                  <div className="text-center pt-6 text-[14px] md:text-[20px] sm:text-sm md:text-base">
                    🎊 Dek68 รอบโควตา
                  </div>
                  เตรียมความพร้อมรายงานตัวเข้าศึกษาต่อในรั้ววิทยาลัยเทคนิคกันทรลักษ์
                  ในวันพฤหัสบดีที่ 12 ธันวาคม 2567 นี้
                  <br />
                  โดยให้ผู้ปกครอง นักเรียน นักศึกษา
                  เตรียมค่าใช้จ่ายในการรายงานตัว ประจำปีการศึกษา 2568 ดังนี้
                  <br />
                  👉 ระดับ ประกาศนียบัตรวิชาชีพ (ปวช.)
                  <br />
                  🎀 รวม 1,170. - บาท
                  <br />
                  👉 ระดับ ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) 🎀 รวม 1,570. -
                  บาท
                  <br />
                  #เด็กเทคนิคกันท์ อย่าลืมต้อนรับน้องๆกันด้วยนะค้าบ
                  <br />
                </div>
              </div>
            </div>
          </Link>
        </Cover>
      </div>
      {/* ******************************************* เรื่องที่ 1 ******************************************* */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 px-8 border-t pt-[48px]">
        <Cover className="flex justify-center">
          <Link href="/pressrelease/pressrelease2567/pressrelease6712/pressrelease565">
            <div className="flex justify-center">
              <div>
                <div className="flex justify-center">
                  <Image
                    className="h-[300px] sm:h-[370px] lg:h-[500px] xl:h-[600px] "
                    src={"/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/22/1.webp"}
                  />
                </div>
                <div className="text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base pt-4 px-8">
                  ประกาศรายชื่อผู้มีสิทธิ์เข้ารายงานตัว
                  <br /> รอบโควตา ประจำปีการศึกษา 2568 <br />
                  ระดับ ปวช. เเละ ระดับ ปวส. <br />
                  ในวันพฤหัสบดีที่ 12 ธันวาคม 2567 <br />ณ
                  ห้องประชุมอาคารเฉลิมพระเกียรติ วิทยาลัยเทคนิคกันทรลักษ์
                </div>
              </div>
            </div>
          </Link>
        </Cover>

        <Cover className="flex justify-center ">
          <Link href="/pressrelease/pressrelease2567/pressrelease6711/pressrelease482">
            <div className="flex justify-center">
              <div>
                <div className="flex justify-center">
                  <Image
                    // className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px] "
                    className="h-[300px] sm:h-[370px] lg:h-[500px] xl:h-[600px] "
                    src={"/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/19/1.webp"}
                  />
                </div>
                <div>
                  <div className="flex justify-center text-base text-center text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base pt-4">
                    วันอังคารที่ 12 พฤศจิกายน 2567 วิทยาลัยเทคนิคกันทรลักษ์
                  </div>
                  <div className="">
                    <div className=" text-center text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                      แจ้ง‼️ผลการเรียน ของนักเรียน นักศึกษา ภาคเรียนที่ 1
                      ปีการศึกษา 2567
                    </div>
                    <div className="text-sky-800 text-lg  text-center text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                      สามารถดูได้ผ่านระบบลิ้งค์
                    </div>
                    <div className=" flex justify-center ">
                      <Link
                        href="
                    https://std2018.vec.go.th/web/
                    "
                      >
                        <div className="hover:text-sky-500 text-center text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                          https://std2018.vec.go.th/web/
                        </div>
                      </Link>
                    </div>
                    <div className="flex justify-center text-center text-[10px] md:text-[12px] sm:text-sm md:text-base lg:text-base ">
                      หรือสแกน qr code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Cover>
      </div>
    </>
  );
}
