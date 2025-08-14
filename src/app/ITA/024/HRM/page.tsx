


"use client"; // top to the file
import { LinkPreview } from "@/components/ui/link-preview";
import { Data1, Data2, Data3 } from "./data";

export default function HRM() {
    return (
        <>
            <div className="grid gap-4">
                <p className="pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400">2. การบรรจุและการแต่งตั้งบุคลากร เช่น การบรรจุและแต่งตั้งพนักงานราชการ,ครูพิเศษสอน,เจ้าหน้าที่ เป็นต้น (กรณีไม่มีบรรจุและแต่งตั้ง ให้ใช้การต่อสัญญา)</p>
                <div className="flex justify-center pt-4">
                    <div
                        className=" 
                                  grid gap-2
                                  grid-cols-2
                                  sm:grid-cols-2
                                  lg:grid-cols-3
                                  ">
                        {Data1.navItems.map((item) => (
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

                <p className="pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400">3. การพัฒนาบุคลากร เช่น พัฒนาครูและบุคลากรทางการศึกษาในการจัดการเรียนรู้ เป็นต้น</p>
                <div className="flex justify-center pt-4">
                    <div
                        className=" 
                                  grid gap-2
                                  grid-cols-2
                                  sm:grid-cols-2
                                  lg:grid-cols-3
                                  ">
                        {Data3.navItems.map((item) => (
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

                <p className="pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400"> 5. การสร้างขวัญกําลังใจ เช่น การขอพระราชทานเครื่องราชอิสริยาภรณ์,การแสดงความยินดีครูและบุคลากรทางการศึกษาที่ผ่านการเลื่อนวิทยฐานะที่สูงขึ้น,การเชิดชูเกียรติครูและบุคลากรดีเด่น เป็นต้น </p>
                <div className="flex justify-center pt-4">
                    <div
                        className=" 
                                  grid gap-2
                                  grid-cols-2
                                  sm:grid-cols-2
                                  lg:grid-cols-3
                                  ">
                        {Data2.navItems.map((item) => (
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
