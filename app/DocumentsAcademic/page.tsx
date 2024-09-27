import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function DocumentsAcademic() {
  return (
    <>
      <div className="gap-2 grid">
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/">
              งานพัฒนาหลักสูตรฯ
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary" variant="ghost">
            <Link className="text-lg" href="/WorkEvaluation">
              งานวัดผล
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
