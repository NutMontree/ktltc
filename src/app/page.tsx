import Features from "./Features";

import clientPromise from "@/lib/db";
import TenderPage from "./tender/page";
import CommandPage from "./command/page";
import Newsletter from "./newsletter/page";
import PressRelease from "./pressrelease/page";
import Announcement from "./announcement/page";
import InternshipPage from "./internship/page";
import WelcomePage from "@/components/WelcomePage";
import HomeBannerSwiper from "@/components/HomeBannerSwiper";
import StudentSupportSystem from "./StudentSupportSystem/page";
import ExternalQualityAssurance from "./ExternalQualityAssurance";
import Link from "next/link";
import dynamic from "next/dynamic";

const ScrollVelocity = dynamic(() => import("@/components/Scrollvelocity"), { ssr: true });

export const revalidate = 300; // Revalidate every 5 minutes (300 seconds) for better performance

// ✅ 1. เอา "use client" ออก และเปลี่ยนการเรียกใช้ dynamic ให้เหมาะสม
import {
  DynamicBackgroundBeams as BackgroundBeamsWithCollisionDemo,
  DynamicSocialFeedDisplay as SocialFeedDisplay,
  DynamicCalendarPage as CalendarPage,
  DynamicQAPage as QAPage,
} from "@/components/home/DynamicClientSections";
import ShowFacebookClient from "@/components/ShowFacebookClient";
import PerformancePage from "./performance/page";

// ดึงข้อมูลผ่าน Server Side เหมือนเดิม (รันบนเครื่องเซิร์ฟเวอร์เท่านั้น ปลอดภัยกว่า)
async function getHomeData() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const [visibilityData, siteData, postersData, feeds, banners, collegeStats] = await Promise.all([
      db.collection("home_settings").find().toArray(),
      db.collection("site_settings").find().toArray(),
      db.collection("posters").find({ isActive: true }).sort({ orderIndex: 1, createdAt: -1 }).toArray(),
      db.collection("social_feeds").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("banners").find({ isActive: true }).toArray(),
      db.collection("college_stats").find({}).sort({ id: 1 }).toArray(),
    ]);

    const isShow = visibilityData.reduce((acc: any, item: any) => {
      acc[item.componentId] = item.isVisible;
      return acc;
    }, {});

    const settings = siteData.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      isShow,
      settings,
      activePosters: JSON.parse(JSON.stringify(postersData)),
      feeds: JSON.parse(JSON.stringify(feeds)),
      banners: JSON.parse(JSON.stringify(banners)),
      collegeStats: JSON.parse(JSON.stringify(collegeStats)),
    };
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return { isShow: {}, settings: {}, activePosters: [], feeds: [], banners: [], collegeStats: [] };
  }
}

export default async function Home() {
  const { isShow, settings, activePosters, feeds, banners, collegeStats } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* พื้นหลังตกแต่ง (Background Decor) ปิดบนมือถือเพื่อลดภาระเครื่อง (ลด INP/LCP) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30 hidden md:block">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/5 dark:bg-cyan-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 dark:bg-indigo-500/5 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] w-[40%] h-[40%] rounded-full bg-pink-400/5 dark:bg-pink-500/5 blur-[120px] -translate-x-1/2"></div>
      </div>
      <main className="grow">
        {isShow.banner !== false && (
          <section className="w-full mb-8">
            <HomeBannerSwiper initialBanners={banners} />
          </section>
        )}

        {/* ✅ Container คุมความกว้างเนื้อหา */}
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Student Verify Button */}
          <div className="py-12 flex justify-center">
            <Link
              href="/student/verify"
              className="group relative inline-flex items-center gap-3 px-4 py-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all duration-300" />
              <svg
                className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="relative z-10">ระบบพิสูจน์ตัวตนนักเรียน นักศึกษา</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
          {isShow.student_support !== false && <StudentSupportSystem />}
          {isShow.qa_ita !== false && <ExternalQualityAssurance />}
          {isShow.features !== false && <Features />}

          {isShow.welcome !== false && (
            <div className="py-6">
              <WelcomePage />
            </div>
          )}

          {/* ✅ Marquee กว้างเต็มจอ */}
          {isShow.scroll_velocity !== false && (
            <ScrollVelocity text1={settings.marquee_text_1} text2={settings.marquee_text_2} />
          )}
        </div>

        {isShow.performance !== false && (
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="py-12">
              <PerformancePage />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full px-2">
          {isShow.background_effect !== false && activePosters.length > 0 && (
            <div className="flex flex-col gap-10 my-10 py-12">
              {Array.isArray(activePosters) &&
                activePosters.map((poster: any) => (
                  <BackgroundBeamsWithCollisionDemo key={poster._id.toString()} data={poster} />
                ))}
            </div>
          )}
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-2">
          <div className="py-12">{isShow.press_release !== false && <PressRelease />}</div>
          <div className="py-12">{isShow.newsletter !== false && <Newsletter />}</div>
          <div className="py-12">{isShow.announcement !== false && <Announcement />}</div>
          <div className="py-12">{isShow.tender !== false && <TenderPage />}</div>
          <div className="py-12">{isShow.command !== false && <CommandPage />}</div>
          <div className="py-12">{isShow.internship !== false && <InternshipPage />}</div>
          <div className="py-12">
            <ShowFacebookClient />
          </div>

          {isShow.social_feed !== false && (feeds?.length ?? 0) > 0 && (
            <div className="py-12">
              {Array.isArray(feeds) && <SocialFeedDisplay feeds={feeds} />}
            </div>
          )}
          {isShow.q_and_a !== false && (
            <div className="py-12">
              <QAPage />
            </div>
          )}
          {isShow.calendar !== false && (
            <div className="py-12">
              <CalendarPage />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
