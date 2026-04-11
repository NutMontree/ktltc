"use client";

import dynamic from "next/dynamic";

// ✅ ต้อง import dynamic + ssr:false ใน Client Component เท่านั้น
export const DynamicSocialFeedDisplay = dynamic(
  () => import("@/components/home/SocialFeedDisplay"),
  { ssr: false }
);

export const DynamicCalendarPage = dynamic(
  () => import("@/components/Calendar"),
  { ssr: false }
);

export const DynamicQAPage = dynamic(
  () => import("@/app/q-and-a/page"),
  { ssr: false }
);

export const DynamicBackgroundBeams = dynamic(
  () => import("@/components/BackgroundBeamsWithCollisionDemo"),
  { ssr: false }
);
