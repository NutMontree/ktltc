"use client"
import { Image } from "@nextui-org/react";
import { LinkPreview } from "../ui/link-preview";
import { Card } from "@nextui-org/react";

const ExternalQualityAssurance = () => {
  return (
    <>
      <section className="">
        <div className="lg:pb-[20px] pt-[30px] lg:pt-[90px]">
          <Card className="rounded-2xl hover:bg-[#f1f1f1]">
            <LinkPreview url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf" target="_blank" className="dark:hover:text-black ">
              <div className="flex justify-center items-center pt-8">
                <Image src='/images/logo/logoTH.webp' className="" width={100} height={100} alt={""}></Image>
              </div>
              <div className="py-8 px-2 fron leading-relaxed sm:leading-relaxed">
                <p className="text-center dark:hover:text-black text-[12px] md:text-[14px] sm:text-sm md:text-base">
                  รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา <br />
                  วิทยาลัยเทคนิคกันทรลักษ์ สังกัด <br /> สำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ <br />
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
