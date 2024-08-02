import Link from "next/link";
import { Button } from "@nextui-org/button";

export default function Newsletter() {
  return (
    <>
      <div>
        <div className="gap-2 grid">
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6708">
                เดือน สิงหาคม 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6707">
                เดือน กรกฎาคม 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6706">
                เดือน มิถุนายน 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6705">
                เดือน พฤษภาคม 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6704">
                เดือน เมษายน 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6703">
                เดือน มีนาคม 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6702">
                เดือน กุมภาพันธ์ 2567
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link className="text-lg" href="/newsletter6701">
                เดือน มกราคม 2567
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
