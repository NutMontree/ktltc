"use client"; // top to the file

import { LinkPreview } from "@/components/ui/link-preview";
import { DataNGP } from "./data";

export default function NGP() {
  return (
    <>
      <div className="">
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-2">
            {DataNGP.navItems.map((item) => (
              <LinkPreview key={item.href} url={item.href}>
                <div className="group relative mb-2 h-[100px] cursor-pointer rounded-xl sm:h-[170px] md:h-[210px] lg:h-[300px] xl:h-[400px]">
                  <div
                    className="absolute inset-0 scale-95 cursor-pointer rounded-xl bg-cover bg-top object-cover transition duration-500 hover:scale-100"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-3.5 text-sky-600 hover:text-sky-400 sm:text-sm md:text-base md:text-[20px]">
                    {item.name}
                  </h1>
                  <div className="text-3 md:text-3.5 mb-2 flex sm:text-sm md:text-base">
                    <div>
                      {item.description}
                      <p className="text-gray-500">...ดูเพิ่มเติม</p>
                    </div>
                  </div>
                  {/* <div className="flex gap-2">
                                        <Image src='/images/icons8-calendar.gif' alt='logo-youtube' width={20} height={20} />
                                        <div className="text-xs text-slate-500 text-3 md:text-3.5 sm:text-sm md:text-base">
                                            {item.date}
                                        </div>
                                    </div> */}
                </div>
              </LinkPreview>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
