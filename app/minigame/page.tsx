"use client"; // top to the file

import Link from "next/link";
import React from "react";

export default function MiniGame() {
  return (
    <>
      <div>
        <div>Mini Game</div>

        <Link href="/snakegame">SnakeGame</Link>
      </div>
    </>
  );
}
