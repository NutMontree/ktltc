"use client";
import { Image } from "@heroui/image";
import { LinkPreview } from "../ui/link-preview";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";

const ExternalQualityAssurance = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <section className="grid grid-cols-1 gap-4 pt-24 xs:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
          <div className="">
            <Card className="rounded-2xl hover:bg-[#f1f1f1]">
              <LinkPreview
                url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf"
                target="_blank"
                className="dark:hover:text-black"
              >
                <div className="flex items-center justify-center pt-8">
                  <Image
                    src="/images/logo/logoTH.webp"
                    className="h-24 xs:h-14"
                    alt={""}
                  ></Image>
                </div>
                <div className="fron px-2 pb-14 pt-6 leading-relaxed sm:leading-relaxed">
                  <p className="text-center text-[12px] dark:hover:text-black sm:text-sm md:text-[14px] md:text-base">
                    รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา <br />
                    วิทยาลัยเทคนิคกันทรลักษ์ สังกัด <br />{" "}
                    สำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ <br />
                  </p>
                </div>
              </LinkPreview>
            </Card>
          </div>

          <Card className="rounded-2xl hover:bg-[#f1f1f1]">
            <LinkPreview
              url="https://ktltc.vercel.app/ITA"
              target="_blank"
              className="dark:hover:text-black"
            >
              <div className="flex items-center justify-center pt-4">
                <Image
                  src="/images/logo/ITALogo1.webp"
                  className="h-28 xs:h-24"
                  alt={""}
                ></Image>
              </div>
              <div className="fron px-2 pb-14 leading-relaxed sm:leading-relaxed lg:pb-14 xl:pb-20">
                <p className="text-center text-[12px] dark:hover:text-black sm:text-sm md:text-[14px] md:text-base">
                  Integrity and Transparency Assessment <br />
                  การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ{" "}
                  <br />
                </p>
              </div>
            </LinkPreview>
          </Card>
        </section>
      </motion.div>
    </>
  );
};

export default ExternalQualityAssurance;
