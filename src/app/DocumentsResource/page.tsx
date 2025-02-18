import Link from "next/link";
import { Button } from "antd";

export default function DocumentsResource() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/WorkRegistration">
              งานทะเบียน
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/WorkPerson">
              งานบุคลากร
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/WorkClerical">
              งานสารบรรณ
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
