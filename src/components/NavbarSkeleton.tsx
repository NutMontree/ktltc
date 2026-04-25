"use client";

import React from "react";

export default function NavbarSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-0 px-0">
      <nav className="w-full max-w-[1600px] mx-auto py-4 px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-20 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse hidden sm:block" />
          </div>

          {/* Desktop Menu Skeleton */}
          <div className="hidden xl:flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>

          {/* Right Actions Skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse hidden sm:block" />
            <div className="w-32 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse hidden sm:block" />
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse xl:hidden" />
          </div>
        </div>
      </nav>
    </div>
  );
}
