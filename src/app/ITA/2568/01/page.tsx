import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";

export default function page() {
  return (
    <>


      <p className="text-xl">Link Web Page</p>
      <div className="py-4">
        <LinkPreview url="https://ktltc.ac.th/administrativestructure">
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. ข้อมูลโครงสร้างวิทยาลัยฯ
          </p>
        </LinkPreview>
      </div>
    </>
  );
}
