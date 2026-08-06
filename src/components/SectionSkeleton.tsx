import React from "react";

export default function SectionSkeleton() {
  return (
    <div className="w-full py-12 animate-pulse">
      <div className="max-w-[1600px] mx-auto px-4 w-full">
        <div className="flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="h-8 md:h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          
          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-full h-48 md:h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
