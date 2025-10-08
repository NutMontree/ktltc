"use client"; // top to the file
import React from "react";
import Link from "next/link";
import { DataDate, DataPressrelease, Description, ImageItem, } from "./data";
import { Image } from "@heroui/react";
import { FootTitle } from "@/components/FootTitle";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { TageLink } from "./data";
import { motion } from "motion/react";

const TageFucntion = () => {
  return (
    <div>
      <div>
        <p className="text-sky-800 text-lg">รายละเอียดค่าลงทะเบียนทุกระดับชั้น</p>
        <Link
          href="
https://drive.google.com/drive/folders/1TgPURXEF7lnGpTKB1ZCScUPa_09qwNg7?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExaGExVnlBS3RPNk9wTTQwZAEe9tNvZDpdEiFwCt-99igKkFOz7XJUyn7VarPK92bd-mqKClF7sD1fvnWTnPk_aem_2KJlaPQf8600Kuz0fQIqfA
"
          className="hover:text-sky-600 text-sky-500"
          target="_blank"
        >
          https://drive.google.com/...
        </Link>
      </div>
    </div >
  )
}

const ImageFunction = () => {
  return (
    <div>
      <div className="flex justify-center">
        <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center pb-4">
          {ImageItem.map((item) => item ? (<div key={item.imgs}><div className="scale-95 hover:scale-100 transition duration-500 rounded-full"><Image isBlurred src={item.imgs} alt={""}></Image></div></div>) : null)}
        </div>
      </div>
    </div>
  )
}

export default function Pressrelease() {
  return (
    <>
      <Breadcrumb items={[{ href: '/', title: <HomeOutlined />, className: 'dark:text-white dark:hover:text-white' }, { href: '/pressrelease/2568/press6809', className: 'dark:text-white dark:hover:text-white', title: (<> <UserOutlined /> <span>Application List</span> </>), }, { title: 'Application', className: 'dark:text-gray-400' },]} />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80"><div className="absolute top-0 h-32 w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent" /></div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80"> <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" /> </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {""
            .split(" ")
            .map((word, index) => (
              <motion.span key={index} initial={{ opacity: 0, filter: "blur(4px)", y: 10 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.3, delay: index * 0.1, ease: "easeInOut", }} className="mr-2 inline-block" >
                {word}
                {DataPressrelease.Item.map((item) => (<div key={item.title}>{item.title}</div>))}
              </motion.span>
            ))}
        </h1>
        <motion.p initial={{ opacity: 0, }} animate={{ opacity: 1, }} transition={{ duration: 0.2, delay: 0.4, }} className="relative z-10 mx-auto py-6 font-normal text-neutral-600 dark:text-neutral-400">
          <div className='grid gap-2'>
            {Description.map((item) => (<div key={item?.description ?? "undefined"}> {item?.description && <div >{item.description}</div>} </div>))}
          </div>
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10, }} animate={{ opacity: 1, y: 0, }} transition={{ duration: 0.2, delay: 0.6, }}>
          {TageLink.map((item) => (
            <Link key={item.href} href={item.href} target="_blank">
              <div className="text-sky-500 hover:text-sky-600 dark:text-sky-400 hover:dark:text-sky-600">{item.tage}</div>
            </Link>
          ))}
          <TageFucntion />
          <FootTitle />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10, }} animate={{ opacity: 1, y: 0, }} transition={{ duration: 0.2, delay: 0.8, }}>
          <div className="date flex py-2 gap-2">
            <Image isBlurred src='/images/icon/time-svgrepo-com.svg' alt='logo-youtube' className="pt-1" width={20} height={20} />
            {DataDate.map((item) => (<div key={item.date}> <div className="text-xs text-slate-500 pt-1">{item.date}</div> </div>))} </div>
          {/* ***************************** Youtube / Image *****************************  */}
          <ImageFunction />
        </motion.div>
      </div>
    </>
  );
}

