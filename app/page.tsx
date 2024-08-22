// "use client";
import Wellcome from "@/components/wellcome";
import DataWarehouse from "./main/page";
import Scrollimage from "@/components/Scrollimage";
import ShowPressRelease from "./showpressrelease/page";

export default function page() {
  return (
    <>
      <main>
        <Scrollimage />
        <Wellcome />
        <ShowPressRelease />

        <div>
          <DataWarehouse />
        </div>
      </main>
    </>
  );
}
