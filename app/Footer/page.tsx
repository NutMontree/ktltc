"use client"; // top to the file

import { Link } from "@nextui-org/link";

export default function Footer() {
  return (
    <>
      <div>
        <div></div>
        <div>KTLTC</div>
        <div>วิทยาลัยเทคนิคกันทรลักษ์</div>
      </div>

      <div className="w-full py-3 ">
        <div className="flex gap-2 justify-center">
          <div className="text-default-600 text-xs">Copyright © 2023.</div>

          <div className="text-xs text-cyan-700">
            KTLTC / งานศูนย์ข้อมูลและสารสนเทศ
          </div>
        </div>
        <div className="flex gap-2 justify-center ">
          <div className="text-default-600 text-xs"> Designed </div>
          <Link
            isExternal
            className="flex justify-center gap-1 text-current "
            href="https://www.facebook.com/profile.php?id=61553558543619"
            title="All M Min"
          >
            <div className="text-xs font-medium">By All M Min</div>
          </Link>
        </div>
      </div>
    </>
  );
}
