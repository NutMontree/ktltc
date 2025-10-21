"use client"; // top to the file

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { Image } from "@nextui-org/react";

import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

import { DataInternships } from "./SubInternships/2568/data";
import Link from "next/link";

export default function Internships() {

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            >
                <div className="relative z-20 overflow-hidden">
                    <div className="">
                        {/*   title title title title title title title title title title title title title title title title title title */}
                        <div className="grid grid-flow-col py-4">
                            <div className="justify-items-start">
                                <div className="grid grid-flow-col">
                                    <div className="bg-red-500 w-2" />
                                    <div className="pl-4">
                                        <h1 className="text-xxl font-bold">นักศึกษาออกฝึกประสบการณ์</h1>
                                        <h1 className="text-xxl text-[#DAA520]">Students go on internship</h1>
                                    </div>
                                </div>
                            </div>
                        </div >
                        {/*   title title title title title title title title title title title title title title title title title title */}
                        <div className="grid grid-flow-col">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                                {DataInternships.navItems.slice(0, 4).map((item) => (
                                    <div key={item.name} className="hover:bg-orange-300 px-2 py-2 rounded-xl ">
                                        <Link key={item.href} href={item.href}>
                                            <div className="
                                    mb-4 relative shadow-lg rounded-xl 
                                    h-[180px] xl:h-[250px]
 
                                    overflow-hidden
                                    hover:bg-orange-500
                                    ">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-no-repeat bg-top hover:scale-110 duration-500"
                                                    style={{
                                                        backgroundImage: `url(${item.backgroundImage})`,
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-[14px] md:text-[20px] sm:text-sm md:text-base text-sky-600 hover:text-sky-400" >
                                                    {item.name}
                                                </h1>
                                                <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base mb-2 flex">
                                                    <div>
                                                        {item.description}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Image src='/images/icons8-calendar.gif' alt='logo-youtube' width={20} height={20} />
                                                    <div className="text-xs text-slate-500 text-[12px] md:text-[14px] sm:text-sm md:text-base">
                                                        {item.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="justify-items-center pt-6">
                            <div className=" ">
                                <ConfigProvider  >
                                    <Space>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<AntDesignOutlined />}
                                            href="/internships/SubInternships"
                                        >
                                            ข้อมูลทั้งหมด
                                        </Button>
                                    </Space>
                                </ConfigProvider>
                            </div>
                        </div>
                    </div >
                </div >
            </motion.div>
        </>
    );
}
