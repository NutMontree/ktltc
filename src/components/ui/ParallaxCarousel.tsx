import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, useAnimationFrame } from "framer-motion";
import { UserOutlined, TeamOutlined, EllipsisOutlined, UserAddOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function ParallaxCarousel({
  users,
  currentUserId,
  myFriendsIds,
  onAddFriend,
}: {
  users: any[];
  currentUserId: string;
  myFriendsIds: string[];
  onAddFriend: (e: any, userId: string) => void;
}) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Parallax setup
  const x = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 25, stiffness: 200, mass: 0.5 });
  
  useEffect(() => {
    if (carouselRef.current) {
      setContainerWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [users]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-5 mb-6 overflow-hidden">
      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TeamOutlined className="text-sm" />
          </div>
          <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
            คนที่คุณอาจจะรู้จัก
          </h3>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
          <EllipsisOutlined />
        </button>
      </div>

      <div className="relative w-full overflow-hidden" ref={carouselRef}>
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -containerWidth }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          style={{ x: smoothX }}
          className="flex gap-4 cursor-grab active:cursor-grabbing pb-2"
        >
          {users.map((u, index) => {
            const uFriendsIds = (u.friends || []).map((fId: any) => String(fId));
            const mutualCount = uFriendsIds.filter((fId: any) => myFriendsIds.includes(fId)).length;

            // Individual Parallax Transform for each item
            // Using a simple technique: as the container moves `x`, the image shifts slightly in the opposite direction
            const itemOffset = index * 216; // width (200) + gap (16)
            const parallaxShift = useTransform(smoothX, 
              [-itemOffset - 500, -itemOffset + 500], 
              [-40, 40]
            );

            return (
              <motion.div
                key={String(u._id)}
                className="min-w-[200px] w-[200px] h-[250px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden flex flex-col group relative shadow-sm hover:shadow-lg transition-shadow duration-300"
                onClick={() => {
                  if (!isDragging) {
                    router.push(`/dashboard/profile/${String(u._id)}`);
                  }
                }}
              >
                <div className="relative w-full h-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  {u.image ? (
                    <motion.img
                      src={u.image}
                      alt={u.name}
                      style={{ x: parallaxShift }}
                      className="w-[120%] h-full max-w-none object-cover origin-center ml-[-10%]"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-300">
                      <UserOutlined className="text-5xl" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                    <h4 className="font-black text-white text-base truncate drop-shadow-md">
                      {u.name}
                    </h4>
                    {mutualCount > 0 && (
                      <p className="text-xs text-white/80 font-medium mt-1 drop-shadow-sm">
                        เพื่อนร่วมกัน {mutualCount} คน
                      </p>
                    )}
                  </div>
                  
                  {/* Hover Add Button */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFriend(e, String(u._id));
                      }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 border border-white/30"
                      title="เพิ่มเพื่อน"
                    >
                      <UserAddOutlined />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
