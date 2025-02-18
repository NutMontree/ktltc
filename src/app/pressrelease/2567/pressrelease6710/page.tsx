"use client"; // top to the file

import PressReleasePage from "../../page";

import NextLink from "next/link";
import { DataPressrelease } from "./data";

export default function Pressrelease6710() {
  return (
    <>
      <PressReleasePage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          เดือน กรกฏาคม 2567
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4 px-2">
          <div
            className=" grid gap-1 
                        grid-cols-2 
                        md:grid-cols-4 
             
                        "
          >
            {DataPressrelease.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div className="mb-2 group relative rounded-xl cursor-pointer min-h-40 ">
                  <div
                    className="absolute inset-0 bg-cover bg-center hover:scale-100 transition duration-500 cursor-pointer object-cover scale-95 rounded-xl"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-base text-sky-600">{item.name}</h1>
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
