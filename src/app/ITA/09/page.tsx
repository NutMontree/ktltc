import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://www.facebook.com/profile.php?id=100057326985699'>
                    <p>Facebook เพจ วิทยาลัยเทคนิคกันทรลักษ์</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh'>
                    <p>Facebook งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์ </p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://www.youtube.com/channel/UCHuaK-licd7-XrT4qQhHr3Q'>
                    <p>Youtube วิทยาลัยเทคนิคกันทรลักษ์ Today</p>
                </Link>
            </div>
            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://www.youtube.com/channel/UCDBgY-OPUZvAYkWArn5KUsw'>
                    <p>Youtube Datacenter Department</p>
                </Link>
            </div>

        </>
    )
}
