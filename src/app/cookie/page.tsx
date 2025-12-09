"use client";
import React, { useEffect, useState } from "react";
import cookie from "js-cookie";
import Link from "next/link";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentCookie = cookie.get("cookieConsent");

    if (!consentCookie) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setShowBanner(false);
    cookie.set("cookieConsent", "accepted", { expires: 10 });
  };

  const handleReject = () => {
    setShowBanner(false);
    cookie.set("cookieConsent", "rejected", { expires: 10 });
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <section className="container">
        <div className="fixed bottom-0 left-0 z-50 w-full px-4 py-4">
          <div className="dark:bg-dark-2 xs:px-10 border-stroke dark:border-dark-3 grid justify-between gap-4 rounded-lg border bg-gray-50 px-6 py-8 md:grid-flow-col md:px-8 lg:px-10">
            <div>
              <p>เว็บไซต์นี้ใช้คุกกี้</p>
              <p>
                เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพ
                และประสบการณ์ที่ดีในการใช้งานเว็บไซต์
                คุณสามารถเลือกตั้งค่าความยินยอมการใช้คุกกี้ได้ โดยคลิก
                "การตั้งค่าคุกกี้" &nbsp;{" "}
                <Link
                  className="text-orange-500 underline"
                  href="/cookie/privacypolicy"
                >
                  นโยบายความเป็นส่วนตัว
                </Link>
              </p>
            </div>
            <div className="">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center rounded-md bg-orange-600 px-7 py-3 text-center text-base font-medium text-white hover:bg-orange-600"
                >
                  Accept
                </button>{" "}
                <br />
                <button
                  onClick={handleReject}
                  className="text-body-color shadow-1 hover:bg-primary dark:bg-dark dark:text-black-6 inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-center text-base font-medium hover:text-white dark:shadow-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CookieConsentBanner;
