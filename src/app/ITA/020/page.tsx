import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <p>ทำเอกสารเพิ่มเติม ข้อมูลไม่ครบ</p>
            <div className='hover:text-blue-500 dark:hover:text-blue-400 color'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/bidding'>
                    <p>ข่าวประกวดราคา</p>
                </Link>
            </div>
        </>
    )
}
