/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HomeBannerSwiper({
  initialBanners,
}: {
  initialBanners?: any[];
}) {
  const [banners, setBanners] = useState<any[]>(initialBanners || []);
  const [loading, setLoading] = useState(!initialBanners);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // ถ้ามีข้อมูลตั้งต้นมาแล้ว ไม่ต้อง fetch ใหม่ในแวบแรก
    if (!initialBanners || initialBanners.length === 0) {
      fetch("/api/banners?isActive=true")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setBanners(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Banner fetch error:", err);
          setBanners([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [initialBanners]);

  if (!mounted)
    return (
      <div className="w-full max-w-[1600px] mx-auto my-4 px-2">
        <div className="relative aspect-21/9 md:aspect-1920/820 overflow-hidden bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-4xl" />
      </div>
    );

  if (banners.length === 0 && !loading) return null;

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto my-4 px-2">
        <div className="relative aspect-21/9 md:aspect-1920/820 overflow-hidden bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-4xl" />
      </div>
    );
  }

  return (
    // ปรับให้กว้างเต็มจอ (w-full) และจำกัดความกว้างสูงสุดตามขนาดรูป (max-w-[1920px])
    <div className="max-w-[1600px] mx-auto px-2 my-2 relative z-0 group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={banners.length > 1}
        // เอา aspect-[21/9] ออก เพื่อให้ความสูงยืดตามรูปภาพจริง
        className="rounded-4xl overflow-hidden shadow-2xl w-full h-auto"
      >
        {banners.map((banner: any, index: number) => (
          <SwiperSlide key={banner._id}>
            <div className="relative w-full h-auto">
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <BannerImage
                    src={banner.imageUrl}
                    alt={banner.title}
                    isFirst={index === 0}
                  />
                </a>
              ) : (
                <BannerImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  isFirst={index === 0}
                />
              )}
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        {/* Navigation Buttons */}
        {(() => {
          const prevBtn =
            "swiper-button-prev !after:content-['prev'] !after:text-xs !after:font-bold text-white! w-12! h-12! bg-black/20! hover:bg-black/50! rounded-full! transition-all duration-300 transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0";
          const nextBtn =
            "swiper-button-next !after:content-['next'] !after:text-xs !after:font-bold text-white! w-12! h-12! bg-black/20! hover:bg-black/50! rounded-full! transition-all duration-300 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0";
          return (
            <>
              <div className={`${prevBtn} ml-6`}></div>
              <div className={`${nextBtn} mr-6`}></div>
            </>
          );
        })()}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background-color: #e11d48 !important;
          width: 24px !important;
          border-radius: 5px !important;
        }
        /* แก้ไขให้ Swiper ปรับความสูงตาม Slide ที่แสดงอยู่ */
        .swiper {
          height: auto !important;
        }
      `}</style>
    </div>
  );
}

function BannerImage({
  src,
  alt,
  isFirst,
}: {
  src: string;
  alt: string;
  isFirst: boolean;
}) {
  return (
    <div className="relative w-full h-auto flex items-center justify-center bg-slate-50">
      {/* ใช้แท็ก img ปกติร่วมกับ Tailwind เพื่อให้ h-auto ทำงานได้สมบูรณ์ที่สุดในแง่ของ Responsive 
         หรือถ้าจะใช้ Next.js <Image /> ต้องระบุ width/height หรือใช้สัดส่วนคงที่
      */}
      <img
        src={src}
        alt={alt}
        // w-full h-auto ทำให้รูปกว้างเต็มและสูงตามสัดส่วนจริง ไม่โดนบีบ ไม่โดนซูม
        className="w-full h-auto block object-contain mx-auto"
        loading={isFirst ? "eager" : "lazy"}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}
