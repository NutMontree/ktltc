"use client"; // top to the file

import React from "react";

import Link from "next/link";

export default function Pressrelease() {
  return (
    <>
      <div>
        <div className="py-6 flex justify-center">
          <Link
            href="/pdf/ฝ่ายวิชาการ/งานพัฒนาหลักสูตรฯ/1/ขออนุญาตแก้ไขรหัสวิชา.doc"
            className="hover:text-sky-500"
          >
            ดาวน์โหลด ไฟล์เอกสาร ขออนุญาตแก้ไขรหัสวิชา...
          </Link>
        </div>
        <iframe
          className="w-full h-full aspect-video ..."
          src="/pdf/ฝ่ายวิชาการ/งานพัฒนาหลักสูตรฯ/1/ขออนุญาตแก้ไขรหัสวิชา.pdf"
        ></iframe>
      </div>
    </>
  );
}
