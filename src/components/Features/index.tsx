"use client"
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";
import { Image } from "@nextui-org/react";
import { Card, Tabs, Tab, } from "@nextui-org/react";
import { CardBody, } from "@/components/ui/3d-card";
import { Button } from "antd";

const Features = () => {
  const variants = ["underlined"];
  return (
    <>
      <section className=" ">
        <div className="flex justify-center">
          <div className="pt-24 xl:pt-32">
            <iframe
              className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
               w-[350px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
              src="/images/gecc/ศูนย์ราชการสะดวก.mp4"
              title=" "
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <br />
          </div>
        </div>

        <div>
          <div className="relative z-20 overflow-hidden lg:pb-[30px] pt-[40px] lg:pt-[100px]">
            <div className="">
              <Link href='/GECC'>
                <SectionTitle
                  subtitle="GECC"
                  title="ศูนย์ราชการสะดวก"
                  paragraph="แถบนำทางเพื่อความสะดวกในการค้นหาข้อมูลของคุณ"
                />
                <Image src='/images/logo/GECCBG.webp' alt={"GECCBG"}></Image>

              </Link>
              <div className="-mx-4 mt-12 flex flex-wrap lg:mt-20">
                {featuresData.map((feature, i) => (
                  <SingleFeature key={i} feature={feature} />
                ))}
              </div>
            </div>
            <span className="absolute bottom-4 right-4 -z-[1]">
              <svg
                width="48"
                height="134"
                viewBox="0 0 48 134"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="45.6673"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 45.6673 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 45.6673 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 45.6673 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 45.6673 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 45.6673 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 45.6673 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 31.0006 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 31.0006 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 31.0006 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 31.0006 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 31.0008 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 31.0008 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 31.0008 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 16.3341 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 16.3341 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 16.3341 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 16.3341 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 16.3338 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 16.3338 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 16.3338 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 1.66732 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 1.66732 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 1.66732 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 1.66732 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 1.66732 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 1.66732 1.66683)"
                  fill="#3758F9"
                />
              </svg>
            </span>
          </div>
        </div>
      </section >







      <div className="py-8">
        <div >
          <div className="flex flex-col px-2 py-2">
            <Tabs color="default" variant="underlined" className="">
              <Tab
                className="text-xl p-8"
                key="บริการ"
                title={
                  <div className="flex items-center space-x-2">
                    <Image src='/images/gecc/24.png' alt={"GECCBG"} width="60" height="60" className="sm:hidden" ></Image>
                    <span className="font-medium text-xl hidden sm:flex">บริการ</span>
                  </div>
                }>
                <div className="text-center sm:hidden">บริการ</div>
                <Link href={'/GECC'} className="">
                  <div className="pt-4">
                    <Image src='/images/gecc/1.gif' alt={"GECCBG"} width="60" height="60" className=""></Image>
                    <div className="">เอกสารทะเบียน</div>
                  </div>
                </Link>

              </Tab>
              <Tab
                className="text-xl p-8"
                key="ติดต่อ"
                title={
                  <div className="flex items-center space-x-2">
                    <Image src='/images/gecc/icons8-male-user.gif' alt={"GECCBG"} width="60" height="60" className="sm:hidden" ></Image>
                    <span className="pr-12 hidden sm:flex">ติดต่อ</span>
                  </div>
                }>
                <div className="text-center sm:hidden">ติดต่อ</div>
                <div className="text-base">
                  <div className="px-4 py-4">
                    <div className="grid md:grid-flow-col gap-4">
                      <div className="">
                        <div className="grid gap-3">
                          <div>
                            <div className="flex gap-2 ">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                />
                              </svg>
                              <div className="hover:text-sky-500">0614122765</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-flow-col gap-4">
                        <div className="grid gap-3">
                          <div>
                            <Link target="_blank" href="/pdf/ทะเบียน/คำร้องขอย้ายสถานศึกษา.pdf">
                              <div className="flex gap-2 hover:text-sky-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="fill-black dark:fill-white" width={20} height={20} viewBox="0 0 512 512"><path d="M64 464l48 0 0 48-48 0c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L229.5 0c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3L384 304l-48 0 0-144-80 0c-17.7 0-32-14.3-32-32l0-80L64 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z" /></svg>
                                <div>
                                  <Link href={'https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default'}>
                                    ศูนย์ GECC ร้องทุกข์ KTL-TC
                                    Open in LINE
                                  </Link>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div >
      </div >
    </>
  );
};

export default Features;
