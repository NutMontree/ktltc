"use client"; // top to the file

import Link from "next/link";
import { DataDate, DataTechnicalCollege, Description } from "./data";

export default function TechnicalCollege() {
  return (
    <>
      <div>
        <div className="text-center text-xl pb-8">
          {DataTechnicalCollege.Item.map((item) => (
            <div key={item.title}>{item.title}</div>
          ))}
        </div>
        <div>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </div>
        {/* ***************************** Foot Title ***************************** */}
        <div className="text-xs pt-6">
          <h1 className="text-base">KTL-TC ONE TEAM </h1>
          <p className="text-sky-500">#เรียนดีมีความสุข #เทคนิคกันท์ </p>
          <p className="border-t pt-[12px] ">
            " วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "
          </p>
          <p>
            ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
            เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
            มีความร่วมมือกับสถานประกอบการและชุมชน
          </p>
          <br />
          <p className="border-t pt-[12px]">
            "ค่านิยม วิทยาลัยเทคนิคกันทรลักษ์ "
          </p>
          <p className="">
            "ยิ้ม ไหว้ เเต่งกายดี รู้จักสวัสดี ขอบคุณ เเละขอโทษ
          </p>
          <br />
          <p className="border-t pt-[12px]">👉 ช่องทางการติดต่อ</p>
          <p>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</p>
          <p>
            เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ เเละ
            วิทยาลัยเทคนิคกันทรลักษ์ Today
          </p>
          <p>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </p>
          <p>Website : www.ktltc.ac.th</p>
          <p>Gmail : ktl11022021@gmail.com</p>
          <p>สอบถามข้อมูลเพิ่มเติม</p>
          <p>โทร : ๐๖๑ - ๔๑๒๒๗๖๕ หรือ ๐๔๕ - ๘๑๑๗๕๓ </p>
          <p>โทร : 061-4122765 หรือ 045-811753</p>
        </div>
        {/* ***************************** Foot Title ***************************** */}

        <div className="link">
          <br />
          <div className="flex justify-center">
            <a
              className="text-lg text-sky-500  "
              href="\images\คำสั่งวิทยาลัย\2567\ตุลาคม\2\1.pdf"
              download="คำสั่งแต่งตั้งมอบหมายหน้าที่ครูและบุคลากรทางการศึกษา เดือน ตุลาคม 2567.pdf"
            >
              Download Link
            </a>
          </div>
        </div>
        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
        {/* <div className="iframe">
          <iframe
            className="w-full aspect-video ..."
            src="/images/ข่าวประชาสัมพันธ์/2567/มีนาคม/141/1.mp4"
          ></iframe>
        </div> */}
      </div>

      <div className="pt-8">
        <div>
          <div className="text-lg text-sky-500"></div>
          <iframe
            className="w-full aspect-video ... "
            src="/images/คำสั่งวิทยาลัย/2567/ตุลาคม/2/1.pdf"
          ></iframe>
        </div>
      </div>
    </>
  );
}
