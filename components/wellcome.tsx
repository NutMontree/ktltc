"use client"; // top to the file
import { Card, CardFooter, Image } from "@nextui-org/react";
import TabsPage from "./Tabs";

export default function Wellcome() {
  return (
    <>
      <div className="flex justify-center px-6 pt-6 pb-3">
        <div className="max-w-[1000px] gap-2 grid grid-cols-12 ">
          <Card isFooterBlurred className="h-[300px] col-span-12 sm:col-span-6">
            <div className="flex justify-center">
              <div className="w-fit mx-auto   grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center justify-center ">
                <div className=" scale-40 hover:scale-110 transition duration-500 rounded-full ">
                  <Image src="/images/3.webp" alt={""}></Image>
                </div>
              </div>
            </div>

            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="flex flex-grow gap-2 items-center">
                <Image
                  alt="Breathing app icon"
                  className="rounded-full w-12  h-12 bg-black"
                  src="/images/logo.webp"
                />
                <div className="flex flex-col">
                  <div className="text-md text-white">
                    นางสาวทักษิณา ชมจันทร์
                    <div className="text-md ">
                      ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card
            isFooterBlurred
            className="h-[300px] col-span-12 sm:col-span-6 "
          >
            <TabsPage />
          </Card>
        </div>
      </div>
    </>
  );
}
