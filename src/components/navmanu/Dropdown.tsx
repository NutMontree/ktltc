/* eslint-disable no-empty-pattern */

"use client"; // top to the file

import { useState } from "react";
import { HoveredLink1, Menu1, MenuItem1 } from "../ui/navbar-menu-1";
import Link from "next/link";

export function DropdownPage1() {
  return (
    <div className=" ">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="">
        <div className="pt-6 ">
          <div className="grid gap-4 ">
            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
              href={"/"}
            >
              หน้าหลัก
            </Link>
            <Menu1 setActive={setActive}>
              <div className="grid gap-4   ">
                <div className="">
                  <MenuItem1
                    setActive={setActive}
                    active={active}
                    item="ประวัติสถานศึกษา"
                  >
                    <div className="flex flex-col space-y-1 text-sm py-2 ">
                      <div className="hover:bg-slate-100 rounded-lg">
                        <HoveredLink1
                          className=" hover:tyext-sky-500"
                          href="/historyeducational"
                        >
                          ประวัติสถานศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/philosophy"
                        >
                          ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/eduadmin"
                        >
                          ทำเนียบผู้บริหาร
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/administrativestructure"
                        >
                          โครงสร้างการบริหารงานสถานศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/executiveboard"
                        >
                          คณะกรรมการบริหารสถานศึกษา
                        </HoveredLink1>
                      </div>
                    </div>
                  </MenuItem1>
                </div>
                <div>
                  <MenuItem1
                    setActive={setActive}
                    active={active}
                    item="ข้อมูลพื้นฐาน 9 ประการ"
                  >
                    <div className="flex flex-col space-y-1 text-sm py-2">
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:tyext-sky-500"
                          href="/historyeducational"
                        >
                          ข้อมูลสถานศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/personnel"
                        >
                          ข้อมูลบุคลากร
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/sid "
                        >
                          ข้อมูลนักเรียน นักศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ข้อมูลหลักสูตร
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ข้อมูลครุภัณฑ์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ข้อมูลงบประมาณ
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/buildings "
                        >
                          ข้อมูลอาคารสถานที่
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ข้อมูลตลาดแรงงาน
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="https://www.sisaket.go.th/"
                          target="_blank"
                        >
                          ข้อมูลของจังหวัด
                        </HoveredLink1>
                      </div>
                    </div>
                  </MenuItem1>
                </div>
                <div>
                  <MenuItem1
                    setActive={setActive}
                    active={active}
                    item="หน่วยงานภายใน"
                  >
                    <div className="flex flex-col space-y-1 text-sm py-2">
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/resource "
                        >
                          ฝ่ายบริหารทรัพยากร
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/plan "
                        >
                          ฝ่ายแผนงานและความร่วมมือ
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/develop "
                        >
                          ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/academic "
                        >
                          ฝ่ายวิชาการ
                        </HoveredLink1>
                      </div>
                    </div>
                  </MenuItem1>
                </div>
                <div>
                  <MenuItem1
                    setActive={setActive}
                    active={active}
                    item="ข้อมูลบุคลากร"
                  >
                    <div className="flex flex-col space-y-1 text-sm py-2">
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/executive "
                        >
                          ผู้บริหารสถานศึกษา
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/mechanic "
                        >
                          แผนกวิชาช่างยนต์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/machine "
                        >
                          แผนกวิชาช่างกลโรงงาน
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/welder "
                        >
                          แผนกวิชาช่างเชื่อมโลหะ
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/electricity "
                        >
                          แผนกวิชาช่างไฟฟ้ากำลัง
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/electronics "
                        >
                          แผนกวิชาช่างอิเล็กทรอนิกส์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/technique "
                        >
                          แผนกวิชาเทคนิคพื้นฐาน
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/construct "
                        >
                          แผนกวิชาช่างก่อสร้าง
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/accounting "
                        >
                          แผนกวิชาบัญชี
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/marketing "
                        >
                          แผนกวิชาการตลาด
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/technology "
                        >
                          แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/hotel "
                        >
                          แผนกวิชาการโรงแรม
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/ordinary "
                        >
                          แผนกวิชาสามัญสัมพันธ์
                        </HoveredLink1>
                      </div>
                    </div>
                  </MenuItem1>
                </div>
                <div>
                  <MenuItem1
                    setActive={setActive}
                    active={active}
                    item="เมนูลัด"
                  >
                    <div className="flex flex-col space-y-1 text-sm py-2">
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 href="/GECC" className="hover:underline ">
                          ศูนย์ราชการสะดวก
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="https://std2018.vec.go.th/web/ "
                          target="_blank"
                        >
                          ระบบ ศธ. ออนไลน์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="https://std2018.vec.go.th/web/ "
                          target="_blank"
                        >
                          ตรวจสอบผลการเรียน
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          รับงานอิเล็กทรอนิกส์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          สมัครเรียนออนไลน์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          บทเรียนออนไลน์
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="/pressrelease "
                        >
                          ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:tyext-sky-500"
                          href="https://v-cop.go.th/ "
                          target="_blank"
                        >
                          ศูนย์กำลังคนอาชีวศึกษา (V-COP)
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          รายงานประจำของสถานศึกษา (SAR)
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ID Plan
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1
                          className="hover:text-sky-500"
                          href="https://forms.gle/Hcwfjvd7S8zTbA3C8"
                          target="_blank"
                        >
                          แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
                        </HoveredLink1>
                      </div>
                      <div className="hover:bg-slate-100 rounded-lg ">
                        <HoveredLink1 className="hover:text-sky-500" href="/ ">
                          ภาพรวมกิจกรรมในสถานศึกษา
                        </HoveredLink1>
                      </div>
                    </div>
                  </MenuItem1>
                </div>
              </div>
            </Menu1>

            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
              href={"/pressrelease"}
            >
              ข่าวประชาสัมพันธ์
            </Link>
            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
              href={"/newsletter"}
            >
              จดหมายข่าว
            </Link>
            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
              href={"/announcement"}
            >
              ข่าวประกาศ
            </Link>
            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
              href={"/bidding"}
            >
              ข่าวประกวดราคา
            </Link>
            <Link
              className="hover:text-sky-500 hover:bg-slate-100 rounded-lg px-2 py-2"
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
