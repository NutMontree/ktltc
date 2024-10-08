"use client"; // top to the file

import { useState } from "react";

import { cn } from "@/lib/utils";
import { HoveredLink1, Menu1, MenuItem1 } from "../ui/navbar-menu-1";
import Link from "next/link";

export function DropdownPage1() {
  return (
    <div className=" ">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="pb-4">
        <Link className="hover:text-sky-500" href={"/ "}>
          หน้าหลัก
        </Link>
      </div>
      <div className={cn("  ", className)}>
        <Menu1 setActive={setActive}>
          <div className="grid gap-4">
            <div>
              <MenuItem1
                setActive={setActive}
                active={active}
                item="ประวัติสถานศึกษา"
              >
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink1
                    className="hover:tyext-sky-500"
                    href="/historyeducational"
                  >
                    ประวัติสถานศึกษา
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/philosophy"
                  >
                    ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/executive"
                  >
                    ทำเนียบผู้บริหาร
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/administrativestructure"
                  >
                    โครงสร้างการบริหารงานสถานศึกษา
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/executiveboard"
                  >
                    คณะกรรมการบริหารสถานศึกษา
                  </HoveredLink1>
                </div>
              </MenuItem1>
            </div>
            <div>
              <MenuItem1
                setActive={setActive}
                active={active}
                item="ข้อมูลพื้นฐาน 9 ประการ"
              >
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink1
                    className="hover:tyext-sky-500"
                    href="/historyeducational"
                  >
                    ข้อมูลสถานศึกษา
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/personnel"
                  >
                    ข้อมูลบุคลากร
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลนักเรียน นักศึกษา
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลหลักสูตร
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลครุภัณฑ์
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลงบประมาณ
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลอาคารสถานที่
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลตลาดแรงงาน
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ข้อมูลของจังหวัด
                  </HoveredLink1>
                </div>
              </MenuItem1>
            </div>
            <div>
              <MenuItem1
                setActive={setActive}
                active={active}
                item="หน่วยงานภายใน"
              >
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ฝ่ายบริหารทรัพยากร
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ฝ่ายแผนงานและความร่วมมือ
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ฝ่ายวิชาการ
                  </HoveredLink1>
                </div>
              </MenuItem1>
            </div>
            <div>
              <MenuItem1
                setActive={setActive}
                active={active}
                item="ข้อมูลบุคลากร"
              >
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/executive "
                  >
                    ผู้บริหารสถานศึกษา
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/mechanic "
                  >
                    แผนกวิชาช่างยนต์
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/machine ">
                    แผนกวิชาช่างกลโรงงาน
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/welder ">
                    แผนกวิชาช่างเชื่อมโลหะ
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/electricity "
                  >
                    แผนกวิชาช่างไฟฟ้ากำลัง
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/electronics "
                  >
                    แผนกวิชาช่างอิเล็กทรอนิกส์
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/technique "
                  >
                    แผนกวิชาเทคนิคพื้นฐาน
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/construct "
                  >
                    แผนกวิชาช่างก่อสร้าง
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/accounting "
                  >
                    แผนกวิชาบัญชี
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/marketing "
                  >
                    แผนกวิชาการตลาด
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/technology "
                  >
                    แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/hotel ">
                    แผนกวิชาการโรงแรม
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/ordinary "
                  >
                    แผนกวิชาสามัญสัมพันธ์
                  </HoveredLink1>
                </div>
              </MenuItem1>
            </div>
            <div>
              <MenuItem1 setActive={setActive} active={active} item="เมนูลัด">
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/https://std2018.vec.go.th/web/ "
                  >
                    ระบบ ศธ. ออนไลน์
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ตรวจสอบผลการเรียน
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    รับงานอิเล็กทรอนิกส์
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    สมัครเรียนออนไลน์
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    บทเรียนออนไลน์
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/pressrelease "
                  >
                    ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:tyext-sky-500"
                    href="/https://v-cop.go.th/ "
                  >
                    ศูนย์กำลังคนอาชีวศึกษา (V-COP)
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    รายงานประจำของสถานศึกษา (SAR)
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ID Plan
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
                  </HoveredLink1>
                  <HoveredLink1 className="hover:text-sky-500" href="/ ">
                    ภาพรวมกิจกรรมในสถานศึกษา
                  </HoveredLink1>
                  <HoveredLink1
                    className="hover:text-sky-500"
                    href="/ "
                  ></HoveredLink1>
                </div>
              </MenuItem1>
            </div>
          </div>
        </Menu1>
        <div className="pt-6">
          <div className="grid gap-4">
            <Link className="hover:text-sky-500" href={"/pressrelease"}>
              ข่าวประชาสัมพันธ์
            </Link>
            <Link className="hover:text-sky-500" href={"/newsletter"}>
              จดหมายข่าว
            </Link>
            <Link className="hover:text-sky-500" href={"/announcement"}>
              ข่าวประกาศ
            </Link>
            <Link className="hover:text-sky-500" href={"/bidding"}>
              ข่าวประกวดราคา
            </Link>
            <Link
              className="hover:text-sky-500"
              href={"/technicalcollegeorders"}
            >
              คำสั่งวิทยาลัยเทคนิค
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
