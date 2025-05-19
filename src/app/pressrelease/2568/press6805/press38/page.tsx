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
            href: '/pressrelease/2568/press6805',
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
              <div key={item?.description ?? "undefined"}>
                {item?.description && <div>{item.description}</div>}
              </div>
            ))}

            {/* ***************************** LInk And PDF ***************************** */}
            <div className="pt-4">
              <p className="text-sky-800 text-lg">
                สามารถดูข้อมูลเพิ่มเติมได้ที่นี่
              </p>
              <Link
                href="

https://drive.google.com/file/d/1cPE-WfUtjPrJmdimx3LeUuNrS0WdflG3/view?fbclid=IwY2xjawKXeHRleHRuA2FlbQIxMABicmlkETFPdXk4Q3I5V3FqMzg3cmFEAR52lXwXQQ1NydQ8E0wjOmUnIRBYLH6KDAaGsKNGoXeS-3yMOpi6Lchr2DmaPQ_aem_W0pb7FLvSSQZXilmN9HtzQ
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

            {/* ***************************** Youtube *****************************  */}

            <div className="flex justify-center">
              <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 justify-items-center justify-center pb-4">
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

/* ***************************** LInk And PDF ***************************** */
/*             
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
 */
/* ***************************** LInk And PDF ***************************** */


{/* ***************************** Youtube *****************************  */ }
{/* <div className="flex justify-center">
  <div className="px-2 py-2  gap-4">
    <iframe
      className="h-[200px] sm:h-[400px] lg:h-[500px] xl:h-[600px] 
               w-[350px] sm:w-[600px] lg:w-[700px] xl:w-[1080px] "
      src="/images/ข่าวประชาสัมพันธ์/2568/พฤษภาคม/13/1.mp4"
      title=" "
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
    <br />
  </div>
</div> */}
{/* ***************************** Youtube *****************************  */ }
