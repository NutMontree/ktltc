"use client"; // top to the file

import NextLink from "next/link";

import { DataAnnouncement } from "./data";
import Announcement2568 from "../page";

export default function Announcement() {
  return (
    <>
      <Announcement2568 />

      <div>
        <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
          เดือน ธันวาคม 2568
        </h1>
      </div>

      <div className=" ">
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 justify-center justify-items-center gap-2 md:grid-cols-3 lg:grid-cols-3">
            {DataAnnouncement.navItems.map((item, index) => (
              <NextLink key={`${item.href}-${index}`} href={item.href}>
                <div className="group relative mb-2 min-h-48 cursor-pointer rounded-xl">
                  <div
                    className="bg- absolute inset-0 scale-95 cursor-pointer rounded-xl bg-cover object-cover transition duration-500 hover:scale-100"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="lg:text-1xl text-lg text-sky-600">
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
