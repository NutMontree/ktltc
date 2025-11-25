"use client"; // top to the file

import React from "react";
import { Image } from "@heroui/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import TabsPage from "@/components/Tabs";
import { motion } from "framer-motion";
import { Card } from "@heroui/react";

export default function WelcomePage() {
  return (
    <>
      <>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <div className=" ">
            <div className="justify-items-center">
              <div className="grid max-w-[1000px] grid-cols-12 gap-2">
                <Card
                  isFooterBlurred
                  className="col-span-12 h-[380px] sm:col-span-6"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="group/card relative h-auto w-auto rounded-xl p-6 sm:w-[30rem]">
                      <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-neutral-600 dark:text-white"
                      >
                        นางสาวทักษิณา ชมจันทร์
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="60"
                        className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
                      >
                        ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                      </CardItem>
                      <CardItem
                        translateZ="100"
                        className="mt-4 flex w-full justify-center"
                      >
                        <Image
                          src="/images/ปก/3.webp"
                          // height="1000"
                          // width="1000"
                          className="h-64 w-full rounded-xl object-cover group-hover/card:shadow-xl"
                          alt="thumbnail"
                        />
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </Card>

                <Card
                  isFooterBlurred
                  className="col-span-12 h-[380px] sm:col-span-6"
                >
                  <TabsPage />
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </>
  );
}
