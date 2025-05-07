"use client"; // top to the file

import Link from "next/link";
import React from "react";

export default function MiniGame() {
  return (
    <>
      <div className="">
        <div className="">
          <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
            Mini Game
          </h1>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/snakegame" className="">
            <p className="hover:text-sky-500 flex justify-center">เกมงู</p>
            <p className="flex justify-center text-xs">
              (สำหรับเครื่อง เครื่องคอมพิวเตอร์ และ โน๊ตบุ๊ค เท่านั้น)
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
