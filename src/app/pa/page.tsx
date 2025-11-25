"use client";
import React from "react";
<<<<<<< HEAD
import { Image } from "@heroui/image";
=======
import Image from "next/image";
>>>>>>> 085ced4b3f39ef438bbf48af9752a5595358c88d
import Link from "next/link";
import { Accordion, AccordionItem } from "@heroui/react";

export default function PaPage() {
  return (
    <>
      <main>
        <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px]">
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-stroke/0 via-stroke to-stroke/0"></div>
          <div className="w-full px-4">
            <div className="text-center">
              <h1 className="flex justify-center text-xl">
                การประเมินผลการพัฒนางานตามข้อตกลง (PA)
              </h1>
              <h1 className="flex justify-center pb-8 text-xl text-[#DAA520]">
                Performance Agreement: PA
              </h1>
              <ul className="flex items-center justify-center gap-[10px]">
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-[10px] text-base font-medium text-dark dark:text-white"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <p className="flex items-center gap-[10px] text-base font-medium text-body-color">
                    <span className="text-body-color dark:text-dark-6">/</span>
                    Performance Agreement
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-24">
          <Accordion isCompact>
            <AccordionItem key="1" aria-label="1" title="2569">
              <div className="py-12">
                <h1 className="text-xxl flex justify-center font-bold">
                  การประเมินผลการพัฒนางานตามข้อตกลง (PA)
                </h1>
                <h1 className="text-xxl flex justify-center text-[#DAA520]">
                  2569
                </h1>
                <div>Null</div>
              </div>
            </AccordionItem>
            <AccordionItem key="2" aria-label="2" title="2568">
              <div className="py-12">
                <h1 className="text-xxl flex justify-center font-bold">
                  การประเมินผลการพัฒนางานตามข้อตกลง (PA)
                </h1>
                <h1 className="text-xxl flex justify-center text-[#DAA520]">
                  2568
                </h1>
                <div className="flex justify-center pt-4">
                  <div className="grid grid-cols-1 gap-6 pt-12 sm:grid-cols-2">
                    {/* ******************************** Photos ******************************** */}
                    <div className="">
                      นางนงลักษร์ ศรีชา
                      <Image
                        src={"/pdf/งานบุคลากร/นางนงลักษรื.webp"}
                        className="rounded-[22px] py-4"
                      />
                    </div>
                    <div className="">
                      นางวีนัส สุวรรณ
                      <Image
                        src={"/pdf/งานบุคลากร/นางวีนัส.webp"}
                        className="WW py-4"
                      />
                    </div>
                    {/* ******************************** Photos ******************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/รานงานผลการปฏิบัติงาน(ข้าราชการครู).pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        รานงานผลการปฏิบัติงาน(ข้าราชการครู)
                      </Link>

                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/รานงานผลการปฏิบัติงาน(ข้าราชการครู).pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/รายงานผลการปฏิบัติงาน(พนักงานราชการครู).pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        รายงานผลการปฏิบัติงาน(พนักงานราชการครู)
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/รายงานผลการปฏิบัติงาน(พนักงานราชการครู).pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/นายจักรกฤษณ์.pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        นายจักรกฤษณ์ พันธ์ศรี{" "}
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/นายจักรกฤษณ์.pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/นายทรงพร.pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        นายทรงพร พรมโสภา
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/นายทรงพร.pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/นายสิริปัญญ์.pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        นายสิริปัญญ์ เสริมสิริพิพัฒน์
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/นายสิริปัญญ์.pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/นางสาวณัญสินี.pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        นางสาวณัญสินี ชวดพงษ์
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/นางสาวณัญสินี.pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                    {/* ***************************** Link And PDF ***************************** */}
                    <div className="pt-4">
                      <p className="text-lg text-sky-800">PDF</p>
                      <Link
                        href="/pdf/งานบุคลากร/นางสาวล้ำค่า.pdf"
                        className="hover:text-sky-500"
                        target="_blank"
                      >
                        นางสาวล้ำค่า จินาวัลย์
                      </Link>
                      <iframe
                        className="aspect-video h-screen w-full pt-4"
                        src="/pdf/งานบุคลากร/นางสาวล้ำค่า.pdf"
                      ></iframe>
                    </div>
                    {/* ***************************** Link And PDF ***************************** */}
                  </div>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </>
  );
}
