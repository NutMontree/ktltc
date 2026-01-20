"use client"; // top to the file

import NextLink from "next/link";
import { DataAnnouncement } from "./data";
import { Image } from "@heroui/image";
import Announcement2568 from "../page";

export default function Announcement() {
  return (
    <>
      <Announcement2568 />

      <div>
        <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
          เดือน มกราคม 2569
        </h1>
      </div>

      <div>
        <div className="flex justify-center pt-4">
          {/* ปรับ Grid เป็น 2 คอลัมน์ในมือถือ และสูงสุด 4 ในจอใหญ่ */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {DataAnnouncement.navItems.map((item, index) => (
              <NextLink key={`${item.href}-${index}`} href={item.href}>
                {/* Image Container ปรับความสูงตามขนาดหน้าจอและใส่ Effect Scale */}
                <div className="group relative mb-2 h-[170px] cursor-pointer rounded-xl sm:h-[170px] md:h-[210px] lg:h-[210px] xl:h-[300px]">
                  <div
                    className="absolute inset-0 scale-95 cursor-pointer rounded-xl bg-cover bg-top object-cover transition duration-500 hover:scale-100"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>

                {/* ส่วนรายละเอียดข้อความ */}
                <div>
                  <h1 className="text-3.5 text-sky-600 hover:text-sky-400 sm:text-sm md:text-base md:text-[20px]">
                    {item.name}
                  </h1>
                  <div className="text-3 md:text-3.5 mb-2 flex sm:text-sm md:text-base">
                    <div>{item.description}</div>
                  </div>

                  {/* ส่วนแสดงไอคอนปฏิทินและวันที่ */}
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/icons8-calendar.gif"
                      alt="calendar-icon"
                      width={20}
                      height={20}
                    />
                    <div className="text-3 md:text-3.5 text-xs text-slate-500 sm:text-sm md:text-base">
                      {item.date}
                    </div>
                  </div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
