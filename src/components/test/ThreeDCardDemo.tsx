"use client";

import { Image } from "@heroui/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import Link from "next/link";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative h-auto w-auto rounded-xl border border-black/10 bg-gray-50 p-6 dark:border-white/20 dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/10 sm:w-120">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          Make things float in air
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
        >
          Hover over this card to unleash the power of CSS perspective
        </CardItem>
        <CardItem translateZ="100" className="mt-4 w-full">
          <Image
            src="/images/ข่าวประชาสัมพันธ์/2567/สิงหาคม/14/05.webp"
            height="1000"
            width="1000"
            className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="mt-20 flex items-center justify-between">
          <CardItem
            translateZ={20}
            as={Link}
            href="https://twitter.com/mannupaaji"
            target="__blank"
            className="rounded-xl px-4 py-2 text-xs font-normal dark:text-white"
          >
            Try now →
          </CardItem>
          <CardItem
            translateZ={20}
            as="button"
            className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
          >
            Sign up
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
