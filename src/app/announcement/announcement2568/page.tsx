import Link from "next/link";
import { Button } from "antd";
import AnnouncementPage from "../page";

export default function Announcement2568() {
  return (
    <>
      <AnnouncementPage />

      <div className="grid gap-4 pt-20 pb-4">
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6806"
            >
              เดือน มิถุนายน 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6805"
            >
              เดือน พฤษภาคม 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link
              className="text-lg"
              href="/announcement/announcement2568/announcement6804"
            >
              เดือน เมษายน 2568
            </Link>
          </Button>
        </div>
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
