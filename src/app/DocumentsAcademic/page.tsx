import Link from "next/link";
import { Button } from "antd";

export default function DocumentsAcademic() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/WorkCourse">
              งานพัฒนาหลักสูตรฯ
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/WorkEvaluation">
              งานวัดผล
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
