"use client"

import React from 'react'
import Link from 'next/link';

import type { QRCodeProps } from 'antd';
import { Input, QRCode, Space, Button, Segmented } from 'antd';

function doDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const downloadCanvasQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
        const url = canvas.toDataURL();
        doDownload(url, 'QRCode.png');
    }
};

const downloadSvgQRCode = () => {
    const svg = document.getElementById('myqrcode')?.querySelector<SVGElement>('svg');
    const svgData = new XMLSerializer().serializeToString(svg!);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    doDownload(url, 'QRCode.svg');
};

export default function CreateQRCode() {
    const [text, setText] = React.useState('กรอก URL ของท่าน');
    const [renderType, setRenderType] = React.useState<QRCodeProps['type']>('canvas');
    return (
        <>
            <div className="dark:bg-dark relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                <div className="text-center">
                    <h1 className="flex justify-center text-xl ">ระบบสร้าง QR Code</h1>
                    <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                        วิทยาลัยเทคนิคกันทรลักษ์
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
                                pressrelease
                            </p>
                        </li>
                    </ul>
                </div>
            </div>

            <div className='flex justify-center pt-24'>
                <Space id="myqrcode" direction="vertical">
                    <div className='flex justify-center pb-4'>
                        <Segmented options={['canvas', 'svg']} value={renderType} onChange={setRenderType} />
                    </div>
                    <div className='pt-4'>
                        <Space direction="vertical" align="center" >
                            <QRCode value={text || '-'} />
                            <Input
                                type={renderType}
                                placeholder="-"
                                maxLength={100}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <div className='pt-4'>
                                <Button

                                    type="primary"
                                    onClick={renderType === 'canvas' ? downloadCanvasQRCode : downloadSvgQRCode}
                                >
                                    Download
                                </Button>
                            </div>

                        </Space>
                    </div>

                </Space>
            </div>
        </>
    )
}
