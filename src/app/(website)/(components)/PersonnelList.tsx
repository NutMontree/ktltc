"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@heroui/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion, AnimatePresence } from "framer-motion";
import { SettingOutlined, UserOutlined, BuildFilled, LoadingOutlined } from "@ant-design/icons";

interface User {
  _id: string;
  name: string;
  department: string;
  position?: string;
  faction?: string;
  description?: string;
  image?: string;
}

interface PersonnelListProps {
  departmentCode?: string; // Optional short code if needed
  departmentName: string;
}

export default function PersonnelList({ departmentCode, departmentName }: PersonnelListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/department?name=${encodeURIComponent(departmentName)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch personnel", error);
      } finally {
        setLoading(false);
      }
    };
    if (departmentName) {
      fetchPersonnel();
    }
  }, [departmentName]);

  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลบุคลากร...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[300px] border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl mx-4">
        <UserOutlined className="text-5xl text-slate-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">ยังไม่มีข้อมูลบุคลากร</h3>
        <p className="text-slate-500 dark:text-zinc-500">
          กรุณาเพิ่มข้อมูลบุคลากรและตั้งค่าสังกัดเป็น <span className="font-bold text-[#DAA520]">{departmentName}</span> ในระบบแอดมิน
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVar}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence>
        {users.map((user) => (
          <motion.div key={user._id} variants={itemVar} layout="position" className="group h-full">
            <BackgroundGradient className="h-full rounded-[22px] bg-white p-5 shadow-lg transition-all hover:shadow-xl dark:bg-zinc-900">
              <div className="flex h-full flex-col">
                {/* Image Container */}
                <div className="relative mb-5 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <div className="aspect-3/4 w-full flex items-center justify-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "บุคลากร"}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        removeWrapper
                      />
                    ) : (
                      <UserOutlined className="text-6xl text-slate-300 dark:text-zinc-700" />
                    )}
                  </div>
                  {/* Overlay Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                    <SettingOutlined className="text-3xl text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col text-center">
                  <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-[#DAA520] dark:text-white leading-tight">
                    {user.name}
                  </h3>

                  {user.position && (
                    <p className="mb-3 mt-1.5 text-sm font-bold text-[#DAA520]">
                      {user.position}
                    </p>
                  )}

                  <div className="mx-auto mb-3 mt-2 h-px w-full bg-slate-100 dark:bg-zinc-800"></div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {user.department && (
                      <p className="flex items-center justify-center gap-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          แผนก:
                        </span>{" "}
                        {user.department}
                      </p>
                    )}
                    {user.faction && <p>{user.faction}</p>}
                    {user.description && (
                      <p className="italic opacity-80 mt-1">{user.description}</p>
                    )}
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="mt-5 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm dark:bg-white dark:text-slate-900">
                    <BuildFilled />
                    <span>{departmentCode || 'KTLTC Staff'}</span>
                  </span>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
