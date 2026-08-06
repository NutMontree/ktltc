"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ScrollUp = dynamic(() => import("@/components/Common/ScrollUp"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });
const ActiveUserTracker = dynamic(() => import("@/components/ActiveUserTracker"), { ssr: false });
const GlobalEffectRenderer = dynamic(() => import("@/components/effects/GlobalEffectRenderer"), { ssr: false });
const GoogleTranslate = dynamic(() => import("@/components/GoogleTranslate"), { ssr: false });
const CustomSlangTranslator = dynamic(() => import("@/components/CustomSlangTranslator"), { ssr: false });

export default function ClientBackgroundEffects({ globalEffect }: { globalEffect: string }) {
  return (
    <div className="contents">
      <div style={{ display: "none" }} aria-hidden="true">
        <ActiveUserTracker />
        <GoogleTranslate />
        <CustomSlangTranslator />
      </div>
      
      {/* These need to be visible */}
      <GlobalEffectRenderer initialEffect={globalEffect} />
      <ScrollUp />
      <CookieConsent />
    </div>
  );
}
