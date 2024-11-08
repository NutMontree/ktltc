import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <>
      {/* <Link href="pressrelease450">
        <BackgroundBeamsWithCollision>
          <div className="scale-95 hover:scale-110 duration-500 justify-center">
            <Image
              className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px]"
              src={"/images/ข่าวประชาสัมพันธ์/2567/กันยายน/56/2.webp"}
              alt={""}
            />
          </div>
        </BackgroundBeamsWithCollision>
      </Link> */}

      <Link href="pressrelease471">
        <div className="flex justify-center px-8">
          <div>
            <div className="flex justify-center">
              <Image
                // className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px] "
                className="h-[150px] sm:h-[280px] lg:h-[400px] xl:h-[600px] "
                src={"/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/10/1.webp"}
              />
            </div>
            <br />
            <div className="text-center">
              💥สวัสดี Dek68 ทุกคน วิทยาลัยเทคนิคกันทรลักษ์ เปิดรับสมัครนักเรียน{" "}
              <br />
              นักศึกษา ปีการศึกษา 2568 📌📍รู้หรือไม่? ว่า <br />
              วิทยาลัยเทคนิคกันทรลักษ์ ทำการเปิดสาขาวิชาเพิ่ม ได้แก่ 👉ระดับ{" "}
              <br />
              ปวช. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ สาขาวิชาโยธา <br />
              สาขาวิชาตัวถังเเละสีรถยนต์ 👉ระดับ ปวส. <br />
              สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ สาขาวิชาโยธา <br />
              สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถังเเละสีรถยนต์ <br />
              สาขาวิชาการจัดการโลจิสติกส์เเละซัพพลายเชน <br />
              📣📣นอกจากนี้ยังมีสาขาวิชาอีกมากมาย อย่าลืมมาเจอกันนะค้าบ <br />
              พวกเราหัวใจ แสด – น้ำเงิน ยินดีต้อนรับนักเรียน - นักศึกษา เด็ก 68
              ทุกคนค้าบ
            </div>
          </div>
        </div>
      </Link>
      <br />
      <br />
      <Link href="pressrelease471">
        <div className="flex justify-center px-8">
          <div>
            <div className="flex justify-center">
              <Image
                // className="h-[300px] sm:h-[500px] lg:h-[700px] xl:h-[900px] "
                className="h-[250px] sm:h-[500px] lg:h-[600px] xl:h-[600px] "
                src={"/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/8/1.webp"}
              />
            </div>

            <br />

            <div>
              <p className="flex justify-center text-base">
                " Dek 68 พร้อมกันรึยัง "
              </p>
              <p className="flex justify-center text-base">
                ประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์ เปิดรับสมัคร
              </p>
              <p className="flex justify-center text-base">
                นักเรียนนักศึกษาใหม่ รอบโควตา ปีการศึกษา 2568
              </p>
              <p className="flex justify-center text-base">
                💥💥เปิดรับสมัครตั้งเเต่วันนี้ ถึง 21 พฤศจิกายน 2567
              </p>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
