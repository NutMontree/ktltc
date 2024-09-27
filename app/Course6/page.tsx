"use client"; // top to the file

import React from "react";

import Link from "next/link";

export default function Course() {
  return (
    <>
      <div>
        <div className="py-6 flex justify-center">
          <Link
            href="/pdf/ฝ่ายวิชาการ/งานพัฒนาหลักสูตรฯ/6/รายงานสอนชดเชย.doc"
            className="flex gap-2"
          >
            <p className="hover:text-sky-500">ดาวน์โหลด ไฟล์เอกสาร </p>
            <p className="hover:text-red-500">Word...</p>
          </Link>
        </div>
        <iframe
          className="w-full h-full aspect-video ..."
          src="/pdf/ฝ่ายวิชาการ/งานพัฒนาหลักสูตรฯ/6/รายงานสอนชดเชย.pdf"
        ></iframe>
      </div>
    </>
  );
}
