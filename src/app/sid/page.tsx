"use client"; // top to the file

export default function Sid() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl">ข้อมูลนักเรียน นักศึกษา</h1>
        <h1 className="flex justify-center pb-8 text-xl text-[#DAA520]">
          Student information
        </h1>
      </div>

      <div className="rounded-lg pt-6">
        <div className="grid grid-cols-6 rounded-tl-lg rounded-tr-lg border-slate-100 bg-zinc-100 dark:bg-slate-800">
          <div className="rounded-tl-lg border-t border-l border-slate-200 pr-1 pl-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            ระดับการศึกษา
          </div>
          <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            ชาย
          </div>
          <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            หญิง
          </div>
          <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            จบ
          </div>
          <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            พ้นสภาพ
          </div>
          <div className="rounded-tr-lg border-t border-r border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
            รวม
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="border-t border-l border-slate-100 pr-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            ระดับ ปวช
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            998
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            650
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            1,648
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="border-t border-l border-slate-100 pr-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            ระดับ ปวส
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            496
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            358
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            854
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="border-t border-l border-slate-100 pr-1 pl-1 text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            ระดับ ทล.บ
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            4
          </div>
          <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
          <div className="border-t border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
            0
          </div>
        </div>
        <div className="grid grid-cols-6 rounded-br-lg rounded-bl-lg border-slate-200 dark:hover:bg-slate-800">
          <div className="rounded-bl-lg border-t border-b border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            รวมทั้งหมด
          </div>
          <div className="border-t border-b border-l border-slate-100 pr-1 text-end text-[6px] text-sky-600 sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            1,494
          </div>
          <div className="border-t border-b border-l border-slate-100 pr-1 text-end text-[6px] text-sky-600 sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            1,008
          </div>
          <div className="border-t border-b border-l border-slate-100 pr-1 text-end text-[6px] text-sky-600 sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            0
          </div>
          <div className="border-t border-b border-l border-slate-100 pr-1 text-end text-[6px] text-sky-600 sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            0
          </div>
          <div className="rounded-br-lg border-t border-r border-b border-l border-slate-100 pr-1 text-end text-[6px] text-sky-600 sm:text-sm md:text-base md:text-[8px] lg:text-base dark:hover:text-white">
            2,502
          </div>
        </div>
      </div>

      <div>
        <h1 className="flex justify-center pt-14 text-xl text-[#DAA520]">
          สรุปข้อมูลสถิตินักเรียนนักศึกษาจำแนกประเภทวิชา
        </h1>
      </div>

      <div className="py-14">
        <div>
          {/* /////////////////////////////เริ่มต้น/////////////////////////// */}
          {/* ////////////////////////////บันทัด ที่ 1//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 rounded-tl-lg rounded-tr-lg border-slate-100 bg-zinc-100 dark:bg-slate-800">
            <div className="rounded-tl-lg border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
              แผนกวิชา
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-6">
                <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ปวช 1
                </div>
                <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ปวช 2
                </div>
                <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ปวช 3
                </div>
                <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ปวส 1
                </div>
                <div className="border-t border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ปวส 2
                </div>
                <div className="rounded-tr-lg border-t border-r border-l border-slate-200 pr-1 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  รวมทั้งหมด
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////บันทัด ที่ 2//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 border-l border-slate-100 bg-zinc-100 dark:bg-slate-800">
            <div className="">
              <div className=""></div>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-12">
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
                <div className="border-t border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  ชาย
                </div>
                <div className="border-t border-r border-l border-slate-200 text-center text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  หญิง
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////บันทัด ที่ 3//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 border-b border-l border-slate-200 pl-1 hover:bg-zinc-50 dark:hover:bg-slate-800">
            <div className="pr-1 text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
              1. อุตสาหกรรม
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-12">
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  299
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  58
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  246
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  47
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  326
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  59
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  252
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  38
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  188
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  35
                </div>
                <div className="border-t border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  1,311
                </div>
                <div className="border-t border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  237
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////บันทัด ที่ 4//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 border-b border-l border-slate-200 pl-1 hover:bg-zinc-50 dark:hover:bg-slate-800">
            <div className="pr-1 text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
              2. พาณิชยกรรม/บริหารธุรกิจ
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-12">
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  10
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  96
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  29
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  152
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  50
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  125
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  6
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  100
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  22
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  115
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  117
                </div>
                <div className="border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  588
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////บันทัด ที่ 4//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 border-b border-l border-slate-200 pl-1 hover:bg-zinc-50 dark:hover:bg-slate-800">
            <div className="pr-1 text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
              3. อุตสาหกรรมท่องเที่ยว
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-12">
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  7
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  16
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  4
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  14
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  6
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  11
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  3
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  9
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  2
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  12
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  22
                </div>
                <div className="border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  62
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////บันทัด ที่ 4//////////////////////////// */}
          <div className="grid grid-cols-3 gap-4 border-b border-l border-slate-200 pl-1 hover:bg-zinc-50 dark:hover:bg-slate-800">
            <div className="pr-1 text-[6px] font-medium sm:text-sm md:text-base md:text-[8px] lg:text-base">
              4. เทคโนโลยีสานสนเทศ
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-12">
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  21
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  72
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  23
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  49
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  0
                </div>
                <div className="border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  44
                </div>
                <div className="border-r border-l border-slate-100 pr-1 text-end text-[6px] sm:text-sm md:text-base md:text-[8px] lg:text-base">
                  121
                </div>
              </div>
            </div>
          </div>
          {/* ////////////////////////////สิ้นสุด//////////////////////////// */}
        </div>
      </div>
    </>
  );
}
