// import Hero from "@/components/Hero";
// import Faq from "@/components/Faq";
// import Team from "@/components/Team";
// import About from "@/components/About";
// import Clients from "@/components/Clients";
// import Contact from "@/components/Contact";
// import Pricing from "@/components/Pricing";
// import CallToAction from "@/components/CallToAction";
// import Testimonials from "@/components/Testimonials";
import Features from "@/components/Features";
import Wellcome from "@/components/wellcome";
import ShowBidding from "./showbidding/page";
import ShowYoutube from "./ShowYoutube/page";
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
import CounterPage from "@/components/counter";

export const metadata: Metadata = {
  title: "ktltc",
  description: "วิทยาลัยเทคนิคกันทรลักษ์",
};

export default function Home() {

  return (
    <main className=" ">
      <div className="container">
        <ScrollUp />
      </div>
      {/* <Hero /> */}
      <div className=" ">
        <Scrollimage />
      </div>
      <div className="container">
        <Features />
      </div>
      <div className="container py-[48px] ">
        <Wellcome />
      </div>
      <div className="container py-[48px] ">
        <ScrollVelocity />
      </div>
      <div className="container">
        <BackgroundBeamsWithCollisionDemo />
      </div>
      <div className="container">
        <ShowPressRelease />
      </div>
      <div className="container py-[48px]">
        <ShowNewsletter />
      </div>
      <div className="container py-[48px]">
        <ShowAnnouncement />
      </div>
      <div className="container py-[48px]">
        <ShowBidding />
      </div>
      <div className="container py-[48px]">
        <ShowTechnicalcollegeorders />
      </div>
      <div className="container py-[48px]">
        <ShowFacebook />
      </div>
      {/* <div className="container py-[48px]">
        <ShowYoutube />
      </div> */}

      {/* <About />
      <CallToAction />
      <Pricing />
      <Testimonials />
      <Faq />
      <Team />
      <Contact />
      <Clients /> */}
      <div id="fb-root"></div>
      <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/th_TH/sdk.js#xfbml=1&version=v22.0&appId=952832906928077"></script>
      <div className="fb-comments" data-href="https://www.facebook.com/permalink.php?story_fbid=pfbid0SoQQJJH18oLEp5Zt4kF9hKXdJGhyXw41Md5hJv9WWpzWzNjGyit4DzyHAoL27BnPl&amp;id=61575575410714" data-width="" data-numposts="5"></div>
    </main>
  );
}
