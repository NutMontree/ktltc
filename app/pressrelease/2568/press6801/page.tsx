"use client"; // top to the file

import PressReleasePage from "../../page";

import NextLink from "next/link";
import { DataPressrelease } from "./data";

export default function Page() {
  return (
    <>
      <PressReleasePage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          เดือน พฤศจิกายน 2567
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4">
          <div
            className=" 
            grid gap-4
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
           "
          >
            {DataPressrelease.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div
                  className="mb-2 group relative rounded-xl cursor-pointer 
                h-36
                md:h-44
                xl:h-60
                "
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover scale-90 rounded-xl"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-base text-sky-600">{item.name}</h1>
                  <div className="text-sm">{item.description}</div>
                  <div className="text-xs text-slate-500">{item.date}</div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
