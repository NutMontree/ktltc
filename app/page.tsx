// "use client";
import Wellcome from "@/components/wellcome";
import DataWarehouse from "./main/page";
import Scrollimage from "@/components/Scrollimage";
import ShowPressRelease from "./showpressrelease/page";
import ShowNewsletter from "./shownewsletter/page";
import ShowAnnouncement from "./showannouncement/page";
import ShowBidding from "./showbidding/page";
import ShowTechnicalcollegeorders from "./showtechnicalcollegeorders/page";
import ScrollVelocity from "@/components/Scrollvelocity";

import Link from "next/link";
import { BackgroundBeamsWithCollisionDemo } from "@/components/BackgroundBeamsWithCollisionDemo";
import { HeroScrollDemo } from "@/components/HeroScrollDemo";


export default function page() {
  return (
    <>
      <main>
        {/* <Link href="/test">TestPage</Link> */}
        <Scrollimage />
        <div className="py-6">
          <Wellcome />
        </div>
        <div className="border-t py-6">
          <ScrollVelocity />
        </div>
        <div className="border-t">
          <BackgroundBeamsWithCollisionDemo />
        </div>
        <div className="border-t">
          <HeroScrollDemo />
        </div>
        <div className="border-t py-6">
          <ShowPressRelease />
        </div>
        <div className="border-t py-6">
          <ShowNewsletter />
        </div>
        <div className="border-t py-6">
          <ShowAnnouncement />
        </div>
        <div className="border-t py-6">
          <ShowBidding />
        </div>
        <div className="border-t py-6">
          <ShowTechnicalcollegeorders />
        </div>

        {/* <div>
          <DataWarehouse />
        </div> */}
      </main>
    </>
  );
}
