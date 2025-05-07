"use client"; // top to the file
import Link from "next/link";
import { Button } from 'antd';
import PressReleasePage from "../page";

export default function Pressrelease2568() {

  return (
    <>
      <PressReleasePage />

      <div className="grid gap-4 pt-20 pb-4">
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/pressrelease/2568/press6805">
              เดือน พฤษภาคม 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/pressrelease/2568/press6804">
              เดือน เมษายน 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/pressrelease/2568/press6803">
              เดือน มีนาคม 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/pressrelease/2568/press6802">
              เดือน กุมภาพันธ์ 2568
            </Link>
          </Button>
        </div>
        <div>
          <Button color="primary">
            <Link className="text-lg" href="/pressrelease/2568/press6801">
              เดือน มกราคม 2568
            </Link>
          </Button>
        </div>
      </div >
    </>
  );
}
