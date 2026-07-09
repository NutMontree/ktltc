"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ children, fallbackUrl = "/news" }: { children: React.ReactNode; fallbackUrl?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackUrl);
        }
      }}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group cursor-pointer border-none bg-transparent p-0"
    >
      {children}
    </button>
  );
}
