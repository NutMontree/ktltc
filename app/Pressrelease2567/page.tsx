import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Pressrelease2567() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xxl text-[#DAA520] ">2567</h1>
      </div>

      <div className="pt-6 gap-2 grid">
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/pressrelease6703">
              เดือน มีนาคม 2567
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/pressrelease6702">
              เดือน กุมภาพันธ์ 2567
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/pressrelease6701">
              เดือน มกราคม 2567
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
