import Features from "./Features";

import clientPromise from "@/lib/db";
import TenderPage from "./tender/page";
import CommandPage from "./command/page";
import Newsletter from "./newsletter/page";
import PressRelease from "./pressrelease/page";
import Announcement from "./announcement/page";
import InternshipPage from "./internship/page";
import WelcomePage from "@/components/WelcomePage";
import ScrollVelocity from "@/components/Scrollvelocity";
import HomeBannerSwiper from "@/components/HomeBannerSwiper";
import StudentSupportSystem from "./StudentSupportSystem/page";
import ExternalQualityAssurance from "./ExternalQualityAssurance";

export const revalidate = 0; // บังคับให้หน้าเว็บดึงข้อมูลสดใหม่ตลอด (หลีกเลี่ยงชื่อตัวแปรซ้ำกับ dynamic import)

// ✅ 1. เอา "use client" ออก และเปลี่ยนการเรียกใช้ dynamic ให้เหมาะสม
import {
  DynamicBackgroundBeams as BackgroundBeamsWithCollisionDemo,
  DynamicSocialFeedDisplay as SocialFeedDisplay,
  DynamicCalendarPage as CalendarPage,
  DynamicQAPage as QAPage,
} from "@/components/home/DynamicClientSections";
import ShowFacebookClient from "@/components/ShowFacebookClient";

// ดึงข้อมูลผ่าน Server Side เหมือนเดิม (รันบนเครื่องเซิร์ฟเวอร์เท่านั้น ปลอดภัยกว่า)
async function getHomeData() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const [visibilityData, siteData, postersData, feeds] = await Promise.all([
      db.collection("home_settings").find().toArray(),
      db.collection("site_settings").find().toArray(),
      db
        .collection("posters")
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("social_feeds").find({}).sort({ createdAt: -1 }).toArray(),
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
    };
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return { isShow: {}, settings: {}, activePosters: [], feeds: [] };
  }
}

export default async function Home() {
  const { isShow, settings, activePosters, feeds } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow">
        {isShow.banner !== false && (
          <section className="w-full mb-8">
            <HomeBannerSwiper />
          </section>
        )}

        {/* ✅ Container คุมความกว้างเนื้อหา */}
        <div className="max-w-[1600px] mx-auto w-full">
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
            <ScrollVelocity
              text1={settings.marquee_text_1}
              text2={settings.marquee_text_2}
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto w-full px-2">
          {isShow.background_effect !== false && activePosters.length > 0 && (
            <div className="flex flex-col gap-10 my-10 py-12">
              {Array.isArray(activePosters) &&
                activePosters.map((poster: any) => (
                  <BackgroundBeamsWithCollisionDemo
                    key={poster._id.toString()}
                    data={poster}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-2">
          <div className="py-12">
            {isShow.press_release !== false && <PressRelease />}
          </div>
          <div className="py-12">
            {isShow.newsletter !== false && <Newsletter />}
          </div>
          <div className="py-12">
            {isShow.announcement !== false && <Announcement />}
          </div>
          <div className="py-12">
            {isShow.tender !== false && <TenderPage />}
          </div>
          <div className="py-12">
            {isShow.command !== false && <CommandPage />}
          </div>
          <div className="py-12">
            {isShow.internship !== false && <InternshipPage />}
          </div>
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
