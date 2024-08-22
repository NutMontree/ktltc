// "use client";
import Wellcome from "@/components/wellcome";
import DataWarehouse from "./main/page";
import Scrollimage from "@/components/Scrollimage";
import ShowPressRelease from "./showpressrelease/page";
import ShowNewsletter from "./shownewsletter/page";
import ShowAnnouncement from "./showannouncement/page";
import ShowBidding from "./showbidding/page";
import ShowTechnicalcollegeorders from "./showtechnicalcollegeorders/page";

export default function page() {
  return (
    <>
      <main>
        <Scrollimage />
        <Wellcome />
        <ShowPressRelease />
        <ShowNewsletter />
        <ShowAnnouncement />
        <ShowBidding />
        <ShowTechnicalcollegeorders />

        {/* <div>
          <DataWarehouse />
        </div> */}
      </main>
    </>
  );
}
