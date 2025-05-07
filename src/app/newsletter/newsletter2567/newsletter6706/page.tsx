"use client"; // top to the file

import NextLink from "next/link";
import NewsletterPage from "../../page";
import { Data } from "./data";

export default function Newsletter() {
  return (
    <>
      <NewsletterPage />

      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-8">
          เดือน มิถุนายน 2567
        </h1>
      </div>

      <div className="2567">
        <div className="flex justify-center pt-4 px-2">
          <div className=" grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4  justify-items-center justify-center ">
            {Data.navItems.map((item) => (
              <NextLink key={item.href} href={item.href}>
                <div className="mb-4 group relative shadow-lg text-white rounded-xl px-6 py-8 h-[250px] lg:h-[500px] lg:w-[full] overflow-hidden cursor-pointer ">
                  <div
                    className="absolute inset-0 bg-contain bg-center hover:scale-110 transition duration-500 cursor-pointer object-cover"
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
