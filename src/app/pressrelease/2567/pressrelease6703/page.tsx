"use client"; // top to the file

import PressReleasePage from "../../page";
import { DataPressrelease6703 } from "./data";

import NextLink from "next/link";

export default function Pressrelease6703() {
  return (
    <>
      <PressReleasePage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          เดือน มีนาคม 2567
        </h1>
      </div>

      <div className="2557">
        <div className="flex justify-center pt-4 px-2">
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4  justify-items-center justify-center ">
            {DataPressrelease6703.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div className="mb-2 group relative rounded-xlcursor-pointer min-h-52 hover:min-h-ful">
                  <div
                    className="absolute inset-0 bg-contain bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover scale-90  rounded-xl"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div className=" ">
                  <h1 className="text-lg lg:text-1xl text-sky-600  ">
                    {item.name}
                  </h1>
                  <div className="text-sm  ">{item.description}</div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
