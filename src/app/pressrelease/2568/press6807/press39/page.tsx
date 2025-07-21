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
              </div>
            ))}

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

            {/* ***************************** Video *****************************  */}
            <div className="flex justify-center">
              <div className=" py-2  gap-4">
                <iframe
                  src="https://www.youtube.com/embed/tVReYxrSav0?si=HZpppAn8DwMvccUr"
                  className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
               w-[350px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
                  title=" "
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <br />
              </div>
            </div>
            {/* ***************************** Youtube *****************************  */}
            {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
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
            {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
            {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
            <div className="justify-center">
              <div >
                <p className="text-center">วิทยาลัยเทคนิคกันทรลักษ์</p>
                <p>นำโดย 👉 นางสาวทักษิณา ชมจันทร์ ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์  พร้อมด้วย</p>
                <p>👉 นายสมศักดิ์ จันทานิตย์ รองผู้อำนวยการฝ่ายเเผนงานเเละความร่วมมือ </p>
                <p>👉 นายอาทร ศรีมะณี รองผู้อำนวยการฝ่ายวิชาการ</p>
                <p>👉 นางสาวภวิกา โพธิ์ขาว รองผู้อำนวยการฝ่ายบริหารทรัพยากร</p>
                <p>👉 นางสาววิภาวรรณ สีเเดด รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียนนักศึกษา </p>
                <p>กล่าวต้อนรับ เเละขอบคุณ เนื่องในโอกาสเข้าการการประเมินคุณภาพภายนอกด้านอาชีวศึกษา รอบที่ ๕ (พ.ศ.๒๕๖๗ - ๒๕๗๑)</p>
                <p>ในวันที่ ๑๘ กรกฎาคม ๒๕๖๘ ณ ห้องประชุมผามออีแดง อาคารเฉลิมพระเกียรติ วิทยาลัยเทคนิคกันทรลักษ์</p>
                <p>ดาวน์โหลดภาพเพิ่มเติม </p>
                <Link href={'https://photos.google.com/share/AF1QipOzQF7gM5o4UGe32tHJc4dZ70pOk3pIqTLbwRz1y4AMGM82YQES71PrpsdNYTVEgg?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExd1pseXNsYlQ3ZkJkMlkxTgEe1kj9jR4IR15rGS6AHP1-d1Ai7H73TmaPxRbr1fdzrBVDjJafPuq34wYU0kU_aem_5IkJp5L-xU5VxsyCOeQ4qw&key=YWhlbzBSR25YRmpPZ2NWQ1VNa05FZkl6dkFLYkxn'}>
                  <p className="link">https://photos.google.com/...</p>
                </Link>
              </div>
              <div>
                <div className="flex justify-center py-2">
                  <iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fngan.prachasamphanth.withyalay.thekhnikh%2Fvideos%2F1431103704879682&width=500&show_text=false&appId=952832906928077&height=281"
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
              {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
              {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
              <div className="justify-center">
                <div >
                  <p className="text-center">วิทยาลัยเทคนิคกันทรลักษ์</p>
                  <p>👉นางสาวฐิติยาภรณ์ จอมใส นักเรียนเเผนกวิชาก่อสร้าง - โยธา ระดับชั้นประกาศนียบัตรวิชาชีพ</p>
                  <p>ตัวเเทนนักเรียน นักศึกษากล่าว ยินดี เเละเเสดงความรู้สึกในการได้เข้าศึกษาในสถานศึกษาวิทยาลัยเทคนิคกันทรลักษ์ เนื่องในโอกาสเข้าการการประเมินคุณภาพภายนอกด้านอาชีวศึกษา รอบที่ ๕ (พ.ศ.๒๕๖๗ - ๒๕๗๑)</p>
                  <p>ภายใต้ความดูเเลของ 👉นางสาวทักษิณา ชมจันทร์ ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์  คณะผู้บริหาร ครู บุคลากรทางการศึกษา</p>
                  <p>วันที่ ๑๘ กรกฎาคม ๒๕๖๘ ณ ห้องประชุมผามออีแดง อาคารเฉลิมพระเกียรติ วิทยาลัยเทคนิคกันทรลักษ์ </p>
                  <p>ดาวน์โหลดภาพเพิ่มเติม </p>
                  <Link href={'https://photos.google.com/share/AF1QipOzQF7gM5o4UGe32tHJc4dZ70pOk3pIqTLbwRz1y4AMGM82YQES71PrpsdNYTVEgg?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExd1pseXNsYlQ3ZkJkMlkxTgEe1kj9jR4IR15rGS6AHP1-d1Ai7H73TmaPxRbr1fdzrBVDjJafPuq34wYU0kU_aem_5IkJp5L-xU5VxsyCOeQ4qw&key=YWhlbzBSR25YRmpPZ2NWQ1VNa05FZkl6dkFLYkxn'}>
                    <p className="link">https://photos.google.com/...</p>
                  </Link>
                </div>
                <div>
                  <div className="flex justify-center py-2">
                    <iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fngan.prachasamphanth.withyalay.thekhnikh%2Fvideos%2F1741899216454419&width=500&show_text=false&appId=952832906928077&height=500"
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
                {/* ***************************** Video Facabook https://developers.facebook.com/docs/plugins/embedded-video-player/ *****************************  */}
              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  );
}