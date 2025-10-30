"use client"; // top to the file

import NextLink from "next/link";

import { DataAnnouncement } from "./data";
import ExternalInternal from "../externalinternal/page";

export default function WorkClerical() {
  return (
    <>
      <ExternalInternal />

      <div>
        <h1 className="flex justify-center text-xl ">งานพัฒนาหลักสูตรฯ</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          WorkCurriculum
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4">
          <div className=" grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-3  justify-items-center justify-center ">
            {DataAnnouncement.navItems.map((item, index) => (
              <NextLink key={`${item.href}-${index}`} href={item.href}>
                <div className="mb-2 group relative rounded-xl cursor-pointer min-h-48 ">
                  <div
                    className="absolute inset-0 bg-cover bg-center hover:scale-100 transition duration-500 cursor-pointer object-cover scale-95 rounded-xl"
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
