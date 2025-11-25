"use client"; // top to the file

export default function Buildings() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">ข้อมูลอาคารสถานที่</h1>
        <h1 className="flex justify-center pb-8 text-xl text-[#DAA520]">
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
      <div className="grid grid-cols-9 rounded-tl-lg rounded-tr-lg border-slate-100 bg-zinc-100 dark:bg-slate-800">
        <div className="flex justify-center rounded-tl-lg border-t border-l border-slate-200 py-2 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ว/ด/ป/
        </div>
        <div className="col-span-2 flex justify-center border-t border-l border-slate-200 py-2 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
          เลขที่อาคาร
        </div>

        <div className="col-span-4 border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="flex justify-center border-slate-200 py-2 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            รายการ
          </div>
        </div>

        <div className="flex justify-center border-t border-l border-slate-200 py-2 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
          จำนวน
        </div>
        <div className="flex justify-center rounded-tr-lg border-t border-r border-l border-slate-200 py-2 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ห้อง
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          7 เม.ษ 2542
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0003
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารโรงฝึกงาน 3 ชั้น 4000 ตรม.
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="lg:text-baseborder-slate-100 flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px]">
          24
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          19 ก.ย 2545
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0011
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารสำนักงาน
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          12 ก.ย 2545
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0012
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          กั้นห้องอาคารโรงฝึกงาน
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          2
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          9 ก.ย 2546
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          44701/46
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          โรงอาหารอเนกประสงค์
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          11 ก.พ 2547
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0014
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ห้องประชุมทองกวาว
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          15 พ.ย 2547
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          กช.601/46
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารโรงฝึกงานแบบจั่วคู่
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          15 ม.ค 2547
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0017
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารฝึกอบรมอาชีพระยะสั้น
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          11 ม.ค. 2549
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0019
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารส่งเสริมธุรกิจอารแคร์
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          13 มี.ค 2549
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0020
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคาร OTOP
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          23 ก.ย 2550
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อค.7
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารเรียนและปฏิบัติการ 4 ชั่น
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          20
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          6 พ.ค 2551
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0022
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ปรับปรุงต่อเติมอาคารแผนกช่างยนต์
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อค.2
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารเรียนและปฏิบัติการ 1920 ตรม.
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          20
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อค.3
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารโรงฝึกงาน 480 ตรม.
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">2</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          39402
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารสำนักงานหอประชุมเล็ก 960
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          36002
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ห้องน้ำ ห้องส้วม 16 ตรม.
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">3</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          18
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          35402
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          บ้านพักผู้บริหาร
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          36404
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          บ้านพักครู 6 หน่วย
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">2</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          12
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          350001
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          บ้านพักนักการภาโรง
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">3</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          6
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          31 ธ.ค 2557
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          56201
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารโรงฝึกงานแบบจั่วคู่
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          29 พ.ค 2558
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0041
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ปรับปรุงห้องน้ำครู
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">2</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          7
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          29 พ.ค 2558
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1000-001-0042
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ปรับปรุงห้องน้ำนักศึกษา
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">2</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          18
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารโรงฝึกงานพื้นที่ไม่ต่ำกว่า 4,000 ตรม
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          16
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          30 พ.ค 2560
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ปรับปรุงดรงจอดรถจักยานยนต์
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          6 พ.ค 2560
        </div>
        <div className="col-span-2 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-4 border-t border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ปรับปรุงโรงอาหาร
        </div>
        <div className="flex justify-center border-t border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center border-t border-r border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          4
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <div className="grid grid-cols-9 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
        <div className="rounded-bl-lg border-t border-b border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          1 มี.ค 2561
        </div>
        <div className="col-span-2 border-t border-b border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          -
        </div>
        <div className="col-span-4 border-t border-b border-l border-slate-100 py-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          อาคารอเนกประสงค์ (โดม)
        </div>
        <div className="flex justify-center border-t border-b border-l border-slate-100 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          <div className="grid grid-cols-3">
            <div className="py-1">1</div>
            <div className="grid grid-cols-3">
              <div className="border-r border-slate-100"></div>
            </div>
            <div className="py-1 text-start">หลัง</div>
          </div>
        </div>
        <div className="flex justify-center rounded-br-lg border-t border-r border-b border-l border-slate-100 py-1 pr-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
          ห้อง
        </div>
      </div>
      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
    </>
  );
}
