"use client"; // top to the file

import { Image } from "@nextui-org/react";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <div className="">
        <footer className="bottom-0 left-0 z-20 w-full border-t border-y  shadow md:flex   md:justify-between md:p-18 px-16 py-12">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            {/* © 2023
            <a href="https://flowbite.com/" className="hover:underline">
              Flowbite™
            </a>
            . All Rights Reserved. */}
            <div>
              <Image
                removeWrapper
                alt="Relaxing app background"
                className="w-60 py-2"
                src="/images/ktl.png"
              />
            </div>
            <div className="flex gap-2 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>061-4122765 หรือ 045-811753</div>
            </div>
            <div className="flex gap-2 py-2 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clip-rule="evenodd"
                />
              </svg>

              <Link href="https://www.google.co.th/maps/place/7P66QM35%2BJ68/@14.7540375,104.6555032,17z/data=!3m1!4b1!4m4!3m3!8m2!3d14.7540375!4d104.6580781?hl=th&entry=ttu&g_ep=EgoyMDI0MDgyMy4wIKXMDSoASAFQAw%3D%3D">
                QM35+J68 ตำบล จานใหญ่ อำเภอกันทรลักษ์ ศรีสะเกษ 33110
              </Link>
            </div>
            <div className="flex gap-2 py-2 pl-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
              ktl11022021@gmail.com
            </div>
          </span>

          <div className=" py-2 mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <div className="py-2">
              <div className="py-2">
                <Link
                  href="/pressrelease"
                  className="hover:underline me-4 md:me-6"
                >
                  ข่าวประชาสัมพันธ์
                </Link>
              </div>
              <div className="py-2">
                <Link
                  href="/newsletter"
                  className="hover:underline me-4 md:me-6"
                >
                  จดหมายข่าว
                </Link>
              </div>
              <div className="py-2">
                <Link
                  href="/announcement"
                  className="hover:underline me-4 md:me-6"
                >
                  ข่าวประกาศ
                </Link>
              </div>
              <div className="py-2">
                <Link href="/bidding" className="hover:underline">
                  ข่าวประกวดราคา
                </Link>
              </div>
              <div className="py-2">
                <Link
                  href="/technicalcollegeorders"
                  className="hover:underline"
                >
                  คำสั่งวิทยาลัยเทคนิค
                </Link>
              </div>
            </div>
          </div>

          <div className=" py-2  mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <div className="py-2">
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
            </div>
          </div>

          <div className=" py-2    mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <div className="py-2">
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline me-4 md:me-6">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
              <div className="py-2">
                <Link href="/ " className="hover:underline">
                  เพิ่มเนิ่อหา
                </Link>
              </div>
            </div>
          </div>
        </footer>
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
