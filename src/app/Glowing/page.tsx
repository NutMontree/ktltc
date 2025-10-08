"use client";
import React from 'react'
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Image } from "@nextui-org/react";

export default function GlowingPage() {
    return (
        <>
            <div className="py-24">
                <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12">
                    <GridItem
                        // md:[grid-area:3/1/4/13]
                        area="md:[grid-area:1/1/2/13] flex items-center justify-center"
                        // icon={<Box className="h-4 w-4 text-black dark:text-neutral-400" />}
                        // title="Do things the right way"
                        // description="Running out of copy so I'll write anything."
                        image={<>  <Image className="" isBlurred src={'/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/6/1.webp'} alt={""}></Image></>}
                    />

                    <GridItem
                        area="md:[grid-area:2/1/2/7] flex items-center justify-center"
                        // icon={<Settings className="h-4 w-4 text-black dark:text-neutral-400" />}
                        // title="The best AI code editor ever."
                        // description="Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me."
                        image={<>  <Image className="" isBlurred src={'/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/6/2.webp'} alt={""}></Image></>}

                    />

                    <GridItem
                        area="md:[grid-area:2/7/2/13] flex items-center justify-center"
                        // icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
                        // title="You should buy Aceternity UI Pro"
                        // description="It's the best money you'll ever spend"
                        image={<>  <Image className=" " isBlurred src={'/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/6/3.webp'} alt={""}></Image></>}
                    />

                    <GridItem
                        area="md:[grid-area:3/1/3/7] flex items-center justify-center"
                        // icon={<Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />}
                        // title="This card is also built by Cursor"
                        // description="I'm not even kidding. Ask my mom if you don't believe me."
                        image={<>  <Image className="" isBlurred src={'/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/6/4.webp'} alt={""}></Image></>}
                    />

                    <GridItem
                        area="md:[grid-area:3/7/3/13] flex items-center justify-center"
                        // icon={<Search className="h-4 w-4 text-black dark:text-neutral-400" />}
                        // title="Coming soon on Aceternity UI"
                        // description="I'm writing the code as I record this, no shit."
                        image={<>  <Image className="" isBlurred src={'/images/ข่าวประชาสัมพันธ์/2568/ตุลาคม/6/5.webp'} alt={""}></Image></>}
                    />
                </ul>
            </div>
        </>
    )
}


interface GridItemProps {
    area: string;
    // icon: React.ReactNode;
    // title: string;
    // description: React.ReactNode;
    image: React.ReactNode;
}

// const GridItem = ({ area, icon, title, description, image }: GridItemProps) => {
const GridItem = ({ area, image }: GridItemProps) => {
    return (
        <li className={`  ${area}`}>
            <div className="relative h-full rounded-2xl  p-2 md:rounded-3xl ">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className=" ">
                    <div className="">
                        <div>{image}</div>
                        {/* 
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div> */}
                    </div>
                </div>
            </div>
        </li>
    );
};
