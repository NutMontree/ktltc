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
            href: '/pressrelease/2568/press6803',
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
          <div className="text-center text-xl pb-6 px-2">
            {DataPressrelease.Item.map((item) => (
              <div key={item.title}>{item.title}</div>
            ))}
          </div>
          <div className='px-2'>
            {Description.map((item) => (
              <div key={item.description}>
                <div>{item.description}</div>
              </div>
            ))}

            {/* ***************************** LInk And PDF ***************************** */}
            <div className="pt-4">
              <p className="text-sky-800 text-lg">
                รายละเอียดเพิ่มเติม
              </p>
              <Link
                href="
https://drive.google.com/drive/folders/1qXPJGWge7auzh8DFmUU8prPHqNJXxyqd?fbclid=IwZXh0bgNhZW0CMTAAAR0jaGOanS9eJoXoDvJAAs0mbPKrW6Uh-0NKUB-Rc7C574uTSVflhCuAQLM_aem_lTHaWvi0PBbGM88P5M2gDQ
// "
                className="hover:text-sky-500"
                target="_blank"
              >
                https://drive.google.com/...
              </Link>
              <iframe
                className="w-full aspect-video pt-4"
                src="/images/ข่าวประชาสัมพันธ์/2568/มีนาคม/3/1.pdf"
              ></iframe>
            </div>
            {/* ***************************** LInk And PDF ***************************** */}

            <div className='px-2'>
              <FootTitle />
            </div>

            <div className="date px-2 flex py-2 gap-2">
              <Image src='/images/icon/time-svgrepo-com.svg' alt='logo-youtube' className="pt-1" width={20} height={20} />
              {DataDate.map((item) => (
                <div key={item.date}>
                  <div className="text-xs text-slate-500 pt-1">{item.date}</div>
                </div>
              ))}
            </div>
            <br />

            {/* ***************************** Youtube ***************************** */}

            <div className="flex justify-center">
              <div className="  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center pb-4">
                {ImageItem.map((item) => (
                  <div key={item.imgs}>
                    <div className="scale-95 hover:scale-100 transition duration-500 rounded-full">
                      <Image src={item.imgs} alt={""}></Image>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

{
  /* ***************************** LInk And PDF ***************************** */
}
{
  /* <div className="pt-4">
          <p className="text-sky-800 text-lg">
            รายชื่อนักเรียน ระดับประกาศนียบัตรวิชาชีพ (ปวช.)
          </p>
          <Link
            href="
https://cdn3.me-qr.com/pdf/2fd30bda-eb3a-4da3-abe1-ad5ee6429e7a.pdf?fbclid=IwZXh0bgNhZW0CMTAAAR0IMoDmXKnVoZf7tp4ITPz8_WgYF4yfnn0faZ_NIkfyDHFPsHUbXsRcpfI_aem_w8OfvxoMNFUMDrDWYGfYUQ
// "
            className="hover:text-sky-500"
            target="_blank"
          >
            https://drive.google.com/...
          </Link>

          <iframe
            className="w-full aspect-video pt-4"
            src="/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/38/1.pdf"
          ></iframe>
        </div> */
}

{
  /* ***************************** LInk And PDF ***************************** */
}

{
  /* ***************************** Youtube ***************************** */
}

{
  /* <div className="flex justify-center">
          <div className="px-2 py-2  gap-4">
            <iframe
              className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
                         w-[200px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
              // src="/images/ข่าวประชาสัมพันธ์/2567/พฤศจิกายน/30/1.webm"
              src="/images/ข่าวประชาสัมพันธ์/2567/ธันวาคม/31/1.mp4"
              title=" "
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <br />
          </div>
        </div> */
}

{
  /* ***************************** Youtube ***************************** */
}
