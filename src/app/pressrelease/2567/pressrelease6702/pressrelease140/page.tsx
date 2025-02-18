"use client"; // top to the file

import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export default function Pressrelease() {
  return (
    <>
      <div>
        <div className="text-center text-xl pb-6 px-2">
          {DataPressrelease.Item.map((item) => (
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

        <div className="link">
          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://drive.google.com/drive/folders/109VcUHY2qHagLaktmlIflTzDJZTG4XJo?fbclid=IwZXh0bgNhZW0CMTAAAR0icdZSoZKZspAO-TXFYMBGQt3caK5Jqe45hZZO1aIFxSvNRT_WxHLgjxY_aem_3KIoaUg0lZUB_x2xtiyKPg"
          >
            รูปภาพเพิ่มเติม 1
          </Link>

          <br />
          <Link
            className="text-lg text-sky-500"
            href="https://drive.google.com/drive/folders/1nGuJVZltgYvOFeLHMoKRAoJKxWC-Ktou?fbclid=IwZXh0bgNhZW0CMTAAAR3PPVHTgM38jQGGACbG0pHDupo564Ghi6oqefDAnIxnQXk3y0Julctqzyc_aem_pZk1Es1yZzdYpBQZRkCKBQ"
          >
            รูปภาพเพิ่มเติม 2
          </Link>
        </div>
        <div className="date">
          {DataDate.map((item) => (
            <div key={item.date}>
              <div className="text-xs text-slate-500">{item.date}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center justify-center ">
            {ImageItem.map((item) => (
              <div className="" key={item.img}>
                <div className=" scale-90  hover:scale-110 transition duration-500 rounded-full ">
                  <Image src={item.img} alt={""}></Image>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
