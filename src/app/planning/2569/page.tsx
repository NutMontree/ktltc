import Link from "next/link";

export default function Plan2569() {
  // 1. แยกข้อมูลไฟล์ออกมาเป็น Array เพื่อให้จัดการง่าย
  const documents = [
    {
      name: "โครงการฝ่ายบริหารทรัพยากร",
      href: "/pdf/งานวางแผน/โครงการฝ่ายบริหารทรัพยากร.pdf",
    },
    {
      name: "โครงการฝ่ายแผนงานและความร่วมมือ",
      href: "/pdf/งานวางแผน/โครงการฝ่ายแผนงานและความร่วมมือ.pdf",
    },
    {
      name: "โครงการฝ่ายพัฒนากิจการนักเรียนนักศึกษา",
      href: "/pdf/งานวางแผน/โครงการฝ่ายพัฒนากิจการนักเรียนนักศึกษา.pdf",
    },
    {
      name: "โครงการฝ่ายวิชาการ",
      href: "/pdf/งานวางแผน/โครงการฝ่ายวิชาการ2569.pdf",
    },
  ];

  return (
    <>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl md:p-8">
        {/* ส่วนหัว Header */}
        <div className="mb-4 flex items-center border-b border-sky-100 pb-3">
          <svg
            className="mr-3 h-8 w-8 animate-bounce text-sky-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          <p className="text-xl font-bold text-sky-800">
            <span className="rounded-md bg-sky-100 px-2 py-1">
              ดาวน์โหลดเอกสาร PDF
            </span>
          </p>
        </div>

        {/* ส่วนรายการไฟล์ (List) ใช้ space-y-4 ที่ Container แม่เพื่อให้ระยะห่างเท่ากัน */}
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-lg bg-sky-50 p-4 transition duration-200 hover:bg-sky-100 md:flex-row md:items-center"
            >
              <div className="mb-3 min-w-0 flex-1 md:mb-0">
                <p className="truncate text-base text-gray-500">ชื่อไฟล์:</p>
                <p className="text-lg font-semibold text-sky-700">{doc.name}</p>
              </div>
              <Link
                href={doc.href}
                className="inline-flex transform items-center justify-center rounded-full border border-transparent bg-sky-500 px-5 py-2 text-base font-medium text-white shadow-lg transition duration-150 hover:scale-105 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 focus:outline-none"
                target="_blank"
                download
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  ></path>
                </svg>
                ดาวน์โหลด PDF
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
