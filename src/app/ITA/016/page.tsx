import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        –
        แสดงช่องทางการให้บริการข้อมูลหรือธุรกรรมภาครัฐที่สอดคล้องกับภารกิจของหน่วยงานที่ผ่านเครือข่ายอินเทอร์เน็ต
        โดยผู้ขอรับบริการ ไม่จำเป็นต้องเดินทางมายัง สถานศึกษา เช่น การร้องเรียน
        ร้องทุกข์,การประสานงานใช้สถานที่ ,ระบบ ศธ.02, ระบบ RMS เป็นต้น <br />–
        สามารถเข้าถึงหรือเชื่อมโยงไปยังช่องทางข้างต้นจากเว็บไซต์หลักของสถานศึกษา{" "}
        <br />
      </div>

      <p className="pt-4 text-xl">Link Wab Page</p>
      <div className="grid gap-4 py-4">
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://std2018.vec.go.th/web/Index.htm?mode=index">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              01. ระบบบริหารสถานศึกษา ศธ.02 ออนไลน์
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              02. ktltc.vercel.app
            </p>{" "}
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
