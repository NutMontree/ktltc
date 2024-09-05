"use client"; // top to the file
// // DropdownPage
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import Link from "next/link";

export default function DropdownPage() {
  return (
    <>
      <div className="">
        <div className="">
          <div className="">
            <div className="flex gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <div className="text-sm flex pt-2 text-whigh text-red">
                    ประวัติสถานศึกษา
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-3 "
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/historyeducational" className="text-sm">
                      ประวัติสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/philosophy" className="text-sm">
                      ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ทำเนียบผู้บริหาร
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      โครงสร้างการบริหารงานสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      คณะกรรมการบริหารสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      คณะกรรมการสถานศึกษา
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <div className="text-sm flex pt-2 ">
                    ข้อมูลพื้นฐาน 9 ประการ
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลบุคลากร
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลนักเรียน นักศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลหลักสูตร
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลครุภัณฑ์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลงบประมาณ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลอาคารสถานที่
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลตลาดแรงงาน
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข้อมูลของจังหวัด
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <div className="flex text-sm pt-2 ">
                    หน่วยงานภายใน
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฝ่ายบริหารทรัพยากร
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฝ่ายแผนงานและความร่วมมือ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฝ่ายวิชาการ
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <div className="flex text-sm pt-2 ">
                    ข้อมูลบุคลากร
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ผู้บริหารสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างยนต์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างกลโรงงาน
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างเชื่อมโลหะ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างไฟฟ้ากำลัง
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างอิเล็กทรอนิกส์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาเทคนิคพื้นฐาน
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาช่างก่อสร้าง
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาบัญชี
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาการตลาด
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      คอมพิวเตอร์ดิจิทัล
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาการโรงแรม
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แผนกวิชาสามัญสัมพันธ์
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <div className="flex text-sm pt-2 ">
                    เมนูลัด
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ระบบ ศธ. ออนไลน์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ตรวจสอบผลการเรียน
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      รับงานอิเล็กทรอนิกส์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      สมัครเรียนออนไลน์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      บทเรียนออนไลน์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ศูนย์กำลังคนอาชีวศึกษา (V-COP)
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      รายงานประจำแีของสถานศึกษา (SAR)
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ID Plan
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แบบประเมินความำึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ภาพรวมกิจกรรมในสถานศึกษา
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <div className="flex text-sm pt-2 ">
                    <div className="pt-1 pl-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4 "
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
                          clip-rule="evenodd"
                        />
                        <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                      </svg>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฟอร์มส่งแบบประเมินผลการเรียนตามสภาพจริง ประจำปีการศึกษา
                      1/2567
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ตัวอย่างไฟล์ SAR 67
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แบบฟอร์มหนังสือภายนอก-ภายใน
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ระบบงานเอกสารอิเล็กทรอนิกส์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      รวมภาพกิจกรรม ในสถานศึกษา
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข่าวงานประชาสัมพันธ์
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      อัลบั้มภาพ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ฝ่ายพัฒนากิจการฯ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      เผยแพร่ผลงานวิจัย
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      รางวัลที่ได้รับ
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      คำสั่งวิทยาลัย
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      จดหมายขช่าว
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      ข่าวาจัดซื้อ จัดจ้าง
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/" className="text-sm">
                      แบบฟอร์มจัดซื้อจัดจ้าง
                    </Link>
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                  >
                    Delete file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
