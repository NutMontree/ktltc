"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="text-center text-xl py-40">
      <h2>Something went wrong!</h2>
      <h2 className="text-red-500 text-xl">
        ขนาด Code ยังลืมได้ แล้วทำไม ถึงยังลืมเขาไม่ได้ !! T.T
      </h2>
      <div className="text-xl text-center pt-4">
        <div>กรุณาตรวจสอบ Code ของมึง</div>
        <div className="flex justify-center">
          <p>ก่อนทำการ Refresh อีกครั้ง</p>
          <p className="text-red-500 pl-2 text-xxl">! SUD</p>
        </div>
      </div>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      ></button>
    </div>
  );
}
