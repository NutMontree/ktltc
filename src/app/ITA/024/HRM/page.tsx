"use client"; // top to the file
import { LinkPreview } from "@/components/ui/link-preview";
import { Data1, Data2, Data3 } from "./data";

export default function HRM() {
  return (
    <>
      <div className="grid gap-4">
        <p className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
          2. การบรรจุและการแต่งตั้งบุคลากร เช่น
          การบรรจุและแต่งตั้งพนักงานราชการ,ครูพิเศษสอน,เจ้าหน้าที่ เป็นต้น
          (กรณีไม่มีบรรจุและแต่งตั้ง ให้ใช้การต่อสัญญา)
        </p>
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Data1.navItems.map((item) => (
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
                </div>
              </LinkPreview>
            ))}
          </div>
        </div>

        <p className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
          3. การพัฒนาบุคลากร เช่น
          พัฒนาครูและบุคลากรทางการศึกษาในการจัดการเรียนรู้ เป็นต้น
        </p>
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Data3.navItems.map((item) => (
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
                </div>
              </LinkPreview>
            ))}
          </div>
        </div>

        <p className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
          {" "}
          5. การสร้างขวัญกําลังใจ เช่น
          การขอพระราชทานเครื่องราชอิสริยาภรณ์,การแสดงความยินดีครูและบุคลากรทางการศึกษาที่ผ่านการเลื่อนวิทยฐานะที่สูงขึ้น,การเชิดชูเกียรติครูและบุคลากรดีเด่น
          เป็นต้น{" "}
        </p>
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Data2.navItems.map((item) => (
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
                </div>
              </LinkPreview>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
