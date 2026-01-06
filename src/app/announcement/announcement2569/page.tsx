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
              href="/announcement/announcement2569/announcement6901"
            >
              เดือน มกราคม 2569
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
