"use client"
import { LinkPreview } from "@/components/ui/link-preview";
import React from 'react'
import { Accordion, AccordionItem } from "@heroui/react";

export default function SarPage() {
    return (
        <>
            <div className=' '>
                <Accordion variant="splitted">
                    <AccordionItem key="1" aria-label="SAR 2563" title="SAR 2563">
                        <div className="pt-4">
                            <LinkPreview url="/pdf/sar/SAR2563.pdf" className="hover:text-sky-500"  > ดาวน์โหลดเอกสาร PDF </LinkPreview> <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/sar/SAR2563.pdf" ></iframe>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="SAR 2564" title="SAR 2564">
                        <div className="pt-4">
                            <LinkPreview url="/pdf/sar/SAR2564.pdf" className="hover:text-sky-500"  > ดาวน์โหลดเอกสาร PDF </LinkPreview> <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/sar/SAR2564.pdf" ></iframe>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="3" aria-label="SAR 2565" title="SAR 2565">
                        <div className="pt-4">
                            <LinkPreview url="/pdf/sar/SAR2565.pdf" className="hover:text-sky-500"  > ดาวน์โหลดเอกสาร PDF </LinkPreview> <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/sar/SAR2565.pdf" ></iframe>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="4" aria-label="SAR 2566" title="SAR 2566">
                        <div className="pt-4">
                            <LinkPreview url="/pdf/sar/SAR2566.pdf" className="hover:text-sky-500" >ดาวน์โหลดเอกสาร PDF </LinkPreview> <iframe className="w-full h-screen aspect-video pt-4" src="/pdf/sar/SAR2566.pdf"></iframe>
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}
