"use client";

import { Card, CardHeader, CardFooter, Image, Button } from "@nextui-org/react";
import Link from "next/link";
import NextLink from "next/link";

export default function page() {
  return (
    <>
      <div className="pt-8">
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          คลังข้อมูล
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          วิทยาลัยเทคนิคกันทรลักษ์
        </h1>
      </div>

      <div className="flex justify-center px-8 py-8">
        <div className="max-w-[1000px] gap-2 grid grid-cols-12 grid-rows-2  ">
          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-7"
          >
            <NextLink href={"/pressrelease"}>
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <div className="text-tiny uppercase font-bold">
                  ข่าวประชาสัมพันธ์
                </div>
                <h4 className=" font-medium text-xl">Press Release</h4>
              </CardHeader>
              {/********************************************* Image *********************************************/}
              <Image
                removeWrapper
                alt="Relaxing app background"
                className="z-0 w-full h-full object-cover absolute "
                src="/images/ข่าวประชาสัมพันธ์/2567/สิงหาคม/7/02.webp"
              />
              {/********************************************* Image *********************************************/}

              <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                  <Image
                    alt="Breathing app icon"
                    className="rounded-full w-8  h-8 bg-black"
                    src="/images/logo.webp"
                  />
                  <div className="flex flex-col">
                    <div className="text-tiny ">
                      ข่าวประชาสัมพันธ์กิจกรรมต่าง
                      <div className="text-tiny ">
                        ทั้งในและนอกวิทยาลัยเทคนิคกันทรลักษ์
                      </div>
                    </div>
                  </div>
                </div>
                <Button radius="full" size="md">
                  <Link href="/pressrelease">ข้อมูลทั้งหมด</Link>
                </Button>
              </CardFooter>
            </NextLink>
          </Card>

          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-5"
          >
            <NextLink href={"/newsletter"}>
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <div className="text-tiny  uppercase font-bold">จดหมายข่าว</div>
                <h4 className="font-medium text-xl">Newsletter</h4>
              </CardHeader>
              {/********************************************* Image *********************************************/}
              <Image
                removeWrapper
                alt="Card example background"
                src="/images/จดหมายข่าว/2567/สิงหาคม/5/0.webp"
              />
              {/********************************************* Image *********************************************/}

              <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                  <div className="flex flex-col">
                    <div className="text-tiny ">
                      จดหมายข่าวต่าง
                      <div className="text-tiny ">
                        ทั้งในและนอกวิทยาลัยเทคนิคกันทรลักษ์
                      </div>
                    </div>
                  </div>
                </div>
                <Button radius="full" size="md">
                  <Link href="/newsletter">ข้อมูลทั้งหมด</Link>
                </Button>
              </CardFooter>
            </NextLink>
          </Card>

          <Card className="col-span-12 sm:col-span-4 h-[300px]">
            <NextLink href={"/announcement"}>
              <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                <div className="text-tiny  uppercase font-bold">ข่าวประกาศ</div>
                <h4 className=" font-medium text-large">Announcement New</h4>
              </CardHeader>
              {/********************************************* Image *********************************************/}
              <Image
                removeWrapper
                alt="Card background"
                className="z-0 w-full h-full object-cover absolute"
                src="/images/ข่าวประกาศ/2567/กรกฎาคม/4/1.webp"
              />
              {/********************************************* Image *********************************************/}
              <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                  <div className="flex flex-col">
                    <div className="text-tiny ">
                      ข่าวประกาศ
                      <div className="text-tiny ">
                        ในวิทยาลัยเทคนิคกันทรลักษ์
                      </div>
                    </div>
                  </div>
                </div>
                <Button radius="full" size="md">
                  <Link href="/announcement">เพิ่มเติม</Link>
                </Button>
              </CardFooter>
            </NextLink>
          </Card>

          <Card className="col-span-12 sm:col-span-4 h-[300px]">
            <NextLink href={"/bidding"}>
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <div className="text-tiny uppercase font-bold">
                  ข่าวประกวดราคา
                </div>
                <h4 className=" font-medium text-large">Bidding</h4>
              </CardHeader>
              {/********************************************* Image *********************************************/}
              <Image
                removeWrapper
                alt="Relaxing app background"
                className="z-0 w-full h-full object-cover absolute"
                src="/images/ข่าวประกวดราคา/na2.webp"
              />
              {/********************************************* Image *********************************************/}
              <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                  <div className="flex flex-col">
                    <div className="text-tiny ">
                      ข่าวประกวดราคา
                      <div className="text-tiny ">
                        ในวิทยาลัยเทคนิคกันทรลักษ์
                      </div>
                    </div>
                  </div>
                </div>
                <Button radius="full" size="md">
                  <Link href="/bidding">เพิ่มเติม</Link>
                </Button>
              </CardFooter>
            </NextLink>
          </Card>

          <Card className="col-span-12 sm:col-span-4 h-[300px]">
            <NextLink href={"/technicalcollegeorders"}>
              <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                <div className="text-tiny  uppercase font-bold">
                  คำสั่งวิทยาลัย
                </div>
                <h4 className=" font-medium text-large">
                  Technical college order
                </h4>
              </CardHeader>
              {/********************************************* Image *********************************************/}
              <Image
                removeWrapper
                alt="Card background"
                className="z-0 w-full h-full object-cover absolute"
                src="/images/คำสั่งวิทยาลัย/2567/สิงหาคม/1/1.webp"
              />
              {/********************************************* Image *********************************************/}
              <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                  <div className="flex flex-col">
                    <div className="text-tiny ">
                      คำสั่งวิทยาลัย
                      <div className="text-tiny ">
                        ในวิทยาลัยเทคนิคกันทรลักษ์
                      </div>
                    </div>
                  </div>
                </div>
                <Button radius="full" size="md">
                  <Link href="/technicalcollegeorders">เพิ่มเติม</Link>
                </Button>
              </CardFooter>
            </NextLink>
          </Card>
        </div>
      </div>
    </>
  );
}
