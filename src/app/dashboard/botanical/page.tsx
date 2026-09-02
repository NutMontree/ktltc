"use client";

import { SylvaHero } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export default function BotanicalGardenPage() {
  return (
    <div className="w-full h-full min-h-screen relative bg-black">
      <div className="absolute inset-0 shader-frame">
        <SylvaHero
          variant="living-green"
          className="w-full h-full"
          headingFont="lexend"
          bodyFont="lexend"
          headingWeight="300"
          bodyWeight="300"
          primaryColor="#ffffff"
          headingSize={63}
          bodySize={16.5}
          headingLetterSpacing={-0.006}
        />
      </div>
      
      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8">
        <h1 className="text-white text-4xl font-bold mb-4 drop-shadow-md font-[lexend]">สวนพฤกษศาสตร์ (Botanical Garden)</h1>
        <p className="text-white/80 max-w-md drop-shadow font-[lexend]">
          ระบบการเรียนรู้แบบ 3 มิติ สำรวจพื้นที่เพาะปลูกและระบบนิเวศน์
        </p>
      </div>
    </div>
  );
}
