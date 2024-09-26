"use client"; // top to the file
import React from "react";
import type { CollapseProps } from "antd";
import { Collapse } from "antd";
import Link from "next/link";

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const item1 = "ประวัติสถานศึกษา";
const item2 = "ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์";
const item3 = "ทำเนียบผู้บริหาร";
const item4 = "โครงสร้างการบริหารงานสถานศึกษา";
const item5 = "คณะกรรมการบริหารสถานศึกษา";
const item6 = "คณะกรรมการสถานศึกษา";

const item7 = "ข้อมูลสถานศึกษา";
const item8 = "ข้อมูลบุคลากร";
const item9 = " ข้อมูลนักเรียน นักศึกษา";
const item10 = "ข้อมูลหลักสูตร";
const item11 = "ข้อมูลครุภัณฑ์";
const item12 = "ข้อมูลงบประมาณ";
const item13 = "ข้อมูลอาคารสถานที่";
const item14 = "ข้อมูลตลาดแรงงาน";
const item15 = "ข้อมูลของจังหวัด";

const item16 = "ฝ่ายบริหารทรัพยากร";
const item17 = "ฝ่ายแผนงานและความร่วมมือ";
const item18 = "ฝ่ายพัฒนากิจกรรมนักเรียน นักศึกษา";
const item19 = "ฝ่ายวิชาการ";

const item20 = "ผู้บริหารสถานศึกษา";
const item21 = "แผนกวิชาช่างยนต์";
const item22 = "แผนกวิชาช่างกลโรงงาน";
const item23 = "แผนกวิชาช่างเชื่อมโลหะ";
const item24 = "แผนกวิชาช่างไฟฟ้ากำลัง";
const item25 = "แผนกวิชาช่างอิเล็กทรอนิกส์";
const item26 = "แผนกวิชาเทคนิคพื้นฐาน";
const item27 = "แผนกวิชาช่างก่อสร้าง";
const item28 = "แผนกวิชาบัญชี";
const item29 = "แผนกวิชาการตลาด";
const item30 = "คอมพิวเตอร์ดิจิทัล";
const item31 = "แผนกวิชาการโรงแรม";
const item32 = "แผนกวิชาสามัญสัมพันธ์";

const item33 = "ระบบ ศธ. ออนไลน์";
const item34 = "ตรวจสอบผลการเรียน";
const item35 = "รับงานอิเล็กทรอนิกส์";
const item36 = "สมัครเรียนออนไลน์";
const item37 = "บทเรียนออนไลน์";
const item38 = "ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ";
const item39 = "ศูนย์กำลังคนอาชีวศึกษา (V-COP)";
const item40 = "รายงานประจำแีของสถานศึกษา (SAR)";
const item41 = "ID Plan";
const item42 = "แบบประเมินความำึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ";
const item43 = "ภาพรวมกิจกรรมในสถานศึกษา";

const item44 = "ฟอร์มส่งแบบประเมินผลการเรียนตามสภาพจริง ประจำปีการศึกษา 1/2567";
const item45 = "ตัวอย่างไฟล์ SAR 67";
const item46 = "แบบฟอร์มหนังสือภายนอก-ภายใน";
const item47 = "ระบบงานเอกสารอิเล็กทรอนิกส์";
const item48 = "รวมภาพกิจกรรม ในสถานศึกษา";
const item49 = "ข่าวงานประชาสัมพันธ์";
const item50 = "อัลบั้มภาพ";
const item51 = "ฝ่ายพัฒนากิจการฯ";
const item52 = "เผยแพร่ผลงานวิจัย";
const item53 = "รางวัลที่ได้รับ";
const item54 = "คำสั่งวิทยาลัย";
const item55 = "จดหมายขช่าว";
const item56 = "ข่าวาจัดซื้อ จัดจ้าง";
const item57 = "แบบฟอร์มจัดซื้อจัดจ้าง";

const items: CollapseProps["items"] = [
  {
    key: "1",
    label: "ประวัติสถานศึกษา",
    children: (
      <div className="grid gap-4">
        <Link className="pl-8" href={"/historyeducational"}>
          {item1}
        </Link>
        <Link className="pl-8" href={"/philosophy"}>
          {item2}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item3}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item4}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item5}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item6}
        </Link>
      </div>
    ),
  },
  {
    key: "2",
    label: " ข้อมูลพื้นฐาน 9 ประการ",
    children: (
      <div className="grid gap-4">
        <Link className="pl-8" href={"/"}>
          {item7}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item8}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item9}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item10}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item11}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item12}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item13}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item14}
        </Link>
      </div>
    ),
  },
  {
    key: "3",
    label: "หน่วยงานภายใน",
    children: (
      <div className="grid gap-4 p-2">
        <Link className="pl-8" href={"/"}>
          {item16}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item17}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item18}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item19}
        </Link>
      </div>
    ),
  },
  {
    key: "4",
    label: "ข้อมูลบุคลากร",
    children: (
      <div className="grid gap-4 p-2">
        <Link className="pl-8" href={"/"}>
          {item20}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item21}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item22}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item23}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item24}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item25}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item26}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item27}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item28}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item29}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item30}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item31}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item32}
        </Link>
      </div>
    ),
  },
  {
    key: "5",
    label: "เมนูลัด",
    children: (
      <div className="grid gap-4 p-2">
        <Link className="pl-8" href={"/"}>
          {item33}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item34}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item35}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item36}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item37}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item38}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item39}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item40}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item41}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item42}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item43}
        </Link>
      </div>
    ),
  },
  {
    key: "6",
    label: (
      <div className="flex text-sm pt-2 ">
        <div className="pt-1 pl-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 "
          >
            <path
              fillRule="evenodd"
              d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
              clipRule="evenodd"
            />
            <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
          </svg>
        </div>
      </div>
    ),
    children: (
      <div className="grid gap-4 p-2">
        <Link className="pl-8" href={"/"}>
          {item44}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item45}
        </Link>
        <Link className="pl-8" href={"/externalinternal"}>
          {item46}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item47}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item48}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item49}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item50}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item51}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item52}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item53}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item54}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item55}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item56}
        </Link>
        <Link className="pl-8" href={"/"}>
          {item57}
        </Link>
      </div>
    ),
  },
];

const DropdownPage1: React.FC = () => (
  <>
    <div className="pb-12">
      <Link href={"/ "}>หน้าหลัก</Link>
      <Collapse defaultActiveKey={[""]} ghost items={items} />
      <div className="grid gap-4">
        <Link href={"/pressrelease"}>ข่าวประชาสัมพันธ์</Link>
        <Link href={"/newsletter"}>จดหมายข่าว</Link>
        <Link href={"/announcement"}>ข่าวประกาศ</Link>
        <Link href={"/bidding"}>ข่าวประกวดราคา</Link>
        <Link href={"/technicalcollegeorders"}>คำสั่งวิทยาลัยเทคนิค</Link>
      </div>
    </div>
  </>
);

export default DropdownPage1;
