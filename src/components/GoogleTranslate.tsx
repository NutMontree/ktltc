"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function GoogleTranslate() {
  // ซ่อน UI ของ Google Translate แบบดั้งเดิมที่มักจะทำให้เว็บหน้าตาเพี้ยน
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      #google_translate_element { display: none !important; }
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      .skiptranslate { display: none !important; }
      /* ซ่อน Tooltip ที่ชอบเด้งขึ้นมาเวลาเอาเมาส์ชี้ข้อความที่แปลแล้ว */
      #goog-gt-tt { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <div id="google_translate_element"></div>
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'th',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `,
        }}
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
