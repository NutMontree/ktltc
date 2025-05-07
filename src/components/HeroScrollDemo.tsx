// // HeroScrollDemo

// "use client";
// import React from "react";

// import Image from "next/image";
// import { ContainerScroll } from "./ui/container-scroll-animation";
// // import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
// import Link from "next/link";

// export function HeroScrollDemo() {
//   return (
//     <>
//       <Link href="pressrelease382">
//         <BackgroundBeamsWithCollision>
//           <div className="flex flex-col overflow-hidden">
//             <ContainerScroll
//               titleComponent={
//                 <>
//                   <h1 className="text-4xl font-semibold text-black dark:text-white">
//                     ขอเชิญชวนทุกท่านร่วมบริจาคสิ่งของ <br />
//                     <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
//                       เพื่อช่วยเหลือผู้ประสบอุทกภัยในภาคอีสาน
//                     </span>
//                   </h1>
//                 </>
//               }
//             >
//               <Image
//                 src={`/images/ข่าวประชาสัมพันธ์/2567/กันยายน/30/1.webp`}
//                 alt="hero"
//                 height={720}
//                 width={1400}
//                 className="mx-auto rounded-2xl object-cover h-full object-left-top"
//                 draggable={false}
//               />
//             </ContainerScroll>
//           </div>
//         </BackgroundBeamsWithCollision>
//       </Link>
//     </>
//   );
// }
