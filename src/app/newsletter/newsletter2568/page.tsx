import Link from "next/link";
import { Button } from "antd";
import NewsletterPage from "../page";

export default function Newsletter2568() {
  return (
    <>
      <NewsletterPage />
      <div>
        <div className="grid gap-4 pt-20 pb-4">
          <div>
            <Button color="primary">
              <Link
                className="text-lg"
                href="/newsletter/newsletter2568/newsletter6803"
              >
                เดือน มีนาคม 2568
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary">
              <Link
                className="text-lg"
                href="/newsletter/newsletter2568/newsletter6802"
              >
                เดือน กุมภาพันธ์ 2568
              </Link>
            </Button>
          </div>
          <div>
            <Button color="primary">
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
