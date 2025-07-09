"use client"; // top to the file
import React from 'react'
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'ประวัติสถานศึกษา',
    children: [
      {
        key: '1-1',

        label: (
          <a rel="ประวัติสถานศึกษา" href="/historyeducational" >
            ประวัติสถานศึกษา
          </a >
        ),
      },
      {
        key: '1-2',
        label: (
          <a rel="ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์" href="/philosophy">
            ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
          </a>
        ),
      },
      {
        key: '1-3',
        label: (
          <a rel="ทำเนียบผู้บริหาร" href="/eduadmin">
            ทำเนียบผู้บริหาร
          </a>
        ),
      },
      {
        key: '1-4',
        label: (
          <a rel="โครงสร้างการบริหารงานสถานศึกษา" href="/administrativestructure">
            โครงสร้างการบริหารงานสถานศึกษา
          </a>
        ),
      },
      {
        key: '1-5',
        label: (
          <a rel="คณะกรรมการบริหารสถานศึกษา" href="/executiveboard">
            คณะกรรมการบริหารสถานศึกษา
          </a>
        ),
      },
    ],
  },
  {
    key: '2',
    label: 'ข้อมูลพื้นฐาน 9 ประการ',
    children: [
      {
        key: '2-1',
        label: (
          <a rel="ข้อมูลสถานศึกษา" href="/historyeducational" >
            ข้อมูลสถานศึกษา
          </a >
        ),
      },
      {
        key: '2-2',
        label: (
          <a rel="ข้อมูลบุคลากร" href="/personnel">
            ข้อมูลบุคลากร
          </a>
        ),
      },
      {
        key: '2-3',
        label: (
          <a rel="ข้อมูลนักเรียน นักศึกษา" href="/sid">
            ข้อมูลนักเรียน นักศึกษา
          </a>
        ),
      },
      {
        key: '2-4',
        label: (
          <a rel="ข้อมูลหลักสูตร" href="">
            ข้อมูลหลักสูตร
          </a>
        ),
      },
      {
        key: '2-5',
        label: (
          <a rel="ข้อมูลครุภัณฑ์" href="">
            ข้อมูลครุภัณฑ์
          </a>
        ),
      },
      {
        key: '2-6',
        label: (
          <a rel="ข้อมูลงบประมาณ" href="">
            ข้อมูลงบประมาณ
          </a>
        ),
      },
      {
        key: '2-7',
        label: (
          <a rel="ข้อมูลอาคารสถานที่" href="/buildings">
            ข้อมูลอาคารสถานที่
          </a>
        ),
      },
      {
        key: '2-8',
        label: (
          <a rel="ข้อมูลตลาดแรงงาน" href="/LINK">
            ข้อมูลตลาดแรงงาน
          </a>
        ),
      },
      {
        key: '2-9',
        label: (
          <a rel="ข้อมูลของจังหวัด" href="/https://www.sisaket.go.th/" target="_blank">
            ข้อมูลของจังหวัด
          </a>
        ),
      },
    ],
  },
  {
    key: '3',
    label: 'หน่วยงานภายใน',
    children: [
      {
        key: '3-1',
        label: (
          <a rel="ฝ่ายบริหารทรัพยากร" href="/resource" >
            ฝ่ายบริหารทรัพยากร
          </a >
        ),
      },
      {
        key: '3-2',
        label: (
          <a rel="ฝ่ายแผนงานและความร่วมมือ" href="/plan">
            ฝ่ายแผนงานและความร่วมมือ
          </a>
        ),
      },
      {
        key: '3-3',
        label: (
          <a rel="ฝ่ายพัฒนากิจการนักเรียน นักศึกษา" href="/develop">
            ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
          </a>
        ),
      },
      {
        key: '3-4',
        label: (
          <a rel="ฝ่ายวิชาการ" href="/academic">
            ฝ่ายวิชาการ
          </a>
        ),
      },
    ],
  },
  {
    key: '4',
    label: 'ข้อมูลบุคลากร',
    children: [
      {
        key: '4-1',
        label: (
          <a rel="ผู้บริหารสถานศึกษา" href="/executive" >
            ผู้บริหารสถานศึกษา
          </a >
        ),
      },
      {
        key: '4-2',
        label: (
          <a rel="แผนกวิชาช่างยนต์" href="/mechanic">
            แผนกวิชาช่างยนต์
          </a>
        ),
      },
      {
        key: '4-3',
        label: (
          <a rel="แผนกวิชาช่างกลโรงงาน" href="/machine">
            แผนกวิชาช่างกลโรงงาน
          </a>
        ),
      },
      {
        key: '4-4',
        label: (
          <a rel="แผนกวิชาช่างเชื่อมโลหะ" href="/welder">
            แผนกวิชาช่างเชื่อมโลหะ
          </a>
        ),
      },
      {
        key: '4-5',
        label: (
          <a rel="แผนกวิชาช่างไฟฟ้ากำลัง" href="/electricity">
            แผนกวิชาช่างไฟฟ้ากำลัง
          </a>
        ),
      },
      {
        key: '4-6',
        label: (
          <a rel="แผนกวิชาช่างอิเล็กทรอนิกส์" href="/electronics">
            แผนกวิชาช่างอิเล็กทรอนิกส์
          </a>
        ),
      },
      {
        key: '4-7',
        label: (
          <a rel="แผนกวิชาเทคนิคพื้นฐาน" href="/technique">
            แผนกวิชาเทคนิคพื้นฐาน
          </a>
        ),
      },
      {
        key: '4-8',
        label: (
          <a rel="แผนกวิชาช่างก่อสร้าง" href="/construct">
            แผนกวิชาช่างก่อสร้าง
          </a>
        ),
      },
      {
        key: '4-9',
        label: (
          <a rel="แผนกวิชาบัญชี" href="/accounting">
            แผนกวิชาบัญชี
          </a>
        ),
      },
      {
        key: '4-10',
        label: (
          <a rel="แผนกวิชาการตลาด" href="/marketing">
            แผนกวิชาการตลาด
          </a>
        ),
      },
      {
        key: '4-11',
        label: (
          <a rel="แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล" href="/technology">
            แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
          </a>
        ),
      },
      {
        key: '4-12',
        label: (
          <a rel="แผนกวิชาการโรงแรม" href="/hotel">
            แผนกวิชาการโรงแรม
          </a>
        ),
      },
      {
        key: '4-13',
        label: (
          <a rel="แผนกวิชาสามัญสัมพันธ์" href="/ordinary">
            แผนกวิชาสามัญสัมพันธ์
          </a>
        ),
      },
    ],
  },
  {
    key: '5',
    label: 'เมนูลัด',
    children: [
      {
        key: '5-1',
        label: (
          <a rel="ศูนย์ราชการสะดวก" href="/GECC" >
            ศูนย์ราชการสะดวก
          </a >
        ),
      },
      {
        key: '5-2',
        label: (
          <a rel="ระบบ ศธ. ออนไลน์" href="https://std2018.vec.go.th/web" target="_blank">
            ระบบ ศธ. ออนไลน์
          </a>
        ),
      },
      {
        key: '5-3',
        label: (
          <a rel="ตรวจสอบผลการเรียน" href="https://std2018.vec.go.th/web/" target="_blank">
            ตรวจสอบผลการเรียน
          </a>
        ),
      },
      {
        key: '5-4',
        label: (
          <a rel="รับงานอิเล็กทรอนิกส์" href="">
            รับงานอิเล็กทรอนิกส์
          </a>
        ),
      },
      {
        key: '5-5',
        label: (
          <a rel="สมัครเรียนออนไลน์" href="/https://admission.vec.go.th/web/Login.htm?mode=index" target="_blank">
            สมัครเรียนออนไลน์
          </a>
        ),
      },
      {
        key: '5-6',
        label: (
          <a rel="บทเรียนออนไลน์" href="">
            บทเรียนออนไลน์
          </a>
        ),
      },
      {
        key: '5-7',
        label: (
          <a rel="ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ" href="/pressrelease">
            ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
          </a>
        ),
      },
      {
        key: '5-8',
        label: (
          <a rel="ศูนย์กำลังคนอาชีวศึกษา (V-COP)" href="https://v-cop.go.th/" target="_blank">
            ศูนย์กำลังคนอาชีวศึกษา (V-COP)
          </a>
        ),
      },
      {
        key: '5-9',
        label: (
          <a rel="รายงานประจำของสถานศึกษา (SAR)" href="/plan/sar">
            รายงานประจำของสถานศึกษา (SAR)
          </a>
        ),
      },
      {
        key: '5-10',
        label: (
          <a rel="Plan PDCA" href="https://ktltcp.vercel.app/" target="_blank">
            Plan PDCA
          </a>
        ),
      },
      {
        key: '5-11',
        label: (
          <a rel="แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ" href="/https://forms.gle/Hcwfjvd7S8zTbA3C8" target="_blank">
            แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
          </a>
        ),
      },
    ],
  },
  // {
  //   key: '0',
  //   label: 'label',
  //   children: [
  //     {
  //       key: '0-1',
  //       label: (
  //         <a rel="rel" href="/LINK" >
  //           name
  //         </a >
  //       ),
  //     },
  //     {
  //       key: '0-2',
  //       label: (
  //         <a rel="rel" href="/LINK">
  //           name
  //         </a>
  //       ),
  //     },
  //   ],
  // },
];

export default function Testpage() {

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };
  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });


  return (
    <>
      <div className='text-center py-8'>Test Page</div>

      <div>
        <Dropdown menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="absolute px-6  rounded-lg   ring-primary lg:hidden "
              >
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${navbarOpen ? " top-[7px] rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${pathUrl === "/" && sticky
                      ? "bg-dark dark:bg-white"
                      : "bg-dark"
                    }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${navbarOpen ? "opacity-0 " : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${pathUrl === "/" && sticky
                      ? "bg-dark dark:bg-white"
                      : "bg-dark"
                    }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${navbarOpen ? " top-[-8px] -rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${pathUrl === "/" && sticky
                      ? "bg-dark dark:bg-white"
                      : "bg-dark"
                    }`}
                />
              </button>
            </Space>
          </a>
        </Dropdown>
      </div>



    </>)
}
