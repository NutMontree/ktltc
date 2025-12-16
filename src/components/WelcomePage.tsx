"use client";

import React from "react";
import { Image } from "@heroui/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import TabsPage from "@/components/Tabs";
import { motion } from "framer-motion";
import { Card } from "@heroui/react";

export default function WelcomePage() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-50/50 py-16 font-sans dark:bg-neutral-950">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 -mt-20 -ml-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl filter dark:bg-blue-900/20" />
      <div className="absolute right-0 bottom-0 -mr-20 -mb-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl filter dark:bg-indigo-900/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-center">
          {/* --- Left Column: Director 3D Card --- */}
          <div className="flex w-full items-center justify-center lg:w-1/2 xl:w-5/12">
            <CardContainer className="inter-var w-full max-w-md">
              <CardBody className="group/card dark:border-white/0.2 dark:hover:shadow-emerald-500/0.1 relative h-auto w-auto rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:bg-black dark:hover:shadow-2xl">
                {/* Header Text */}
                <CardItem
                  translateZ="50"
                  className="text-2xl font-bold text-neutral-700 dark:text-white"
                >
                  นางสาวทักษิณา ชมจันทร์
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-300"
                >
                  ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                </CardItem>

                {/* Image */}
                <CardItem translateZ="100" className="mt-6 w-full">
                  <div className="overflow-hidden rounded-xl bg-slate-100 shadow-lg dark:bg-neutral-900">
                    <Image
                      src="/images/ปก/3.webp"
                      className="h-[350px] w-full object-cover object-top transition-transform duration-500 group-hover/card:scale-105"
                      alt="Director Image"
                      removeWrapper
                    />
                  </div>
                </CardItem>

                {/* Decorative Element */}
                <div className="mt-6 flex items-center justify-between">
                  <CardItem
                    translateZ={20}
                    className="rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-600 dark:bg-white dark:text-black"
                  >
                    KTLTC Director
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>

          {/* --- Right Column: Tabs & Info (Clean Style) --- */}
          <div className="flex w-full items-center justify-center lg:w-1/2 xl:w-6/12">
            <Card className="h-full min-h-[400px] w-full overflow-visible rounded-3xl border border-slate-100 bg-white/60 p-6 shadow-lg backdrop-blur-md sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="mb-6 border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  สารประชาสัมพันธ์
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ข้อมูลข่าวสารและประกาศล่าสุด
                </p>
              </div>

              {/* Tabs Component Content */}
              <div className="flex-1">
                <TabsPage />
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
