import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/executiveboard'>
                    <p>ข้อมูลโครงสร้างวิทยาลัยฯ</p>
                </Link>
            </div>
        </>
    )
}
