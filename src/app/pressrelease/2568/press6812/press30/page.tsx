"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  LeftOutlined,
  RightOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { Image } from "@heroui/react";
import { motion } from "framer-motion";
import {
  DataDate,
  DataPressrelease,
  Description,
  ImageItem,
  TageLink,
  ZeroNameImage,
} from "./data";
import { FootTitle } from "@/components/FootTitle";

// --- Animation Variants ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function PressReleaseModern() {
  const title = DataPressrelease?.Item?.[0]?.title || "รายละเอียดผลงาน";
  const date = DataDate?.[0]?.date || "-";

  const navData: any = DataPressrelease?.Pagination || {
    prev: null,
    next: null,
  };
  const validImages = ImageItem?.filter((item: any) => item?.imgs) || [];
  const isSingleImage = validImages.length === 1;

  const getGridClassName = () => {
    if (isSingleImage) return "grid-cols-1";
    const desktopCols =
      validImages.length === 2
        ? "lg:grid-cols-1"
        : validImages.length === 3
          ? "lg:grid-cols-3"
          : "lg:grid-cols-4";
    return `grid-cols-1 sm:grid-cols-2 ${desktopCols}`;
  };

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 md:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 pl-1">
          <Breadcrumb
            items={[
              {
                href: "/",
                title: (
                  <span className="flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-400">
                    <HomeOutlined />
                    <span>Home</span>
                  </span>
                ),
              },
              {
                href: "/pressrelease/2568/press6812",
                title: (
                  <span className="flex items-center gap-1 text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-400">
                    <AppstoreOutlined />
                    <span>Projects</span>
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    Details
                  </span>
                ),
              },
            ]}
          />
        </nav>

        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVar}
          className="space-y-10"
        >
          {/* Header */}
          <motion.header
            variants={itemVar}
            className="space-y-4 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <CalendarOutlined /> <span>{date}</span>
            </div>
            <h1 className="text-center text-3xl leading-tight font-bold tracking-tight text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
              {title}
            </h1>
          </motion.header>

          {/* Description */}
          <motion.section variants={itemVar}>
            <article className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              {Description.map((item, index) => (
                <p key={index} className="leading-relaxed">
                  {item.description}
                </p>
              ))}
            </article>

            {TageLink && TageLink.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-neutral-800">
                {TageLink.map((item: any, index: number) => (
                  <Link key={index} href={item.href || "#"} target="_blank">
                    <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-neutral-700">
                      <LinkOutlined className="text-slate-400" /> {item.tage}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* /* ***************************** LInk And PDF ***************************** */}
          <div className="py-">
            <p className="text-lg text-sky-800">Download File PDF</p>
            <Link
              href="/images/ข่าวประชาสัมพันธ์/2568/ธันวาคม/30/รายงานการสำรวจนักเรียนนักศึกษา.pdf"
              className="hover:text-sky-500"
              target="_blank"
            >
              รายงานการสำรวจนักเรียนนักศึกษา
              ที่มีการอพยพในช่วงเหตุการณ์การปะทะกันตามแนวชายแดนไทย-กัมพูชา
              ตั้งแต่วันที่ 7 ธันวาคม 2568
            </Link>

            <iframe
              className="aspect-video h-screen w-full pt-4"
              src="/images/ข่าวประชาสัมพันธ์/2568/ธันวาคม/30/รายงานการสำรวจนักเรียนนักศึกษา.pdf"
            ></iframe>
          </div>
          {/* /* ***************************** LInk And PDF ***************************** */}

          {/* Footer */}
          <motion.footer variants={itemVar} className="opacity-60">
            <FootTitle />
          </motion.footer>

          {/* Gallery */}
          {validImages.length > 0 && (
            <motion.section variants={itemVar}>
              <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <PictureOutlined />
                <h3 className="text-lg font-semibold">
                  {isSingleImage ? "Featured Image" : "Gallery"}
                </h3>
              </div>
              <div
                className={`grid gap-4 transition-all duration-300 ${getGridClassName()}`}
              >
                {validImages.map((item: any, index: number) => (
                  <div
                    key={index}
                    // *** แก้ไขตรงนี้ครับ ***
                    // เปลี่ยนจากเดิมที่มีการกำหนดความสูง h-[50vh]... เป็น "" (ค่าว่าง) เมื่อมีรูปเดียว
                    className={`relative overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 ${
                      isSingleImage ? "" : ""
                    }`}
                  >
                    <Image
                      src={item.imgs}
                      alt={`Gallery ${index + 1}`}
                      removeWrapper
                      className={`h-full w-full object-cover transition-transform duration-700 hover:scale-105 ${
                        isSingleImage ? "object-center" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          )}
          {ZeroNameImage.map((item: any) =>
            item && item.imgs ? (
              <div key={item.imgs}>
                <div className="scale-95 rounded-full transition duration-500 hover:scale-100">
                  <Image isBlurred src={item.imgs} alt={""}></Image>
                </div>
              </div>
            ) : null,
          )}

          {/* Navigation Buttons */}
          <motion.nav
            variants={itemVar}
            className="border-t border-slate-200 pt-8 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between gap-4">
              {navData.prev ? (
                <Link
                  href={navData.prev.href}
                  className="group flex w-1/2 items-center justify-start gap-3 pr-4 transition-all hover:-translate-x-1"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors group-hover:border-blue-300 group-hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-900 dark:group-hover:border-blue-900/50 dark:group-hover:bg-blue-900/20">
                    <LeftOutlined className="text-slate-400 transition-colors group-hover:text-blue-600" />
                  </div>
                  <div className="text-left sm:block">
                    <span className="block text-xs font-medium tracking-wide text-slate-400 uppercase">
                      Previous
                    </span>
                    <span className="line-clamp-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-200">
                      {navData.prev.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="w-1/2" />
              )}

              {navData.next ? (
                <Link
                  href={navData.next.href}
                  className="group flex w-1/2 items-center justify-end gap-3 pl-4 transition-all hover:translate-x-1"
                >
                  <div className="text-right sm:block">
                    <span className="block text-xs font-medium tracking-wide text-slate-400 uppercase">
                      Next
                    </span>
                    <span className="line-clamp-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-200">
                      {navData.next.title}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors group-hover:border-blue-300 group-hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-900 dark:group-hover:border-blue-900/50 dark:group-hover:bg-blue-900/20">
                    <RightOutlined className="text-slate-400 transition-colors group-hover:text-blue-600" />
                  </div>
                </Link>
              ) : (
                <div className="w-1/2" />
              )}
            </div>
          </motion.nav>
        </motion.main>
      </div>
    </div>
  );
}

{
  /*  ***************************** LInk And PDF ***************************** 
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
***************************** LInk And PDF ***************************** */
}

{
  /*  ***************************** Youtube *****************************  

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

***************************** Youtube ***************************** */
}

{
  /*  ***************************** Image ***************************** 
<Image src={'/images/ข่าวประชาสัมพันธ์/2568/กันยายน/13/00.webp'} className=" " /> 
 ***************************** Image ***************************** */
}

{
  /* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************
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
  ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */
}
