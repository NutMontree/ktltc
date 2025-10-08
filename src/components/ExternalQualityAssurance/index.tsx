"use client"
import { Image } from "@nextui-org/react";
import { LinkPreview } from "../ui/link-preview";
import { Card } from "@nextui-org/react";

const ExternalQualityAssurance = () => {
  return (
    <>
      <section className="grid grid-cols-1 xs:grid-cols-1 md:grid-cols-1 lg:grid-cols-2  gap-4 pt-12">
        <div className="">
          <Card className="rounded-2xl hover:bg-[#f1f1f1]">
            <LinkPreview url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf" target="_blank" className="dark:hover:text-black ">
              <div className="flex justify-center items-center pt-8">
                <Image src='/images/logo/logoTH.webp' className="h-24 xs:h-14" alt={""}></Image>
              </div>
              <div className="pt-6 pb-14 px-2 fron leading-relaxed sm:leading-relaxed">
                <p className="text-center dark:hover:text-black text-[12px] md:text-[14px] sm:text-sm md:text-base">
                  รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา <br />
                  วิทยาลัยเทคนิคกันทรลักษ์ สังกัด <br /> สำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ <br />
                </p>
              </div>
            </LinkPreview>
          </Card>
        </div>


        <div className="">
          <Card className="rounded-2xl hover:bg-[#f1f1f1]">
            <LinkPreview url="https://ktltc.vercel.app/ITA" target="_blank" className="dark:hover:text-black ">
              <div className="flex justify-center items-center pt-4">
                <Image src='/images/logo/ITALogo1.webp' className="h-28 xs:h-24 " alt={""}></Image>
              </div>
              <div className="pb-14 xl:pb-20 lg:pb-14 px-2 fron leading-relaxed sm:leading-relaxed">
                <p className="text-center dark:hover:text-black text-[12px] md:text-[14px] sm:text-sm md:text-base">
                  Integrity and Transparency Assessment <br />
                  การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ <br />
                </p>
              </div>
            </LinkPreview>
          </Card>
        </div>
      </section >
    </>
  );
};

export default ExternalQualityAssurance;
