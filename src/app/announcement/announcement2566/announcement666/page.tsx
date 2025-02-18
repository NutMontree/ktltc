"use client"; // top to the file

import NextLink from "next/link";

import { DataAnnouncement66 } from "./data";
import AnnouncementPage from "../../page";

export default function Announcement66() {
  return (
    <>
      <AnnouncementPage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          ปีการศึกษา 2566
        </h1>
      </div>

      <div className="2566">
        <div className="flex justify-center pt-4 px-2">
          <div className=" grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6  justify-items-center justify-center ">
            {DataAnnouncement66.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                {/* <div className="mb-2 group relative rounded-xl cursor-pointer h-64 min-h-80 hover:min-h-ful"> */}
                <div className="mb-2 group relative rounded-xl cursor-pointer px-6 py-8 h-[250px] lg:h-[] lg:w-[full]  ">
                  <div
                    className="absolute inset-0 bg-contain bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover scale-90  rounded-xl"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-lg lg:text-1xl text-sky-600  ">
                    {item.name}
                  </h1>
                  <div className="text-sm">{item.description}</div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
