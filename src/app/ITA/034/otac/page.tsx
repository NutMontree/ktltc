


"use client"; // top to the file
import { LinkPreview } from "@/components/ui/link-preview";
import { DataOTAC } from "./data";

export default function OTAC() {
    return (
        <>
            <div className="">
                <div className="flex justify-center pt-4">
                    <div
                        className=" 
                                  grid gap-2
                                  grid-cols-2
                                  sm:grid-cols-2
                                  lg:grid-cols-2
                                  ">
                        {DataOTAC.navItems.map((item) => (
                            <LinkPreview key={item.href} url={item.href}>
                                <div
                                    className="mb-2 group relative rounded-xl cursor-pointer 
                                               h-[100px]
                                               sm:h-[170px]
                                               md:h-[210px]
                                               lg:h-[300px]
                                               xl:h-[400px]
                                               ">
                                    <div
                                        className="absolute inset-0 bg-cover bg-top hover:scale-100 transition duration-500 cursor-pointer object-cover scale-95 rounded-xl"
                                        style={{
                                            backgroundImage: `url(${item.backgroundImage})`,
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-[14px] md:text-[20px] sm:text-sm md:text-base text-sky-600 hover:text-sky-400" >
                                        {item.name}
                                    </h1>
                                    <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base mb-2 flex">
                                        <div>
                                            {item.description}
                                            < p className="text-gray-500">
                                                ...ดูเพิ่มเติม
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </LinkPreview>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
