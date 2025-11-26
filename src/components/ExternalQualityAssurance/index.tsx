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
        <section className="xs:grid-cols-1 grid grid-cols-1 gap-8 pt-24 md:grid-cols-1 lg:grid-cols-2">
          {/* Card ที่ 1: รายงานผลการประกันคุณภาพ */}
          <div className="">
            <Card
              // ✅ เพิ่ม shadow-lg และ shadow-blue-500/30 (เปลี่ยนสีตามชอบ)
              className="rounded-2xl border border-transparent shadow-lg shadow-blue-500/20 transition-all duration-300 hover:border-blue-300 hover:bg-[#f1f1f1] hover:shadow-blue-500/40"
            >
              <LinkPreview
                url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf"
                target="_blank"
                className="dark:hover:text-black"
              >
                <div className="flex items-center justify-center pt-8">
                  <Image
                    src="/images/logo/logoTH.webp"
                    className="xs:h-14 h-24"
                    alt={""}
                  ></Image>
                </div>
                <div className="fron px-2 pt-6 pb-14 leading-relaxed sm:leading-relaxed">
                  <p className="text-3 md:text-3.5 text-center sm:text-sm md:text-base dark:hover:text-black">
                    รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา <br />
                    วิทยาลัยเทคนิคกันทรลักษ์ สังกัด <br />{" "}
                    สำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ <br />
                  </p>
                </div>
              </LinkPreview>
            </Card>
          </div>

          {/* Card ที่ 2: ITA */}
          <Card
            // ✅ เพิ่ม shadow-lg และ shadow-cyan-500/30 (ตัวอย่างใช้สีฟ้าอมเขียว)
            className="rounded-2xl border border-transparent shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:border-cyan-300 hover:bg-[#f1f1f1] hover:shadow-cyan-500/40"
          >
            <LinkPreview
              url="https://ktltc.vercel.app/ITA"
              target="_blank"
              className="dark:hover:text-black"
            >
              <div className="flex items-center justify-center pt-4">
                <Image
                  src="/images/logo/ITALogo1.webp"
                  className="xs:h-24 h-28"
                  alt={""}
                ></Image>
              </div>
              <div className="fron px-2 pb-14 leading-relaxed sm:leading-relaxed lg:pb-14 xl:pb-20">
                <p className="text-3 md:text-3.5 text-center sm:text-sm md:text-base dark:hover:text-black">
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
