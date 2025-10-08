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
              <div className="py-8 fron leading-relaxed sm:leading-relaxed">
                <p className="text-center dark:hover:text-black xs:text-md md:text-base lg:text-xl xl:text-2xl">รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา</p>
                <p className="text-center dark:hover:text-black xs:text-xs md:text-sm lg:text-lg xl:text-xl">วิทยาลัยเทคนิคกันทรลักษ์ สังกัด สำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ</p>
                <p className="text-center dark:hover:text-black xs:text-xs md:text-sm lg:text-lg xl:text-xl">ระดับชั้นที่เปิดสอน ประกาศนียบัตรวิชาชีพ (ปวช.) และ ประกาศนียบัตรวิชาชีพชั้นสูง(ปวส.)</p>
              </div>
            </LinkPreview>
          </Card>
        </div>
      </section >
    </>
  );
};

export default ExternalQualityAssurance;
