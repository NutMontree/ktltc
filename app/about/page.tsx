"use client";
import { title } from "@/components/primitives";
import Test from "@/components/test";

export default function AboutPage() {
  return (
    <div>
      <h1 className={title()}>About Page</h1>

      <Test />
    </div>
  );
}
