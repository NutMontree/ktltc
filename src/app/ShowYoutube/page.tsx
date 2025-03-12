"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Image } from "@nextui-org/react";

export default function ShowYoutube() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xxl pt-3 font-bold pb-8 ">
          <Image src='/images/icon/youtube-svgrepo-com.svg' alt='logo-youtube' width={70} height={70} />
        </h1>
      </div>
      <div>
        <div>
          <div className="">
            <Accordion isCompact>
              <AccordionItem
                key="1"
                aria-label="Accordion 1"
                title="Open Button"
                className=" border rounded-xl px-4 py-1 shadow-xl "
              >
                <div className="flex justify-center px-[24px]">
                  <div className="gap-[24px] grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 justify-items-center">
                    <div className="">
                      <iframe
                        className="h-[300px] sm:h-[400px] lg:h-[400px] xl:h-[400px] 
                         w-[350px] sm:w-[600px] lg:w-[500px] xl:w-[400px]  
                         rounded-2xl"
                        src="https://www.youtube.com/embed/nj49zojN3FI"
                        title="สถานศึกษาสีขาว วิทยาลัยเทคนิคกันทรลักษ์ 68"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="">
                      <iframe
                        className="h-[300px] sm:h-[400px] lg:h-[400px] xl:h-[400px] 
                         w-[350px] sm:w-[600px] lg:w-[500px] xl:w-[400px]  
                         rounded-2xl"
                        src="https://www.youtube.com/embed/-3MpH0BXQeY"
                        title='การเเข่งขันกีฬาภายใน "ดอกจานเกมส์" ประจำปีการศึกษา 2567 ณ สนามกีฬาวิทยาลัยเทคนิคกันทรลักษ์'
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div>
                      <iframe
                        className="h-[300px] sm:h-[400px] lg:h-[400px] xl:h-[400px] 
                         w-[350px] sm:w-[600px] lg:w-[500px] xl:w-[400px] 
                         rounded-2xl"
                        src="https://www.youtube.com/embed/_2Gnilun9X8"
                        title="การประกวดสิ่งประดิษฐ์ของคนรุ่นใหม่ ประจำปีการศึกษา 2567"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div>
                      <iframe
                        className="h-[300px] sm:h-[400px] lg:h-[400px] xl:h-[400px] 
                         w-[350px] sm:w-[600px] lg:w-[500px] xl:w-[400px] 
                         rounded-2xl"
                        src="https://www.youtube.com/embed/1qwOVzMyCQU"
                        title="กิจกรรมโครงการเดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 10 วิทยาลัยเทคนิคกันทรลักษ์ KTLTC"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>



    </>
  );
}
