"use client";

import dynamic from "next/dynamic";

/**
 * DynamicClientSections.tsx: จัดการการโหลดคอมโพเนนต์แบบ Dynamic (Lazy Loading)
 * 
 * หน้าที่: 
 * 1. ช่วยลดขนาดไฟล์ Bundle เริ่มต้นของหน้าแรก (Home)
 * 2. กำหนดว่าคอมโพเนนต์ไหนควรทำ SSR (Server Side Rendering) หรือโหลดเฉพาะฝั่ง Client
 * 3. แสดง Skeleton (ภาพร่างจำลอง) ระหว่างรอคอมโพเนนต์จริงโหลดเสร็จ
 */

// โหลดคอมโพเนนต์แสดงผลวิดีโอ/โซเชียลมีเดีย
export const DynamicSocialFeedDisplay = dynamic(
  () => import("@/components/home/SocialFeedDisplay"),
  { 
    ssr: true, // อนุญาตให้ทำ SSR เพื่อ SEO
    loading: () => <SectionSkeleton title="กำลังโหลดวิดีโอ..." />
  }
);

// โหลดปฏิทินกิจกรรม (ใช้เฉพาะฝั่ง Client เพราะอาจมีเรื่อง Timezone/Browser APIs)
export const DynamicCalendarPage = dynamic(
  () => import("@/components/Calendar"),
  { 
    ssr: false, 
    loading: () => <SectionSkeleton title="กำลังโหลดปฏิทิน..." height="h-96" />
  }
);

// โหลดกระดานถาม-ตอบ
export const DynamicQAPage = dynamic(
  () => import("@/app/q-and-a/page"),
  { 
    ssr: false,
    loading: () => <SectionSkeleton title="กำลังโหลดกระดานถาม-ตอบ..." />
  }
);

// โหลดเอฟเฟกต์พื้นหลัง (Background Beams)
export const DynamicBackgroundBeams = dynamic(
  () => import("@/components/BackgroundBeamsWithCollisionDemo"),
  { ssr: true }
);

/**
 * SectionSkeleton: คอมโพเนนต์แสดงสถานะ "กำลังโหลด" ให้ดูสวยงาม
 */
function SectionSkeleton({ title, height = "h-64" }: { title: string, height?: string }) {
  return (
    <div className={`w-full ${height} bg-zinc-50 dark:bg-zinc-950/20 rounded-[3rem] animate-pulse flex flex-col items-center justify-center border border-zinc-100 dark:border-zinc-800`}>
      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4" />
      <div className="text-zinc-400 font-bold text-sm uppercase tracking-widest">{title}</div>
    </div>
  );
}

