"use client"
import React from 'react'
import { Image } from "@nextui-org/react";
import Link from "next/link";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function PaPage() {
    return (
        <>
            <main>
                <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                    <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                    <div className="w-full px-4">
                        <div className="text-center">
                            <h1 className="flex justify-center text-xl ">การประเมินผลการพัฒนางานตามข้อตกลง (PA)</h1>
                            <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                                Performance Agreement: PA
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
                                    <p className="text-body-color flex items-center gap-[10px] text-base font-medium">
                                        <span className="text-body-color dark:text-dark-6">
                                            /
                                        </span>
                                        Performance Agreement
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div >
                <div className='pt-24'>
                    <Accordion isCompact>

                        <AccordionItem key="1" aria-label="1" title="2569">
                            <div className='py-12'>
                                <h1 className="text-xxl font-bold flex justify-center">การประเมินผลการพัฒนางานตามข้อตกลง (PA)</h1>
                                <h1 className="text-xxl text-[#DAA520] flex justify-center">2569</h1>
                                <div>Null</div>
                            </div>
                        </AccordionItem>
                        <AccordionItem key="2" aria-label="2" title="2568">
                            <div className='py-12'>
                                <h1 className="text-xxl font-bold flex justify-center">การประเมินผลการพัฒนางานตามข้อตกลง (PA)</h1>
                                <h1 className="text-xxl text-[#DAA520] flex justify-center">2568</h1>
                                <div className="flex justify-center pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">

                                        {/* ******************************** Photos ******************************** */}
                                        <div className=''>นางนงลักษร์ ศรีชา<Image src={'/pdf/งานบุคลากร/นางนงลักษรื.webp'} className='py-4 rounded-[22px]' /></div>
                                        <div className=''>นางวีนัส สุวรรณ<Image src={'/pdf/งานบุคลากร/นางวีนัส.webp'} className='py-4 WW' /></div>
                                        {/* ******************************** Photos ******************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/รานงานผลการปฏิบัติงาน(ข้าราชการครู).pdf" className="hover:text-sky-500" target="_blank">รานงานผลการปฏิบัติงาน(ข้าราชการครู)</Link>

                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/รานงานผลการปฏิบัติงาน(ข้าราชการครู).pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/รายงานผลการปฏิบัติงาน(พนักงานราชการครู).pdf" className="hover:text-sky-500" target="_blank">รายงานผลการปฏิบัติงาน(พนักงานราชการครู)</Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/รายงานผลการปฏิบัติงาน(พนักงานราชการครู).pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/นายจักรกฤษณ์.pdf" className="hover:text-sky-500" target="_blank">นายจักรกฤษณ์ พันธ์ศรี </Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/นายจักรกฤษณ์.pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/นายทรงพร.pdf" className="hover:text-sky-500" target="_blank">นายทรงพร พรมโสภา</Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/นายทรงพร.pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/นายสิริปัญญ์.pdf" className="hover:text-sky-500" target="_blank">นายสิริปัญญ์ เสริมสิริพิพัฒน์</Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/นายสิริปัญญ์.pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/นางสาวณัญสินี.pdf" className="hover:text-sky-500" target="_blank">นางสาวณัญสินี ชวดพงษ์</Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/นางสาวณัญสินี.pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                        {/* ***************************** Link And PDF ***************************** */}
                                        <div className="pt-4">
                                            <p className="text-sky-800 text-lg">PDF</p>
                                            <Link href="/pdf/งานบุคลากร/นางสาวล้ำค่า.pdf" className="hover:text-sky-500" target="_blank">นางสาวล้ำค่า จินาวัลย์</Link>
                                            <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/งานบุคลากร/นางสาวล้ำค่า.pdf" ></iframe>
                                        </div>
                                        {/* ***************************** Link And PDF ***************************** */}
                                    </div>
                                </div>
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
            </main>
        </>
    )
}
