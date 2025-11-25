"use client"; // top to the file
import { Image } from "@heroui/image";
import Link from "next/link";
import { FootTitle } from "../FootTitle";
import Personnel from "@/app/personnel/page";

const About = () => {
  return (
    <section
      id="about"
      className="bg-gray-1 dark:bg-dark-2 pt-20 pb-8 lg:pt-[120px] lg:pb-[70px]"
    >
      <div className="container">
        <div className="wow fadeInUp" data-wow-delay=".2s">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full lg:w-1/2">
              <div className="mb-12 max-w-[540px] lg:mb-0">
                <h2 className="text-dark mb-5 text-3xl leading-tight font-bold sm:text-[40px] sm:leading-[1.2] dark:text-white">
                  วิทยาลัยเทคนิคกันทรลักษ์
                </h2>
                <div className="text-body-color dark:text-dark-6 mb-10 text-base leading-relaxed">
                  (ชื่อเดิม วิทยาลัยการอาชีพกันทรลักษ์ แก้ไขเมื่อ 8 เมษายน 2559)
                  <br /> <br />
                  ที่อยู่ : 82 หมู่ 1 ต.จานใหญ่ อ.กันทรลักษ์ จ.ศรีสะเกษ 33110{" "}
                  <br />
                  <p>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</p>
                  <p>
                    เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ เเละ
                    วิทยาลัยเทคนิคกันทรลักษ์ Today
                  </p>
                  <p>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </p>
                  <p>Website : ktltc.vercel.app</p>
                  <p>Gmail : relationktl@gmail.com</p>
                  <br />
                  <p>สอบถามข้อมูลเพิ่มเติม</p>
                  <p>โทร : ๐๖๑ - ๔๑๒๒๗๖๕ หรือ ๐๔๕ - ๘๑๑๐๕๓ </p>
                  <br />
                  <Link
                    target="_blank"
                    href="https://maps.app.goo.gl/LSK6jriPzmmQSz846"
                  >
                    <div className="hover:text-sky-500">
                      <div>
                        <p className="text-3.5 pt-2 hover:text-sky-500 sm:text-sm md:text-base md:text-[20px]">
                          ที่ตั้ง/GPS
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                <Link
                  href="https://ktltc.vercel.app/historyeducational"
                  className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-7 py-3 text-center text-base font-medium text-white duration-300"
                >
                  ประวัติสถานศึกษา
                </Link>
                <br />
                <br />
                <Link
                  href="https://ktltc.vercel.app/personnel"
                  className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-7 py-3 text-center text-base font-medium text-white duration-300"
                >
                  ข้อมูลบุคลากรทางการศึกษา
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="-mx-2 flex flex-wrap sm:-mx-4 lg:-mx-2 xl:-mx-4">
                <div className="w-full px-2 sm:w-1/2 sm:px-4 lg:px-2 xl:px-4">
                  <div
                    className={`relative mb-4 sm:mb-8 sm:h-[400px] md:h-[540px] lg:h-[400px] xl:h-[500px]`}
                  >
                    <Image
                      src="/images/ภาพวิลัย/มุมสูง/01.webp"
                      alt="about image"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>

                <div className="w-full px-2 sm:w-1/2 sm:px-4 lg:px-2 xl:px-4">
                  <div className="relative mb-4 sm:mb-8 sm:h-[220px] md:h-[346px] lg:mb-4 lg:h-[225px] xl:mb-8 xl:h-[310px]">
                    <Image
                      src="/images/ภาพวิลัย/มุมสูง/21.webp"
                      alt="about image"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="bg-primary relative z-10 mb-4 flex items-center justify-center overflow-hidden px-6 py-12 sm:mb-8 sm:h-40 sm:p-5 lg:mb-4 xl:mb-8">
                    <div>
                      <span className="block text-5xl font-extrabold text-white">
                        31
                      </span>
                      <span className="block text-base font-semibold text-white">
                        Opened for
                      </span>
                      <span className="text-opacity-70 block text-base font-medium text-white">
                        31 years of experience
                      </span>
                    </div>
                    <div>
                      <span className="absolute top-0 left-0 -z-10">
                        <svg
                          width="106"
                          height="144"
                          viewBox="0 0 106 144"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.1"
                            x="-67"
                            y="47.127"
                            width="113.378"
                            height="131.304"
                            transform="rotate(-42.8643 -67 47.127)"
                            fill="url(#paint0_linear_1416_214)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_1416_214"
                              x1="-10.3111"
                              y1="47.127"
                              x2="-10.3111"
                              y2="178.431"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="white" />
                              <stop
                                offset="1"
                                stopColor="white"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
                      <span className="absolute top-0 right-0 -z-10">
                        <svg
                          width="130"
                          height="97"
                          viewBox="0 0 130 97"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.1"
                            x="0.86792"
                            y="-6.67725"
                            width="155.563"
                            height="140.614"
                            transform="rotate(-42.8643 0.86792 -6.67725)"
                            fill="url(#paint0_linear_1416_215)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_1416_215"
                              x1="78.6495"
                              y1="-6.67725"
                              x2="78.6495"
                              y2="133.937"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="white" />
                              <stop
                                offset="1"
                                stopColor="white"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
                      <span className="absolute right-0 bottom-0 -z-10">
                        <svg
                          width="175"
                          height="104"
                          viewBox="0 0 175 104"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.1"
                            x="175.011"
                            y="108.611"
                            width="101.246"
                            height="148.179"
                            transform="rotate(137.136 175.011 108.611)"
                            fill="url(#paint0_linear_1416_216)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_1416_216"
                              x1="225.634"
                              y1="108.611"
                              x2="225.634"
                              y2="256.79"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="white" />
                              <stop
                                offset="1"
                                stopColor="white"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </section>
  );
};

export default About;
