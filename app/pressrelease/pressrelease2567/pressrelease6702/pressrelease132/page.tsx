"use client"; // top to the file
import React from "react";

import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export default function Pressrelease() {
  return (
    <>
      <div>
        <div className="text-center text-xl">
          {DataPressrelease.Item.map((item) => (
            <div key={item.title}>{item.title}</div>
          ))}
        </div>
        <div>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </div>

        <div className="link">
          👉ทั้งนี้ ศิษย์เก่า ศิษย์ปัจจุบัน ผู้ที่สนใจเสื้อ
          เเละของที่ระลึกครบรอบ 30 ปี แห่งการสถาปนาสถาบัน
          วิทยาลัยเทคนิคกันทรลักษ์
          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://l.facebook.com/l.php?u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2Fe%2F1FAIpQLSdYKPN5JE0DBs7FEfkCLMXkWd3SFfpyFvAlr0zxFoSIDQl2pw%2Fviewform%3Ffbclid%3DIwZXh0bgNhZW0CMTAAAR0Za4t3iCS0NW3Y4yWwod7QNtQOYm54HY_GnZSinjzYrVD97BjucaElLNg_aem_oLumPUPYyDs0meDaC5cT_Q&h=AT3N0UMG9sfbEi75YQ_NV89-SBegkE9qQyZc9xxA9HOUDucM5gdRXJnjvLl_m4HgDAGddd3DsBqd6cUcB1kl4VQaxeWYgSmuvjlDe830QJfXS7uRCMRG1H82zKZ_It1f_li_&__tn__=-UK-R&c[0]=AT2uQ0jTHhxjxXNatHfNaFfJTS0dzTCdXTZ_Wik30Oe7Zas0UnsGQO2uhB_zi9BGVm7ceiUlUiCdAAJ5DG3Arq0SgawVhgCof38nFXwKY_9ZT1W7ZtqTQ9CSulQMgdp9MiZKaoDgV8WefwPkVm_asa9_KLlTcn-4t1Nex1wAkI-CeqxjBDLd"
          >
            สามารถสั่งซื้อได้ที่นี่
          </Link>
        </div>
        <div className="link">
          👉ทั้งนี้ ศิษย์เก่า ศิษย์ปัจจุบัน ผู้ที่สนใจร่วมทุนการศึกษา
          เเละระดมทุนซ่อมบำรุงสถานศึกษา
          ก่อตั้งชมรมศิษย์เก่าวิทยาลัยเทคนิคกันทรลักษ์ #เทคนิคกันท์
          สามารถกดเข้าไปในลิ้งค์ได้ที่นี่
          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://line.me/ti/p/p1nCsMdkqq?fbclid=IwZXh0bgNhZW0CMTAAAR0hACWZa7pjCZyTe4BuePe_DUjeq-xwaFTH72LKFodGTrtqIEXjLcLru4g_aem_dEoJ1K3Dy467Yzi6Nhjc1g"
          >
            สามารถกดเข้าไปในลิ้งค์ได้ที่นี่
          </Link>
        </div>
        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className=" scale-90  hover:scale-110 transition duration-500 rounded-full ">
                  <Image src={item.img} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
