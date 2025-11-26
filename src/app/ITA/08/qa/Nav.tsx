import Link from "next/link";
import React from "react";

export default function Nav() {
  return (
    <div>
      <div className="dark:bg-dark relative z-10 overflow-hidden pt-[100px] pb-[60px]">
        <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-linear-to-r"></div>
        <div className="text-center">
          <h1 className="flex justify-center text-xl">ระบบ Q & A </h1>
          <h1 className="flex justify-center pb-8 text-xl text-[#DAA520]">
            Q & A และช่องทางรับฟังความคิดเห็นวิทยาลัยเทคนิคกันทรลักษ์
          </h1>
          <ul className="flex items-center justify-center gap-2.5">
            <li>
              <Link
                href="/"
                className="flex items-center gap-2.5 text-base font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <p className="flex items-center gap-2.5 text-base font-medium">
                <span className=" ">/</span>
                Q&A System
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
