import Link from "next/link";
import { Button } from "antd";

export default function Announcement2568() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6803"
            >
              เดือน มีนาคม 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6802"
            >
              เดือน กุมภาพันธ์ 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6801"
            >
              เดือน มกราคม 2568
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
