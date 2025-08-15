
import { LinkPreview } from '@/components/ui/link-preview'
import Link from 'next/link'
// import SubQAPage from './qa/SubQAPage'

export default function QAPage() {
    return (
        <>
            <p className='text-xl'>Link Wab Page</p>
            <div className='py-4'> <Link href='/ITA/08/qa'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. ระบบ Q&A วิทยาลัยเทคนิคกันทรลักษ์</p> </Link> </div>
            {/* <div>
                <div>
                    <iframe
                        src="https://padlet.com/embed/fpugfje0yejm0bqx"
                        allow="camera;microphone;geolocation;display-capture;clipboard-write"
                        className="w-full h-screen rounded-xl"
                    >
                    </iframe>
                    <div
                        className="display:flex;align-items:center;justify-content:end;margin:0;height:28px"
                    >
                        <a href="https://padlet.com?ref=embed"
                            className="display:block;flex-grow:0;margin:0;border:none;padding:0;text-decoration:none"
                            target="_blank">
                            <div
                                className="display:flex;align-items:center;"
                            >
                                <img src="https://padlet.net/embeds/made_with_padlet_2022.png"
                                    width="114"
                                    height="28"
                                    className="padding:0;margin:0;background:0 0;border:none;box-shadow:none"
                                    alt="Made with Padlet" />
                            </div>
                        </a>
                    </div>
                </div>
            </div> */}
        </>
    )
}