{/*  ***************************** LInk And PDF ***************************** 
          <div className="pt-4">
            <p className="text-sky-800 text-lg">
              รายละเอียดเพิ่มเติม
            </p>
            <Link
              href="
https://drive.google.com/drive/folders/1phgddFFt09qGJcdm9qwCmcfmm3zKMxge?fbclid=IwY2xjawJEwQJleHRuA2FlbQIxMAABHUvscPSpY64t8NkPynr1aLwI6XnTfkFrtAEeKvMMR7yP99Cm2fkqvvM52Q_aem_2XATd8ximRk2McnjpxV7hQ
// "
              className="hover:text-sky-500"
              target="_blank"
            >
              https://drive.google.com/...
            </Link>

            <iframe
              className="w-full h-screen aspect-video pt-4"
              src="/images/ข่าวประชาสัมพันธ์/2568/มีนาคม/13/1.pdf"
            ></iframe>
          </div>
***************************** LInk And PDF ***************************** */}

{/*  ***************************** Youtube *****************************  

  <div className="flex justify-center">
  <div className=" py-2  gap-4">
    <iframe
      className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
               w-[350px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
      src="/images/ข่าวประชาสัมพันธ์/2568/เมษายน/32/2.mp4"
      title=" "
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
    <br />
  </div>
</div> 

***************************** Youtube ***************************** */}

{/*  ***************************** Image ***************************** 
<Image src={'/images/ข่าวประชาสัมพันธ์/2568/กันยายน/13/00.webp'} className=" " /> 
 ***************************** Image ***************************** */ }

{/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************
<div className="justify-center">
  <div >
    <p className="text-center">วิทยาลัยเทคนิคกันทรลักษ์</p>
    <p>การเเสดงต้อนรับคณะกรรมการการประเมินคุณภาพภายนอกด้านอาชีวศึกษา รอบที่ ๕ (พ.ศ.๒๕๖๗ - ๒๕๗๑) </p>
    <p>โดย นักเรียน นักศึกษา วิทยาลัยเทคนิคกันทรลักษ์ วันศุกร์ที่ ๑๘ กรกรฎาคม ๒๕๖๘</p>
    <p>ด้วยบทเพลง</p>
    <p>สนันสนุน โดย 👉 นางสาวทักษิณา ชมจันทร์ ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์ พร้อมด้วย คณะผู้บริหาร</p>
    <p>ผู้จัดซ้อม โดย 👉 จ.ส.อ.ชาติชาย ฝอยทอง</p>
    <p>Conductor โดย 👉 นายสุประวัติ ขันทอง </p>
    <p>ทีมให้กำลังใจ คณะครู วิทยาลัยเทคนิคกันทรลักษ์ </p>
    <p>ดาวน์โหลดภาพเพิ่มเติม </p>
    <Link href={'https://photos.google.com/share/AF1QipOzQF7gM5o4UGe32tHJc4dZ70pOk3pIqTLbwRz1y4AMGM82YQES71PrpsdNYTVEgg?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExd1pseXNsYlQ3ZkJkMlkxTgEe2u6A1B9wAFO6PtU_aFf3_JYlTp5Pv-Dn6XKiavTUIPQS8aFfDllbGPXaOfk_aem_M8hKOeeBSyISNlseOW8chQ&key=YWhlbzBSR25YRmpPZ2NWQ1VNa05FZkl6dkFLYkxn'}>
      <p className="link">https://photos.google.com/...</p>
    </Link>
  </div>
  <div>
    <Link target="_blank" href={"https://youtu.be/0Ts3-ppqMJ4?si=maKAeFU7zu6D0eIz"}>
      <p className="link">
        เจ้าดอกจำปา ( ເຈົ້າດອກຈຳປາ ) - เมล ตวิษา ร่วมกับ ตุ๊กตา นริศรา
      </p>
    </Link>
    <div className="flex justify-center py-2">
      <iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fngan.prachasamphanth.withyalay.thekhnikh%2Fvideos%2F629866050131715&width=500&show_text=false&appId=952832906928077&height=281"
        className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
               w-[350px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
        title=" "
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </div>
</div>
  ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */ }
