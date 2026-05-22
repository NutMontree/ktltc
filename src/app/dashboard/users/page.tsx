"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/dve");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400 font-bold">
      กำลังนำทางไปยังหน้าเช็ค DVE...
    </div>
  );
}
