"use client"; // top to the file

import Link from "next/link";
import React from "react";

export default function MiniGame() {
  return (
    <>
      <div className="py-24">
        <div className="pt-8 pb-8">
          <h1 className="flex justify-center text-xl text-[#DAA520] ">
            Mini Game
          </h1>
        </div>

        <div className="flex justify-center">
          <Link href="/snakegame" className="hover:text-sky-500">
            Snake Game
          </Link>
        </div>
      </div>
    </>
  );
}
