import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Pressrelease2566() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">2566</h1>
      </div>

      <div className="pt-6 gap-2 grid">
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/pressrelease6612">
              เดือน ธันวาคม 2566
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/pressrelease6611">
              เดือน พฤศจิกายน 2566
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
