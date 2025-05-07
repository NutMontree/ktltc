"use client"; // top to the file

import { DataDate, DataTechnicalCollege, Description } from "./data";
import { FootTitle } from "@/components/FootTitle";

export default function TechnicalCollege() {
  return (
    <>
      <div>
        <div className="text-center text-xl pb-8">
          {DataTechnicalCollege.Item.map((item) => (
            <div key={item.title}>{item.title}</div>
          ))}
        </div>
        <div className='px-2'>
          {Description.map((item) => (
            <div key={item.description}>
              <div>{item.description}</div>
            </div>
          ))}
        </div>

        <FootTitle />

        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <div>
          <div className="text-lg text-sky-500"></div>
          <iframe
            className="w-full aspect-video ... "
            src="/images/คำสั่งวิทยาลัย/2567/ธันวาคม/1/คำสั่งแต่งตั้งนายตรวจเวรยามฯประจำเดือน.pdf"
          ></iframe>
        </div>
      </div>
    </>
  );
}
