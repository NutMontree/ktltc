import Link from 'next/link'
import React from 'react'

export default function Nav() {
    return (
        <div>
            <div className="dark:bg-dark relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                <div className="text-center">
                    <h1 className="flex justify-center text-xl ">ระบบ Q & A </h1>
                    <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                        Q & A และช่องทางรับฟังความคิดเห็นวิทยาลัยเทคนิคกันทรลักษ์
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
                                Q&A System
                            </p>
                        </li>
                    </ul>
                </div>
            </div></div>
    )
}
