import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Pressrelease2567() {
  return (
    <>
      <div className="gap-2 grid">
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
