// "use client";
import Wellcome from "@/components/wellcome";
import DataWarehouse from "./main/page";
import Scrollimage from "@/components/Scrollimage";

export default function page() {
  return (
    <>
      <main>
        <Scrollimage />
        <Wellcome />
        <DataWarehouse />
      </main>
    </>
  );
}
