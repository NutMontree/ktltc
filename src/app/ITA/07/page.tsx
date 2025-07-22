import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/pressrelease'>
                    <p>ข่าวประชาสัมพันธ์</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/newsletter'>
                    <p>จดหมายข่าว</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/announcement'>
                    <p>ข่าวประกาศ</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/bidding'>
                    <p>ข่าวประกวดราคา</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/technicalcollegeorders'>
                    <p>คำสั่งวิทยาลัยเทคนิค</p>
                </Link>
            </div>
        </>
    )
}
