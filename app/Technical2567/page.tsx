import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Technical2567() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/#">
              เดือน กรกฎาคม 2567(ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="#">
              เดือน มิถุนายน 2567 (ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/#">
              เดือน พฤษภาคม 2567 (ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/technical6704">
              เดือน เมษายน 2567
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="#">
              เดือน มีนาคม 2567 (ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="#">
              เดือน กุมภาพันธ์ 2567 (ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="#">
              เดือน มกราคม 2567 (ไม่มีข้อมูล)
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
