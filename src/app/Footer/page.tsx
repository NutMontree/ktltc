"use client"; // top to the file

import { Image } from "@nextui-org/react";
import Link from "next/link";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandFacebook,
  IconHome,
  IconTerminal2,
} from "@tabler/icons-react";

export default function Footer() {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },

    {
      title: "Products",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Facebook",
      icon: (
        <IconBrandFacebook className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.facebook.com/profile.php?id=100004276455648",
    },
  ];
  return (
    <>
      <div className="border-t mx-auto max-w-screen-2xl " />
      <div>
        <div className="bg-red-800">
          <footer
            className="
                  justify-between 
                  text-white
                  justify-items-center
                  mx-auto max-w-screen-2xl px-4 py-[26px] 
                  "
          >
            <div className="py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-[24px]">
                <span className="grid gap-2 pb-2">
                  <div>
                    <Image
                      removeWrapper
                      alt="Relaxing app background"
                      className="w-40"
                      src="/images/logo1.png"
                    />
                  </div>
                  <div className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>061-4122765 หรือ 045-811053</div>
                  </div>
                  <div className="flex gap-2 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <Link
                      className="hover:underline "
                      target="_blank"
                      href="https://www.google.co.th/maps/place/7P66QM35%2BJ68/@14.7540375,104.6555032,17z/data=!3m1!4b1!4m4!3m3!8m2!3d14.7540375!4d104.6580781?hl=th&entry=ttu&g_ep=EgoyMDI0MDgyMy4wIKXMDSoASAFQAw%3D%3D"
                    >
                      QM35+J68 ตำบล จานใหญ่ อำเภอกันทรลักษ์ ศรีสะเกษ 33110
                    </Link>
                  </div>
                  <div className="flex gap-2  pl-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                    </svg>
                    ktl11022021@gmail.com
                  </div>
                </span>

                <div className="border-t sm:border-none">
                  <span className="">
                    <div className="pt-6 sm:pt-0">
                      <Link href="/pressrelease" className="hover:underline ">
                        ข่าวประชาสัมพันธ์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/newsletter" className="hover:underline ">
                        จดหมายข่าว
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/announcement" className="hover:underline ">
                        ข่าวประกาศ
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/bidding" className="hover:underline ">
                        ข่าวประกวดราคา
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/technicalcollegeorders"
                        className="hover:underline "
                      >
                        คำสั่งวิทยาลัยเทคนิค
                      </Link>
                    </div>
                  </span>
                </div>

                <span className="border-t sm:border-none">
                  <div className="pt-6 sm:pt-0">
                    <Link
                      href="/externalinternal"
                      className="hover:underline  "
                    >
                      แบบฟอร์มหนังสือภายนอก-ภายใน
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/personnel " className="hover:underline ">
                      ข้อมูลบุคลากร
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link
                      href="https://www.facebook.com/profile.php?id=61571228871228"
                      target="_blank"
                      className="hover:underline  "
                    >
                      ตู้เสมารักษ์ สถานศึกษาสีขาว
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link
                      href="https://www.facebook.com/profile.php?id=61567041267941"
                      target="_blank"
                      className="hover:underline  "
                    >
                      ชมรม To Be Number 1
                    </Link>
                  </div>

                  <div className="py-2">
                    <Link
                      href="https://std2018.vec.go.th/web/"
                      target="_blank"
                      className="hover:underline "
                    >
                      ตรวจสอบผลการเรียน
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/minigame" className="hover:underline ">
                      Mini Game
                    </Link>
                  </div>
                </span>
              </div>
            </div>
          </footer>
        </div>

        <div className="bg-red-800">
          <footer
            className="
                  justify-between 
                  text-white
                  justify-items-center
                  mx-auto max-w-screen-2xl px-4 py-[26px] border-t
                  "
          >
            <div className="py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[24px]">
                <div className=" ">
                  <div className="pb-4 text-lg text-center">
                    ประวัติสถานศึกษา
                  </div>
                  <div className="py-2">
                    <Link
                      href="/historyeducational "
                      className="hover:underline "
                    >
                      ประวัติสถานศึกษา
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/philosophy " className="hover:underline ">
                      ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/eduadmin " className="hover:underline ">
                      ทำเนียบผู้บริหาร
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/administrativestructure "
                      className="hover:underline "
                    >
                      โครงสร้างการบริหารงานสถานศึกษา
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/executiveboard " className="hover:underline ">
                      คณะกรรมการบริหารสถานศึกษา
                    </Link>
                  </div>
                </div>
                <div className="border-t sm:border-none">
                  <div className=" text-lg text-center pt-6 pb-4 sm:pt-0">
                    ข้อมูลพื้นฐาน 9 ประการ
                  </div>
                  <div className="py-2">
                    <Link
                      href="/historyeducational "
                      className="hover:underline "
                    >
                      ข้อมูลสถานศึกษา
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/personnel " className="hover:underline ">
                      ข้อมูลบุคลากร
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/sid " className="hover:underline ">
                      ข้อมูลนักเรียน นักศึกษา
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/ " className="hover:underline ">
                      ข้อมูลหลักสูตร
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/ " className="hover:underline ">
                      ข้อมูลครุภัณฑ์
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/ " className="hover:underline ">
                      ข้อมูลงบประมาณ
                    </Link>
                    <div className="py-2">
                      <Link href="/buildings " className="hover:underline ">
                        ข้อมูลอาคารสถานที่
                      </Link>
                    </div>

                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        ข้อมูลตลาดแรงงาน
                      </Link>
                    </div>

                    <div className="py-2">
                      <Link
                        href="https://www.sisaket.go.th/"
                        target="_blank"
                        className="hover:underline "
                      >
                        ข้อมูลของจังหวัด
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="border-t sm:border-none">
                  <div className=" text-lg text-center pt-6 pb-4 sm:pt-0">
                    หน่วยงานภายใน
                  </div>
                  <div className="py-2">
                    <Link href="/resource " className="hover:underline ">
                      ฝ่ายบริหารทรัพยากร
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/plan " className="hover:underline ">
                      ฝ่ายแผนงานและความร่วมมือ
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/develop " className="hover:underline ">
                      ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/academic " className="hover:underline ">
                      ฝ่ายวิชาการ
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="border-t sm:border-none">
                    <div className=" text-lg text-center pt-6 pb-4 sm:pt-0">
                      ข้อมูลบุคลากร
                    </div>

                    <div className="py-2">
                      <Link href="/executive " className="hover:underline ">
                        ผู้บริหารสถานศึกษา
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/mechanic " className="hover:underline ">
                        แผนกวิชาช่างยนต์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/machine " className="hover:underline ">
                        แผนกวิชาช่างกลโรงงาน
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/welder " className="hover:underline ">
                        แผนกวิชาช่างเชื่อมโลหะ
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/electricity " className="hover:underline ">
                        แผนกวิชาช่างไฟฟ้ากำลัง
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/electronics " className="hover:underline ">
                        แผนกวิชาช่างอิเล็กทรอนิกส์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/technique " className="hover:underline ">
                        แผนกวิชาเทคนิคพื้นฐาน
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/construct " className="hover:underline ">
                        แผนกวิชาช่างก่อสร้าง
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/accounting " className="hover:underline ">
                        แผนกวิชาบัญชี
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/marketing" className="hover:underline ">
                        แผนกวิชาการตลาด
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/technology " className="hover:underline ">
                        แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/hotel " className="hover:underline ">
                        แผนกวิชาการโรงแรม
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ordinary " className="hover:underline ">
                        แผนกวิชาสามัญสัมพันธ์
                      </Link>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="border-t sm:border-none">
                    <div className=" text-lg text-center pt-6 pb-4 sm:pt-0">
                      เมนูลัด
                    </div>
                    <div className="py-2">
                      <Link href="/GECC" className="hover:underline ">
                        ศูนย์ราชการสะดวก
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link
                        href="https://std2018.vec.go.th/web/ "
                        target="_blank"
                        className="hover:underline "
                      >
                        ระบบ ศธ. ออนไลน์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link
                        href="https://std2018.vec.go.th/web/ "
                        target="_blank"
                        className="hover:underline "
                      >
                        ตรวจสอบผลการเรียน
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        รับงานอิเล็กทรอนิกส์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        สมัครเรียนออนไลน์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        บทเรียนออนไลน์
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/pressrelease " className="hover:underline ">
                        ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link
                        href="https://v-cop.go.th/ "
                        target="_blank"
                        className="hover:underline "
                      >
                        ศูนย์กำลังคนอาชีวศึกษา (V-COP)
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        รายงานประจำของสถานศึกษา (SAR)
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/ " className="hover:underline ">
                        ID Plan
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link
                        href="https://forms.gle/Hcwfjvd7S8zTbA3C8"
                        target="_blank"
                        className="hover:underline "
                      >
                        แบบประเมินความพึงพอใจของผู้ใช้
                        บริการข้อมูลด้านระบบสารสนเทศ
                      </Link>
                    </div>
                    <div className="py-2">
                      <Link href="/pressrelease " className="hover:underline ">
                        ภาพรวมกิจกรรมในสถานศึกษา
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <div className="border-y mx-auto max-w-screen-2xl" />

      <div>
        <div className="flex items-center justify-center px-16 pt-16  w-full">
          <FloatingDock
            mobileClassName=" " // only for demo, remove for production
            items={links}
          />
        </div>
      </div>

      <div className="w-full py-3 ">
        <div className="flex gap-2 justify-center">
          <div className="text-default-600 text-xs">Copyright © 2023.</div>

          <div className="text-xs text-cyan-700">
            KTLTC / งานศูนย์ข้อมูลและสารสนเทศ
          </div>
        </div>
        <div className="flex gap-2 justify-center ">
          <div className="text-default-600 text-xs"> Designed </div>
          <Link
            className="flex justify-center gap-1 text-current "
            // href="https://www.facebook.com/profile.php?id=61553558543619"
            href="/Sponsor"
            title="All M Min"
          >
            <div className="text-xs font-medium">By All M Min</div>
          </Link>
        </div>
      </div>
    </>
  );
}
