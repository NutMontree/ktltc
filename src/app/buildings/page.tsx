"use client"; // top to the file

export default function Buildings() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข้อมูลอาคารสถานที่</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Building information
        </h1>
      </div>
      {/* <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] pt-14">
          สรุปข้อมูลสถิตินักเรียนนักศึกษาจำแนกประเภทวิชา
        </h1>
      </div> */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 bg-zinc-100 rounded-tl-lg rounded-tr-lg border-slate-100 dark:bg-slate-800">
        <div className="py-2 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center border-slate-200 border-t-1 border-l-1 rounded-tl-lg">
          ว/ด/ป/
        </div>
        <div className="py-2 col-span-2 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center border-slate-200 border-t-1 border-l-1">
          เลขที่อาคาร
        </div>

        <div className="col-span-4 text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center  border-slate-200 border-t-1 border-l-1">
          <div className="py-2 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center border-slate-200  ">
            รายการ
          </div>
        </div>

        <div className="py-2 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center border-slate-200 border-t-1 border-l-1">
          จำนวน
        </div>
        <div className="py-2 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base font-medium text-center border-slate-200 border-t-1 border-l-1 border-r-1 rounded-tr-lg">
          ห้อง
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          7 เม.ษ 2542
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0003
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารโรงฝึกงาน 3 ชั้น 4000 ตรม.
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-baseborder-slate-100 border-slate-100 border-t-1 border-l-1 border-r-1">
          24
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          19 ก.ย 2545
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0011
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารสำนักงาน
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          12 ก.ย 2545
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0012
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          กั้นห้องอาคารโรงฝึกงาน
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          2
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          9 ก.ย 2546
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          44701/46
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          โรงอาหารอเนกประสงค์
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          11 ก.พ 2547
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0014
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ห้องประชุมทองกวาว
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          15 พ.ย 2547
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          กช.601/46
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารโรงฝึกงานแบบจั่วคู่
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          15 ม.ค 2547
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0017
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารฝึกอบรมอาชีพระยะสั้น
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          11 ม.ค. 2549
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0019
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารส่งเสริมธุรกิจอารแคร์
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1  pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          13 มี.ค 2549
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0020
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคาร OTOP
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          23 ก.ย 2550
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อค.7
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารเรียนและปฏิบัติการ 4 ชั่น
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          20
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          6 พ.ค 2551
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0022
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ปรับปรุงต่อเติมอาคารแผนกช่างยนต์
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อค.2
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารเรียนและปฏิบัติการ 1920 ตรม.
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          20
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อค.3
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารโรงฝึกงาน 480 ตรม.
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">2</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          39402
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารสำนักงานหอประชุมเล็ก 960
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          36002
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ห้องน้ำ ห้องส้วม 16 ตรม.
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">3</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          18
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          35402
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          บ้านพักผู้บริหาร
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          36404
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          บ้านพักครู 6 หน่วย
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">2</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          12
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          350001
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          บ้านพักนักการภาโรง
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">3</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          31 ธ.ค 2557
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          56201
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารโรงฝึกงานแบบจั่วคู่
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          29 พ.ค 2558
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0041
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ปรับปรุงห้องน้ำครู
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">2</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          7
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          29 พ.ค 2558
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          1000-001-0042
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ปรับปรุงห้องน้ำนักศึกษา
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">2</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          18
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          อาคารโรงฝึกงานพื้นที่ไม่ต่ำกว่า 4,000 ตรม
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          16
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          30 พ.ค 2560
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ปรับปรุงดรงจอดรถจักยานยนต์
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          6 พ.ค 2560
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          -
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          ปรับปรุงโรงอาหาร
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1">
          <div className="grid grid-cols-3">
            <div className="py-1 ">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="py-1 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-b-1 rounded-bl-lg">
          1 มี.ค 2561
        </div>
        <div className="py-1 col-span-2 pl-1 text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-b-1 ">
          -
        </div>
        <div className="py-1 col-span-4 text-[6px] md:text-[8px] pl-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-b-1 ">
          อาคารอเนกประสงค์ (โดม)
        </div>
        <div className="flex justify-center text-[6px] md:text-[8px] sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-b-1 ">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-slate-100 border-r-1"></div>
            </div>
            <div className="text-start py-1 ">หลัง</div>
          </div>
        </div>
        <div className="py-1 flex justify-center text-[6px] md:text-[8px] pr-1 sm:text-sm md:text-base lg:text-base border-slate-100 border-t-1 border-l-1 border-r-1 border-b-1 rounded-br-lg">
          ห้อง
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
    </>
  );
}
