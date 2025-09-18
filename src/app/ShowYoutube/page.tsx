"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Image } from "@nextui-org/react";

export default function ShowYoutube() {
  return (
    <>
      <div className="flex justify-center gap-4">
        <div className="flex justify-center">
          <Image src='/images/icon/youtube-svgrepo-com.svg' alt='logo-youtube' width={70} height={70} />
        </div>
        <h1 className="text-3xl pt-4 font-bold pb-8 ">Youtube</h1>
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
                    <div >
                      <iframe
                        src="https://www.youtube.com/embed/tVReYxrSav0?si=HZpppAn8DwMvccUr"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        width="560"
                        height="315"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                      </iframe>
                    </div>
                    <div >
                      <iframe
                        src="https://www.youtube.com/embed/908PSchHFiU?si=I6XoZHsfF0Ceot7M"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        width="560"
                        height="315"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                      </iframe>
                    </div>
                    <div className="">
                      <iframe
                        src="https://www.youtube.com/embed/nj49zojN3FI"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                    w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]  
                                   rounded-2xl"
                        title="สถานศึกษาสีขาว วิทยาลัยเทคนิคกันทรลักษ์ 68"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="">
                      <iframe
                        src="https://www.youtube.com/embed/TpkZoNBSzNU?si=PDDZY5iQuTTG-TF5"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        title="สถานศึกษาสีขาว วิทยาลัยเทคนิคกันทรลักษ์ 68"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="">
                      <iframe
                        src="https://www.youtube.com/embed/-3MpH0BXQeY"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        title='การเเข่งขันกีฬาภายใน "ดอกจานเกมส์" ประจำปีการศึกษา 2567 ณ สนามกีฬาวิทยาลัยเทคนิคกันทรลักษ์'
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div>
                      <iframe
                        src="https://www.youtube.com/embed/_2Gnilun9X8"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]   
                                   rounded-2xl"
                        title="การประกวดสิ่งประดิษฐ์ของคนรุ่นใหม่ ประจำปีการศึกษา 2567"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div>
                      <iframe
                        src="https://www.youtube.com/embed/1qwOVzMyCQU"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]   
                                   rounded-2xl"
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
