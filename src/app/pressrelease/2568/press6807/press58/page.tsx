"use client"; // top to the file

import React from "react";
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import { FootTitle } from "@/components/FootTitle";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import Link from "next/link";

export default function Pressrelease() {

  return (
    <>
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
            className: 'dark:text-white dark:hover:text-white'
          },
          {
            href: '/pressrelease/2568/press6807',
            className: 'dark:text-white dark:hover:text-white',
            title: (
              <>
                <UserOutlined />
                <span>Application List</span>
              </>
            ),
          },
          {
            title: 'Application',
            className: 'dark:text-gray-400'
          },
        ]}
      />
      <section className="pt-20">
        <div className="">
          <div className="text-center text-xl pb-6">
            {DataPressrelease.Item.map((item) => (
              <div key={item.title}>{item.title}</div>
            ))}
          </div>
          <div className='grid gap-4'>
            {Description.map((item) => (
              <div key={item?.description ?? "undefined"}>
                {item?.description && <div >{item.description}</div>}
                {/* {item?.tage && <div className="text-sky-600 dark:text-sky-300">{item.tage}</div>} */}
              </div>
            ))}

            {/* ***************************** LInk And PDF ***************************** */}
            <div className="">
              <p className="text-sky-800 text-lg">
                ขอเชิญชวนร่วมลงนามถวายพระพร ผ่านเว็บไซต์
              </p>
              <Link
                href="
https://wellwishes.royaloffice.th/index.php/home/index/47?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExTHlFcTRMV29GM1RvNGRDNQEeYRe5lo4wxAbaLBqmAsEQroJlQ3cgK_-YwphePGKntESjaaxAzdupErK-EQ8_aem_17Knof8HpCgczuko93VS_A
"
                className="hover:text-sky-500"
                target="_blank"
              >
                https://wellwishes.royaloffice.th/
              </Link>
              <p>
                เนื่องในโอกาสวันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระปรเมนทรรามาธิบดีศรีสินทร มหาวชิราลงกรณ พระวชิรเกล้าเจ้าอยู่หัว  ๒๘ กรกฎาคม ๒๕๖๘
              </p>
            </div>
            {/* ***************************** LInk And PDF ***************************** */}

            <div className=''>
              <FootTitle />
            </div>

            <div className="date flex py-2 gap-2">
              <Image src='/images/icon/time-svgrepo-com.svg' alt='logo-youtube' className="pt-1" width={20} height={20} />
              {DataDate.map((item) => (
                <div key={item.date}>
                  <div className="text-xs text-slate-500 pt-1">{item.date}</div>
                </div>
              ))}
            </div>
            <br />

            {/* ***************************** Youtube *****************************  */}

            {/* ***************************** Youtube *****************************  */}

            <div className="flex justify-center">
              <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center pb-4">
                {ImageItem.map((item) =>
                  item ? (
                    <div key={item.imgs}>
                      <div className="scale-95 hover:scale-100 transition duration-500 rounded-full">
                        <Image src={item.imgs} alt={""}></Image>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  );
}

/* ***************************** LInk And PDF ***************************** */
{/* 
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
*/}
/* ***************************** LInk And PDF ***************************** */


/* ***************************** Youtube ***************************** */
{/* 
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
*/}
/* ***************************** Youtube ***************************** */


{/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */ }
{/* 
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
*/}
{/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */ }
