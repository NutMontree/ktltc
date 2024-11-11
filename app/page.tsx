// "use client";
import Wellcome from "@/components/wellcome";
import Scrollimage from "@/components/Scrollimage";
import ShowPressRelease from "./showpressrelease/page";
import ShowNewsletter from "./shownewsletter/page";
import ShowAnnouncement from "./showannouncement/page";
import ShowBidding from "./showbidding/page";
import ShowTechnicalcollegeorders from "./showtechnicalcollegeorders/page";
import ScrollVelocity from "@/components/Scrollvelocity";

import { BackgroundBeamsWithCollisionDemo } from "@/components/BackgroundBeamsWithCollisionDemo";
import { UserContextProvider } from "./providers";

export default function page() {
  return (
    <>
      <UserContextProvider>
        <main>
          <Scrollimage />
          <div className="py-[48px]">
            <Wellcome />
          </div>
          <div className="border-t py-[48px]">
            <ScrollVelocity />
          </div>
          <div className="border-t py-[48px]">
            <BackgroundBeamsWithCollisionDemo />
          </div>
          <div className="border-t py-[48px]">
            <ShowPressRelease />
          </div>
          <div className="border-t py-[48px]">
            <ShowNewsletter />
          </div>
          <div className="border-t py-[48px]">
            <ShowAnnouncement />
          </div>
          <div className="border-t py-[48px]">
            <ShowBidding />
          </div>
          <div className="border-t py-[48px]">
            <ShowTechnicalcollegeorders />
          </div>

          {/* <div>
          <DataWarehouse />
        </div> */}
        </main>
      </UserContextProvider>
    </>
  );
}
