import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Announcement2568() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary" variant="ghost">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6802"
            >
              เดือน กุมภาพันธ์ 2567
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6801"
            >
              เดือน มกราคม 2567
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
