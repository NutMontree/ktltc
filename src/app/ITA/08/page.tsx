import Link from "next/link";

export default function QAPage() {
  return (
    <>
      <p className="text-xl">Link Wab Page</p>
      <div className="py-4">
        <Link href="/ITA/08/qa">
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. ระบบ Q&A วิทยาลัยเทคนิคกันทรลักษ์
          </p>
        </Link>
      </div>
    </>
  );
}
