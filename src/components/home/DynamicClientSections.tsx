"use client";

import dynamic from "next/dynamic";

// ✅ ปรับให้รองรับ SSR สำหรับคอมโพเนนต์ที่แสดงข้อมูลสำคัญ และเพิ่ม Skeleton สำหรับส่วนที่ต้องรอ Client
export const DynamicSocialFeedDisplay = dynamic(
  () => import("@/components/home/SocialFeedDisplay"),
  { 
    ssr: true,
    loading: () => <SectionSkeleton title="กำลังโหลดวิดีโอ..." />
  }
);

export const DynamicCalendarPage = dynamic(
  () => import("@/components/Calendar"),
  { 
    ssr: false, 
    loading: () => <SectionSkeleton title="กำลังโหลดปฏิทิน..." height="h-96" />
  }
);

export const DynamicQAPage = dynamic(
  () => import("@/app/q-and-a/page"),
  { 
    ssr: false,
    loading: () => <SectionSkeleton title="กำลังโหลดกระดานถาม-ตอบ..." />
  }
);

export const DynamicBackgroundBeams = dynamic(
  () => import("@/components/BackgroundBeamsWithCollisionDemo"),
  { ssr: true }
);

function SectionSkeleton({ title, height = "h-64" }: { title: string, height?: string }) {
  return (
    <div className={`w-full ${height} bg-zinc-50 dark:bg-zinc-950/20 rounded-[3rem] animate-pulse flex flex-col items-center justify-center border border-zinc-100 dark:border-zinc-800`}>
      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4" />
      <div className="text-zinc-400 font-bold text-sm uppercase tracking-widest">{title}</div>
    </div>
  );
}
