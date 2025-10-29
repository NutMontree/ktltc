import Link from 'next/link'
import React from 'react'

export default function PDCA() {
    return (
        <>
            <div></div>
            <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                <div className="w-full px-4">
                    <div className="text-center">
                        <h1 className="flex justify-center text-xl ">เอกสาร DOCX </h1>
                        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                            (PDCA) DOCX
                        </h1>
                        <ul className="flex items-center justify-center gap-[10px]">
                            <li>
                                <Link
                                    href="/"
                                    className="text-dark flex items-center gap-[10px] text-base font-medium dark:text-white"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/plan"
                                    className="text-dark flex items-center gap-[10px] text-base font-medium dark:text-white"
                                >
                                    <span className="text-body-color dark:text-dark-6">
                                        /
                                    </span>
                                    plan
                                </Link>
                            </li>
                            <li>
                                <p className="text-body-color flex items-center gap-[10px] text-base font-medium">
                                    <span className="text-body-color dark:text-dark-6">
                                        /
                                    </span>
                                    pdca
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >
            <div className='py-4'>
                <div className='grid gap-4'>
                    <div>
                        <Link
                            href="/pdf/pdca/1.การจัดทำรูปเล่ม_PDCA_และ_11_ขั้นตอน.doc"
                            className="hover:text-sky-500"
                        >
                            1.การจัดทำรูปเล่ม PDCA และ 11 ขั้นตอน
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/2.แบบฟอร์มขออนุมัติโครงการ(เฉพาะงานวางแผน).docx"
                            className="hover:text-sky-500"
                        >
                            2.แบบฟอร์มขออนุมัติโครงการ(เฉพาะงานวางแผน)
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/3.แบบฟอร์มขออนุมัติโครงการ.docx"
                            className="hover:text-sky-500"
                        >
                            3.แบบฟอร์มขออนุมัติโครงการ
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/4.แบบฟอร์มขออนุญาตดำเนินโครงการ.docx"
                            className="hover:text-sky-500"
                        >
                            4.แบบฟอร์มขออนุญาตดำเนินโครงการ
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/5.ขออนุญาตปรับเพิ่มงบประมาณโครงการประจำปี.doc"
                            className="hover:text-sky-500"
                        >
                            5.ขออนุญาตปรับเพิ่มงบประมาณโครงการประจำปี
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/6.ขออนุญาตปรับโครงการเข้าแผนปฏิบัติการ.doc"
                            className="hover:text-sky-500"
                        >
                            6.ขออนุญาตปรับโครงการเข้าแผนปฏิบัติการ
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/7.แบบฟอร์มโครงการ.doc"
                            className="hover:text-sky-500"
                        >
                            7.แบบฟอร์มโครงการ
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/8.แบบฟอร์มบันทึกข้อความขออนุญาตรายงานผลดำ.docx"
                            className="hover:text-sky-500"
                        >
                            8.แบบฟอร์มบันทึกข้อความขออนุญาตรายงานผลดำ
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/pdf/pdca/9.แบบรายงานผลการดำเนินงานโครงการ_แบบย่อ.docx"
                            className="hover:text-sky-500"
                        >
                            9.แบบรายงานผลการดำเนินงานโครงการ_แบบย่อ
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
