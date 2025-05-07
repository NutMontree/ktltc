"use client"; // top to the file

import React from "react";
import { Image } from "@nextui-org/react";
import { Card } from "@nextui-org/react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import TabsPage from "@/components/Tabs";

export default function Wellcome() {
  return (
    <>
      <div className=" ">
        <div className="justify-items-center">
          <div className="max-w-[1000px] gap-2 grid grid-cols-12 ">
            <Card isFooterBlurred className="h-[380px] col-span-12 sm:col-span-6">
              <CardContainer className="inter-var">
                <CardBody className="relative group/card w-auto sm:w-[30rem] h-auto rounded-xl p-6    ">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                  >
                    นางสาวทักษิณา ชมจันทร์
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                  >
                    ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                  </CardItem>
                  <CardItem
                    translateZ="100"
                    className="w-full mt-4 flex justify-center"
                  >
                    <Image
                      src="/images/3.webp"
                      // height="1000"
                      // width="1000"
                      className="h-64 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </Card>

            <Card
              isFooterBlurred
              className="h-[380px] col-span-12 sm:col-span-6 "
            >
              <TabsPage />
            </Card>
          </div>
        </div>
      </div>

    </>
  );
}
