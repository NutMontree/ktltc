"use client"; // top to the file
// // // DropdownPage
// import React from "react";
// // import {
// //   Dropdown,
// //   DropdownTrigger,
// //   DropdownMenu,
// //   DropdownItem,
// // } from "@nextui-org/react";
// // import Link from "next/link";
// import { NavbarDemo } from "./NavbarDemo";

// // export default function DropdownPage() {
// //   return (
// //     <>
// //       {/* <div className="">
// //         <div className="">
// //           <div className="">
// //             <div className="flex gap-4">
// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="text-sm flex pt-2 text-whigh text-red">
// //                     ประวัติสถานศึกษา
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         fill="none"
// //                         viewBox="0 0 24 24"
// //                         strokeWidth="1.5"
// //                         stroke="currentColor"
// //                         className="size-3 "
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           d="m19.5 8.25-7.5 7.5-7.5-7.5"
// //                         />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link href="/historyeducational" className="text-sm">
// //                       ประวัติสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/philosophy" className="text-sm">
// //                       ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/executive" className="text-sm">
// //                       ทำเนียบผู้บริหาร
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       โครงสร้างการบริหารงานสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       คณะกรรมการบริหารสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       คณะกรรมการสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>

// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="text-sm flex pt-2 ">
// //                     ข้อมูลพื้นฐาน 9 ประการ
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         fill="none"
// //                         viewBox="0 0 24 24"
// //                         strokeWidth="1.5"
// //                         stroke="currentColor"
// //                         className="size-3"
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           d="m19.5 8.25-7.5 7.5-7.5-7.5"
// //                         />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link href="/historyeducational" className="text-sm">
// //                       ข้อมูลสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/personnel" className="text-sm">
// //                       ข้อมูลบุคลากร
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลนักเรียน นักศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลหลักสูตร
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลครุภัณฑ์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลงบประมาณ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลอาคารสถานที่
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลตลาดแรงงาน
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข้อมูลของจังหวัด
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>

// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="flex text-sm pt-2 ">
// //                     หน่วยงานภายใน
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         fill="none"
// //                         viewBox="0 0 24 24"
// //                         strokeWidth="1.5"
// //                         stroke="currentColor"
// //                         className="size-3"
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           d="m19.5 8.25-7.5 7.5-7.5-7.5"
// //                         />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฝ่ายบริหารทรัพยากร
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฝ่ายแผนงานและความร่วมมือ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฝ่ายวิชาการ
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>

// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="flex text-sm pt-2 ">
// //                     ข้อมูลบุคลากร
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         fill="none"
// //                         viewBox="0 0 24 24"
// //                         strokeWidth="1.5"
// //                         stroke="currentColor"
// //                         className="size-3"
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           d="m19.5 8.25-7.5 7.5-7.5-7.5"
// //                         />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link href="/executive" className="text-sm">
// //                       ผู้บริหารสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/mechanic" className="text-sm">
// //                       แผนกวิชาช่างยนต์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/machine" className="text-sm">
// //                       แผนกวิชาช่างกลโรงงาน
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/welder" className="text-sm">
// //                       แผนกวิชาช่างเชื่อมโลหะ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/electricity" className="text-sm">
// //                       แผนกวิชาช่างไฟฟ้ากำลัง
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/electronics" className="text-sm">
// //                       แผนกวิชาช่างอิเล็กทรอนิกส์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/technique" className="text-sm">
// //                       แผนกวิชาเทคนิคพื้นฐาน
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/construct" className="text-sm">
// //                       แผนกวิชาช่างก่อสร้าง
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/accounting" className="text-sm">
// //                       แผนกวิชาบัญชี
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/marketing" className="text-sm">
// //                       แผนกวิชาการตลาด
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/technology" className="text-sm">
// //                       แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/hotel" className="text-sm">
// //                       แผนกวิชาการโรงแรม
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/ordinary" className="text-sm">
// //                       แผนกวิชาสามัญสัมพันธ์
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>

// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="flex text-sm pt-2 ">
// //                     เมนูลัด
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         fill="none"
// //                         viewBox="0 0 24 24"
// //                         strokeWidth="1.5"
// //                         stroke="currentColor"
// //                         className="size-3"
// //                       >
// //                         <path
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                           d="m19.5 8.25-7.5 7.5-7.5-7.5"
// //                         />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link
// //                       href="https://std2018.vec.go.th/web/"
// //                       className="text-sm"
// //                     >
// //                       ระบบ ศธ. ออนไลน์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ตรวจสอบผลการเรียน
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       รับงานอิเล็กทรอนิกส์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       สมัครเรียนออนไลน์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       บทเรียนออนไลน์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/pressrelease" className="text-sm">
// //                       ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="https://v-cop.go.th/" className="text-sm">
// //                       ศูนย์กำลังคนอาชีวศึกษา (V-COP)
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       รายงานประจำของสถานศึกษา (SAR)
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ID Plan
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ภาพรวมกิจกรรมในสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>

// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <div className="flex text-sm pt-2 ">
// //                     <div className="pt-1 pl-1">
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         viewBox="0 0 24 24"
// //                         fill="currentColor"
// //                         className="size-4 "
// //                       >
// //                         <path
// //                           fillRule="evenodd"
// //                           d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
// //                           clipRule="evenodd"
// //                         />
// //                         <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
// //                       </svg>
// //                     </div>
// //                   </div>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Static Actions">
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฟอร์มส่งแบบประเมินผลการเรียนตามสภาพจริง ประจำปีการศึกษา
// //                       1/2567
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ตัวอย่างไฟล์ SAR 67
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/externalinternal" className="text-sm">
// //                       แบบฟอร์มหนังสือภายนอก-ภายใน
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ระบบงานเอกสารอิเล็กทรอนิกส์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       รวมภาพกิจกรรม ในสถานศึกษา
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/pressrelease" className="text-sm">
// //                       ข่าวงานประชาสัมพันธ์
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ฝ่ายพัฒนากิจการฯ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       เผยแพร่ผลงานวิจัย
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       รางวัลที่ได้รับ
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/technicalcollegeorders" className="text-sm">
// //                       คำสั่งวิทยาลัย
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/newsletter" className="text-sm">
// //                       จดหมายข่าว
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       ข่าวจัดซื้อ จัดจ้าง
// //                     </Link>
// //                   </DropdownItem>
// //                   <DropdownItem>
// //                     <Link href="/" className="text-sm">
// //                       แบบฟอร์มจัดซื้อจัดจ้าง
// //                     </Link>
// //                   </DropdownItem>

// //                   <DropdownItem
// //                     key="delete"
// //                     className="text-danger"
// //                     color="danger"
// //                   ></DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>
// //             </div>
// //           </div>
// //         </div>
// //       </div> */}
// //       <NavbarDemo />
// //     </>
// //   );
// // }

import { useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "@/components/ui/navbar-menu";
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
              <HoveredLink className="" href="/executive">
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
              <HoveredLink className="" href="/ ">
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
              <HoveredLink className="" href="/ ">
                ข้อมูลอาคารสถานที่
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลตลาดแรงงาน
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ข้อมูลของจังหวัด
              </HoveredLink>
            </div>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="หน่วยงานภายใน">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ฝ่ายบริหารทรัพยากร
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ฝ่ายแผนงานและความร่วมมือ
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
                ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
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
              <HoveredLink className="" href="/https://std2018.vec.go.th/web/ ">
                ระบบ ศธ. ออนไลน์
              </HoveredLink>
            </div>
            <div className="hover:bg-slate-100 rounded-lg ">
              <HoveredLink className="" href="/ ">
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
                href="/https://v-cop.go.th/ "
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
              <HoveredLink className="" href="/ ">
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

        {/* <MenuItem setActive={setActive} active={active} item="Products">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Algochurn"
              href="https://algochurn.com"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Prepare for tech interviews like never before."
            />
            <ProductItem
              title="Tailwind Master Kit"
              href="https://tailwindmasterkit.com"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project"
            />
            <ProductItem
              title="Moonbeam"
              href="https://gomoonbeam.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <ProductItem
              title="Rogue"
              href="https://userogue.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </MenuItem> */}
      </Menu>
    </div>
  );
}
