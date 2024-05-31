/* eslint-disable react/no-unescaped-entities */
// PressRelease
import React from "react";
import { Card, CardHeader, CardFooter, Image, Button } from "@nextui-org/react";
import Link from "next/link";
import Pressrelease2566 from "./Pressrelease2566";

export default function PressReleasePage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          Press Release Page
        </h1>

        <Pressrelease2566 />
      </div>
    </>
  );
}
