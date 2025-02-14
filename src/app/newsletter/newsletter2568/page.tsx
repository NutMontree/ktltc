import Link from "next/link";
import { Button } from "@nextui-org/button";

export default function Newsletter2568() {
  return (
    <>
      <div>
        <div className="gap-2 grid">
          <div>
            <Button color="primary" variant="ghost">
              <Link
                className="text-lg"
                href="/newsletter/newsletter2568/newsletter6802"
              >
                เดือน กุมภาพันธ์ 2568
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary" variant="ghost">
              <Link
                className="text-lg"
                href="/newsletter/newsletter2568/newsletter6801"
              >
                เดือน มกราคม 2568
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
