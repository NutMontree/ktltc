"use client"; // top to the file

import { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function DropdownPage() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn(" ", className)}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="ประวัติสถานศึกษา">
          <div className="flex flex-col space-y-1 text-sm ">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className="hover:text-red-500 "
                href="/historyeducational"
              >
                ประวัติสถานศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/philosophy">
                ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/eduadmin">
                ทำเนียบผู้บริหาร
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/administrativestructure">
                โครงสร้างการบริหารงานสถานศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/executiveboard">
                คณะกรรมการบริหารสถานศึกษา
              </HoveredLink>
            </div>
          </div>
        </MenuItem>

        <MenuItem
          setActive={setActive}
          active={active}
          item="ข้อมูลพื้นฐาน 9 ประการ"
        >
          <div className="flex flex-col space-y-1 text-sm">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className="hover:tyext-sky-500"
                href="/historyeducational"
              >
                ข้อมูลสถานศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/personnel">
                ข้อมูลบุคลากร
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/sid ">
                ข้อมูลนักเรียน นักศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลหลักสูตร
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลครุภัณฑ์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลงบประมาณ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/buildings ">
                ข้อมูลอาคารสถานที่
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลตลาดแรงงาน
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className=""
                href="https://www.sisaket.go.th/"
                target="_blank"
              >
                ข้อมูลของจังหวัด
              </HoveredLink>
            </div>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="หน่วยงานภายใน">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/resource ">
                ฝ่ายบริหารทรัพยากร
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/plan ">
                ฝ่ายแผนงานและความร่วมมือ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/develop ">
                ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/academic ">
                ฝ่ายวิชาการ
              </HoveredLink>
            </div>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="ข้อมูลบุคลากร">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/executive ">
                ผู้บริหารสถานศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/mechanic ">
                แผนกวิชาช่างยนต์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/machine ">
                แผนกวิชาช่างกลโรงงาน
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/welder ">
                แผนกวิชาช่างเชื่อมโลหะ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/electricity ">
                แผนกวิชาช่างไฟฟ้ากำลัง
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/electronics ">
                แผนกวิชาช่างอิเล็กทรอนิกส์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/technique ">
                แผนกวิชาเทคนิคพื้นฐาน
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/construct ">
                แผนกวิชาช่างก่อสร้าง
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/accounting ">
                แผนกวิชาบัญชี
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/marketing ">
                แผนกวิชาการตลาด
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/technology ">
                แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/hotel ">
                แผนกวิชาการโรงแรม
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ordinary ">
                แผนกวิชาสามัญสัมพันธ์
              </HoveredLink>
            </div>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="เมนูลัด">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink href="/GECC" className="hover:underline ">
                ศูนย์ราชการสะดวก
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className=""
                href="https://std2018.vec.go.th/web"
                target="_blank"
              >
                ระบบ ศธ. ออนไลน์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className=""
                href="https://std2018.vec.go.th/web/ "
                target="_blank"
              >
                ตรวจสอบผลการเรียน
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                รับงานอิเล็กทรอนิกส์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                สมัครเรียนออนไลน์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                บทเรียนออนไลน์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/pressrelease ">
                ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className="hover:tyext-sky-500"
                href="https://v-cop.go.th/ "
                target="_blank"
              >
                ศูนย์กำลังคนอาชีวศึกษา (V-COP)
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                รายงานประจำของสถานศึกษา (SAR)
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ID Plan
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink
                className=""
                href="https://forms.gle/Hcwfjvd7S8zTbA3C8"
                target="_blank"
              >
                แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ภาพรวมกิจกรรมในสถานศึกษา
              </HoveredLink>
            </div>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
