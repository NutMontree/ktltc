/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";

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

  useEffect(() => {
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

  if (banners.length === 0 && !loading) return null;

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto my-4 px-2">
        <div className="relative aspect-[21/9] md:aspect-[1920/820] overflow-hidden bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-4xl" />
      </div>
    );
  }

  return (
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
        className="rounded-4xl overflow-hidden shadow-2xl w-full h-auto"
      >
        {banners.map((banner: any, index: number) => (
          <SwiperSlide key={banner._id}>
            <div className="relative w-full aspect-[21/9] md:aspect-[1920/820]">
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
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
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        priority={isFirst}
        sizes="(max-width: 768px) 100vw, 1600px"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}
