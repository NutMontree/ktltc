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
    <div className="text-center py-40">
      <h2>Something went wrong!</h2>
      <h2 className="text-red-500">
        ขนาด Code ยังลืมได้ แล้วทำไม @ ถึงยังลืมเขาไม่ได้ T.T
      </h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
