// import Hero from "@/components/Hero";
// import Faq from "@/components/Faq";
// import Team from "@/components/Team";
// import About from "@/components/About";
// import Clients from "@/components/Clients";
// import Contact from "@/components/Contact";
// import Pricing from "@/components/Pricing";
// import CallToAction from "@/components/CallToAction";
// import Testimonials from "@/components/Testimonials";
import ShowVideos from "./showvideos/page";
import Features from "@/components/Features";
import Wellcome from "@/components/wellcome";
import ShowBidding from "./showbidding/page";
import ShowNewsletter from "./shownewsletter/page";
import Scrollimage from "@/components/Scrollimage";
import ScrollUp from "@/components/Common/ScrollUp";
import ShowFacebook from "@/components/ShowFacebook";
import ShowAnnouncement from "./showannouncement/page";
import ShowPressRelease from "./showpressrelease/page";
import ScrollVelocity from "@/components/Scrollvelocity";
import ShowTechnicalcollegeorders from "./showtechnicalcollegeorders/page";
import { Metadata } from "next";
import { BackgroundBeamsWithCollisionDemo } from "@/components/BackgroundBeamsWithCollisionDemo";

export const metadata: Metadata = {
  title: "ktltc",
  description: "วิทยาลัยเทคนิคกันทรลักษ์",
};

export default function Home() {

  return (
    <main className="container">
      <ScrollUp />
      {/* <Hero /> */}
      <div>
        <Scrollimage />
      </div>
      <div>
        <Features />
      </div>
      <div className="py-[48px]">
        <Wellcome />
      </div>
      <div className="py-[48px]">
        <ScrollVelocity />
      </div>
      <div className=" py-[48px]">
        <BackgroundBeamsWithCollisionDemo />
      </div>
      <div className=" ">
        <ShowPressRelease />
      </div>
      <div className=" py-[48px]">
        <ShowNewsletter />
      </div>
      <div className=" py-[48px]">
        <ShowAnnouncement />
      </div>
      <div className=" py-[48px]">
        <ShowBidding />
      </div>
      <div className=" py-[48px]">
        <ShowTechnicalcollegeorders />
      </div>
      <div className=" py-[48px]">
        <ShowFacebook />
      </div>
      <div className=" py-[48px]">
        <ShowVideos />
      </div>

      {/* <About />
      <CallToAction />
      <Pricing />
      <Testimonials />
      <Faq />
      <Team />
      <Contact />
      <Clients /> */}
    </main>
  );
}
