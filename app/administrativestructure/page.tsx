"use client"; // top to the file

import { Image } from "@nextui-org/react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data, Data1, Data2, Data3, Data4 } from "./data";

export default function AdministrativeStructure() {
  return (
    <>
      <div className="pb-10">
        <h1 className="flex justify-center text-[18px] sm:text-[24px] md:text-[30px] lg:text:[34px] text-[#DAA520] ">
          แผนภูมิโครงสร้างการบริหารงานสถานศึกษา
        </h1>
      </div>
      {/* ********************* คณะกรรมการบริหารสถานศึกษา ********************* */}
      <div>
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
            <Image src={"/images/ผู้บริหาร/1.webp"} alt={""} />
            <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
              นางสาวทักษิณา ชมจันทร์
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>CEO</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className=" flex justify-center   ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.secondary}</div>
                      <div>{item.description}</div>
                      <div>{item.faction}</div>
                    </div>
                    <div className="flex justify-end">
                      <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                        <span>CEO</span>
                        <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                          KTLTC
                        </span>
                      </button>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* คณะกรรมการบริหารสถานศึกษา ********************* */}

      {/* ********************* ฝ่ายพัฒนากิจการนักเรียน นักศึกษา ********************* */}
      <div className=" py-[64px] ">
        <h1 className="flex justify-center text-xl text-[#DAA520] py-[24px] ">
          ฝ่ายพัฒนากิจกรรมนักเรียน
        </h1>
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
            <Image src={"/images/ผู้บริหาร/2.webp"} alt={""} />
            <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
              นางสาววิภาวรรณ สีแดด
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              รองผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>CEO</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className=" flex justify-center ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data1.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>{item.department}</div>
                      <div>{item.faction}</div>
                      <div>{item.description}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* ฝ่ายพัฒนากิจกรรมนักเรียน ********************* */}

      {/* ********************* ฝ่ายแผนงานและความร่วมมือ ********************* */}
      <div className=" py-[64px] ">
        <h1 className="flex justify-center text-xl text-[#DAA520] py-[24px] ">
          ฝ่ายแผนงานและความร่วมมือ
        </h1>
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
            <Image src={"/images/ผู้บริหาร/3.webp"} alt={""} />
            <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
              นายสมศักดิ์ จันทานิตย์
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              รองผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>CEO</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className=" flex justify-center ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data2.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>{item.department}</div>
                      <div>{item.faction}</div>
                      <div>{item.description}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* ฝ่ายแผนงานและความร่วมมือ ********************* */}

      {/* ********************* ฝ่ายบริหารทรัพยากร ********************* */}
      <div className=" py-[64px] ">
        <h1 className="flex justify-center text-xl text-[#DAA520] py-[24px] ">
          ฝ่ายบริหารทรัพยากร
        </h1>
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
            <Image src={"/images/ผู้บริหาร/5.webp"} alt={""} />
            <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
              นางสาวภวิกา โพธิ์ขาว
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              รองผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>CEO</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className=" flex justify-center ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data3.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>{item.department}</div>
                      <div>{item.faction}</div>
                      <div>{item.description}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* ฝ่ายบริหารทรัพยากร ********************* */}

      {/* ********************* ฝ่ายวิชาการ ********************* */}
      <div className=" py-[64px] ">
        <h1 className="flex justify-center text-xl text-[#DAA520] py-[24px] ">
          ฝ่ายวิชาการ
        </h1>
        <div className="flex justify-center pb-4">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
            <Image src={"/images/ผู้บริหาร/4.webp"} alt={""} />
            <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
              นายอาทร ศรีมะณี
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              รองผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
            </div>
            <div className="flex justify-end">
              <button className="rounded-full pl-2 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>CEO</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                  KTLTC
                </span>
              </button>
            </div>
          </BackgroundGradient>
        </div>
        <div className=" flex justify-center ">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {Data4.map((item) => (
              <div className="" key={item.img}>
                <div className="scale-100">
                  <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-4 bg-white dark:bg-zinc-900">
                    <Image className="" src={item.img} alt={""}></Image>
                    <div className="text-center text-base sm:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div>{item.position}</div>
                      <div>{item.department}</div>
                      <div>{item.faction}</div>
                      <div>{item.description}</div>
                    </div>
                  </BackgroundGradient>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ********************* ฝ่ายวิชาการ ********************* */}
    </>
  );
}
