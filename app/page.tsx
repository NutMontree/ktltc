// "use client";
import Wellcome from "@/components/wellcome";
import DataWarehouse from "./main/page";
import Scrollimage from "@/components/Scrollimage";

export default function page() {
  return (
    <>
      <div className="  px-6 py-6 ">
        <div>
          <Scrollimage />
          <Wellcome />
          <DataWarehouse />
        </div>
      </div>
    </>
  );
}
