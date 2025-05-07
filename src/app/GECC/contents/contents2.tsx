import Link from "next/link";
import React from "react";

export default function Contents2() {
  return (
    <>
      <div className="pt-6">
        <p >แบบสํารวจความต้องการของผู้รับบริการที่มีต่อการให้บริการศูนย์ราชการสะดวก (Government Easy Contact Center : GECC) วิทยาลัยเทคนิคกันทรลักษ์</p>
        <div className="pt-2">
          <Link
            href='https://docs.google.com/forms/d/e/1FAIpQLSdEf2XmgVMrNhz7Fl6O_8e_4yp5SjWyGxhC-pM64vIMPfBw3w/viewform'
            target="_blank">
            <button className='bg-dark dark:bg-white border-dark dark:border-dark-2 border rounded-full inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white dark:text-dark hover:bg-body-color hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
              แบบสํารวจ  GECC
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

