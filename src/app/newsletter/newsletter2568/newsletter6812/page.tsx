"use client"; // top to the file

import NextLink from "next/link";
import { Data } from "./data";
import Newsletter2568 from "../page";

export default function Newsletter() {
  return (
    <>
      <Newsletter2568 />

      <div>
        <h1 className="flex justify-center pt-8 text-xl text-[#DAA520]">
          เดือน ธันวาคม 2568
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 justify-center justify-items-center gap-2 md:grid-cols-3 lg:grid-cols-3">
            {Data.navItems.map((item, index) => (
              <NextLink key={`${item.href}-${index}`} href={item.href}>
                <div className="relative mb-6 h-[250px] overflow-hidden rounded-xl shadow-lg lg:h-[500px] lg:w-[full]">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-500 hover:scale-110"
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
