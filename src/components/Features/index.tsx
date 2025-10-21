"use client"
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import { Image } from "@nextui-org/react";
import { Card, Tabs, Tab, } from "@nextui-org/react";
import { motion } from "framer-motion";

const Features = () => {
  const variants = ["underlined"];
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <section className=" ">
          <div>
            <div className="relative z-20 overflow-hidden lg:pb-[30px] pt-[40px] lg:pt-[100px]">
              <div className="">
                <Link href='/GECC'>
                  <SectionTitle
                    subtitle="GECC"
                    title="ศูนย์ราชการสะดวก"
                    paragraph="แถบนำทางเพื่อความสะดวกในการค้นหาข้อมูลของคุณ"
                  />
                </Link>
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

          <div className="flex justify-center" data-href="https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh" data-tabs="timeline" data-width="" data-height="" data-small-header="true" data-adapt-container-width="true" data-hide-cover="true" data-show-facepile="true"></div>
          <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fngan.prachasamphanth.withyalay.thekhnikh&tabs=timeline&width=0&height=0&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId=952832906928077"
            height="0"
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>

          <div className="py-8">
            <Card className="pt-4 pb-2 px-4">
              <div className="flex flex-col">
                <Tabs color="default" variant="underlined" className="flex justify-center">
                  <Tab
                    className="text-xl"
                    key="บริการ"
                    title={
                      <div className="flex items-center space-x-2">
                        <Image src='/images/gecc/24.png' alt={"GECCBG"} width="60" height="60" className="sm:hidden" ></Image>
                        <span className="font-medium text-xl hidden sm:flex">บริการ</span>
                      </div>
                    }>
                    <div className="text-center sm:hidden">บริการ</div>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2">
                      <div className="flex justify-center hover:bg-[#f1f1f1] rounded-2xl dark:hover:text-black">
                        <Link target="_blank" href="https://admission.vec.go.th/web/Login.htm?mode=index">
                          <div className="py-4">
                            <div className="flex justify-center">
                              <img width="76" height="76" src="https://img.icons8.com/parakeet-line/48/FA5252/reviewer-male.png" alt="reviewer-male" />                          </div>
                            <div className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base">สมัครเรียนออนไลน์</div>
                          </div>
                        </Link>
                      </div>
                      <div className="flex justify-center hover:bg-[#f1f1f1] rounded-2xl dark:hover:text-black">
                        <Link href={'/GECC'} className="">
                          <div className="py-4">
                            <div className="flex justify-center">
                              <img className="pt-1.5" width="70" height="70" src="https://img.icons8.com/pastel-glyph/64/FA5252/conclusion-contract.png" alt="conclusion-contract" />
                            </div>
                            <div className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base">เอกสารทะเบียน</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    className="text-xl"
                    key="ติดต่อ"
                    title={
                      <div className="flex items-center space-x-2">
                        <Image src='/images/gecc/icons8-male-user.gif' alt={"GECCBG"} width="50" height="58" className="sm:hidden" ></Image>
                        <span className="text-center font-medium text-xl hidden sm:flex">ติดต่อ</span>
                      </div>
                    }>
                    <div className="text-center sm:hidden">ติดต่อ</div>
                    <div className="text-base">
                      <div className="">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                          <div className="flex justify-center hover:bg-[#f1f1f1] rounded-2xl py-4 dark:hover:text-black">
                            <div className="">
                              <img width="80" height="80" src="https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/FA5252/external-phone-call-stay-at-home-flatart-icons-outline-flatarticons.png" alt="external-phone-call-stay-at-home-flatart-icons-outline-flatarticons" />
                              <p className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base">0614122765</p>
                            </div>
                          </div>
                          <div className="flex justify-center hover:bg-[#f1f1f1] rounded-2xl py-4 dark:hover:text-black">
                            <Link target="_blank" href="https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default">
                              <div className=" hover:text-sky-500">
                                <div className="flex justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0,0,256,256">
                                    <g fill="#fa5252" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="scale(5.12,5.12)"><path d="M9,4c-2.74952,0 -5,2.25048 -5,5v32c0,2.74952 2.25048,5 5,5h32c2.74952,0 5,-2.25048 5,-5v-32c0,-2.74952 -2.25048,-5 -5,-5zM9,6h32c1.66848,0 3,1.33152 3,3v32c0,1.66848 -1.33152,3 -3,3h-32c-1.66848,0 -3,-1.33152 -3,-3v-32c0,-1.66848 1.33152,-3 3,-3zM25,10c-8.70295,0 -16,5.67833 -16,12.94727c0,6.4852 5.78406,11.75277 13.33594,12.76563h0.00195c0.19879,0.04248 0.42756,0.11023 0.5625,0.17383c0.02758,0.013 0.0246,0.01414 0.03906,0.02344c-0.00265,0.08215 0.02293,0.46014 -0.01562,0.75c-0.0095,0.05611 -0.17325,1.02539 -0.20703,1.2168v0.00195c-0.04664,0.26694 -0.22285,0.80451 0.23242,1.49023c0.22764,0.34286 0.69911,0.62028 1.14063,0.6582c0.44151,0.03792 0.84667,-0.07119 1.29883,-0.26172c1.03507,-0.4288 3.10185,-1.65023 5.48828,-3.2832c2.38434,-1.63154 4.95921,-3.61104 6.64453,-5.51172c2.29202,-2.46674 3.47852,-5.1272 3.47852,-8.02344c0,-7.26804 -7.29697,-12.94727 -16,-12.94727zM25,12c7.83897,0 14,5.0413 14,10.94727c0,2.37272 -0.89401,4.46084 -2.94727,6.66797l-0.00977,0.00977l-0.00781,0.00977c-1.46188,1.65187 -3.97117,3.61058 -6.28711,5.19531c-2.25597,1.5437 -4.36199,2.72956 -4.99805,3.00977c0.06529,-0.38394 0.15039,-0.88281 0.15039,-0.88281l0.00391,-0.01758l0.00195,-0.01758c0.05563,-0.41836 0.20533,-1.05296 -0.11328,-1.83789v-0.00195v-0.00195c-0.23741,-0.5779 -0.67938,-0.8315 -1.04102,-1.00195c-0.36164,-0.17045 -0.70927,-0.25877 -0.99805,-0.32031l-0.03906,-0.00977l-0.04102,-0.00391c-6.82439,-0.88616 -11.67383,-5.49331 -11.67383,-10.79687c0,-5.90706 6.16095,-10.94727 14,-10.94727zM23.99219,18.99805c-0.50381,0.00935 -0.99219,0.39383 -0.99219,1.00195v6c0,0.552 0.448,1 1,1c0.552,0 1,-0.448 1,-1v-2.87891l2.18555,3.45898c0.566,0.792 1.81445,0.39292 1.81445,-0.58008v-6c0,-0.552 -0.448,-1 -1,-1c-0.552,0 -1,0.448 -1,1v3l-2.18555,-3.58008c-0.21225,-0.297 -0.51998,-0.42748 -0.82227,-0.42187zM15,19c-0.552,0 -1,0.448 -1,1v6c0,0.552 0.448,1 1,1h3c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1h-2v-5c0,-0.552 -0.448,-1 -1,-1zM21,19c-0.552,0 -1,0.448 -1,1v6c0,0.552 0.448,1 1,1c0.552,0 1,-0.448 1,-1v-6c0,-0.552 -0.448,-1 -1,-1zM31,19c-0.552,0 -1,0.448 -1,1v6c0,0.552 0.448,1 1,1h3c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1h-2v-1h2c0.553,0 1,-0.448 1,-1c0,-0.552 -0.447,-1 -1,-1h-2v-1h2c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1z"></path></g></g>
                                  </svg>
                                </div>
                                <div>
                                  <p className="pt-2 hover:text-sky-500 text-[14px] md:text-[20px] sm:text-sm md:text-base">ศูนย์ GECC ร้องทุกข์</p>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="flex justify-center hover:bg-[#f1f1f1] rounded-2xl py-4 dark:hover:text-black">
                            <Link target="_blank" href="https://maps.app.goo.gl/LSK6jriPzmmQSz846">
                              <div className=" hover:text-sky-500">
                                <img width="75" height="75" src="https://img.icons8.com/ios/50/FA5252/place-marker--v1.png" alt="place-marker--v1" />
                                <div>
                                  <p className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base">ที่ตั้ง/GPS</p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    className="text-xl"
                    key="แบบสํารวจ"
                    title={
                      <div className="flex items-center space-x-2">
                        <Image src='/images/gecc/1.gif' alt={"GECCBG"} width="50" height="58" className="sm:hidden" ></Image>
                        <span className="text-center font-medium text-xl hidden sm:flex">แบบสํารวจ</span>
                      </div>
                    }>
                    <div className="text-center sm:hidden">แบบสํารวจ</div>
                    <div className="text-base">
                      <div className="">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2">
                          <Link href='https://docs.google.com/forms/d/e/1FAIpQLSdEf2XmgVMrNhz7Fl6O_8e_4yp5SjWyGxhC-pM64vIMPfBw3w/viewform' className="hover:bg-[#f1f1f1] rounded-2xl py-4 dark:hover:text-black">
                            <div className="flex justify-center">
                              <img width="80" height="80" src="https://img.icons8.com/ios/50/FA5252/qr-code--v1.png" alt="qr-code--v1" />
                            </div>
                            <p className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base px-4">แบบสํารวจความต้องการของผู้รับบริการที่มีต่อการให้บริการศูนย์ราชการสะดวก</p>
                          </Link>
                          <Link href='https://docs.google.com/forms/d/e/1FAIpQLSca9AXgqHmgVFMu9uHw16JyizUeFZ3JSVlPCB5fWpYScYwRww/viewform' className="hover:bg-[#f1f1f1] rounded-2xl py-4 dark:hover:text-black">
                            <div className=" hover:text-sky-500">
                              <div className="flex justify-center">
                                <img width="80" height="80" src="https://img.icons8.com/ios/50/FA5252/qr-code--v1.png" alt="qr-code--v1" />
                              </div>
                              <div>
                                <p className="hover:text-sky-500 pt-2 text-[14px] md:text-[20px] sm:text-sm md:text-base px-4">แบบสํารวจความพึงพอใจของผู้รับบริการที่มีต่อการให้บริการศูนย์ราชการสะดวก</p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </Card >
          </div >
        </section >
      </motion.div>

    </>
  );
};

export default Features;
