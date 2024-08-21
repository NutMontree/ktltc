"use client"; // top to the file
import { Card, CardFooter, Image } from "@nextui-org/react";
import TabsPage from "./Tabs";

export default function Wellcome() {
  return (
    <>
      <div className="flex justify-center px-6 py-6">
        <div className="max-w-[1000px] gap-2 grid grid-cols-12 ">
          <Card isFooterBlurred className="h-[350px] col-span-12 sm:col-span-6">
            <Image
              removeWrapper
              alt="Relaxing app background"
              className="z-0 w-full h-full object-cover absolute "
              src="/images/3.webp"
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="flex flex-grow gap-2 items-center">
                <Image
                  alt="Breathing app icon"
                  className="rounded-full w-8  h-8 bg-black"
                  src="/images/logo.webp"
                />
                <div className="flex flex-col">
                  <div className="text-tiny ">
                    นางสาวทักษิณา ชมจันทร์
                    <div className="text-tiny ">
                      อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card isFooterBlurred className="h-[350px] col-span-12 sm:col-span-6">
            <TabsPage />
          </Card>
        </div>
      </div>
    </>
  );
}
