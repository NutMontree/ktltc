"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@heroui/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion, AnimatePresence } from "framer-motion";
import {
  SettingOutlined,
  UserOutlined,
  BuildFilled,
  LoadingOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";

interface User {
  _id: string;
  name: string;
  department: string;
  position?: string;
  faction?: string;
  description?: string;
  image?: string;
  phone?: string;
  email?: string;
  lineId?: string;
}

interface PersonnelListProps {
  departmentCode?: string;
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
          // Sort by orderIndex if available
          const sortedUsers = (data.users || []).sort(
            (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0),
          );
          setUsers(sortedUsers);
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
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          ยังไม่มีข้อมูลบุคลากร
        </h3>
        <p className="text-slate-500 dark:text-zinc-500 text-center px-6">
          กรุณาเพิ่มข้อมูลบุคลากรและตั้งค่าสังกัดเป็น <br />
          <span className="font-bold text-[#DAA520]">{departmentName}</span> ในระบบแอดมิน
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVar}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-wrap justify-center gap-8"
    >
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user._id}
            variants={itemVar}
            layout="position"
            className="group w-full max-w-[320px]"
          >
            <BackgroundGradient className="h-full rounded-[30px] bg-white p-4 shadow-xl transition-all hover:shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="flex h-full flex-col">
                {/* Image Container - Square only as requested */}
                <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50">
                  <div className="h-full w-full flex items-center justify-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "บุคลากร"}
                        // object-cover handles "zooming in" for vertical/portrait images
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                        removeWrapper
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UserOutlined className="text-6xl text-slate-200 dark:text-zinc-700" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col text-center">
                  <h3 className="text-xl font-black text-slate-900 transition-colors group-hover:text-[#DAA520] dark:text-white leading-tight tracking-tight">
                    {user.name}
                  </h3>

                  {user.position && (
                    <div className="mt-2 mb-4 inline-block">
                      <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-black text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 uppercase tracking-wide">
                        {user.position}
                      </span>
                    </div>
                  )}

                  <div className="mx-auto mb-4 h-px w-16 bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-zinc-800"></div>

                  <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {user.department && (
                      <p className="flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {user.department}
                        </span>
                      </p>
                    )}
                    {user.faction && <p className="opacity-70 italic">{user.faction}</p>}
                    {user.description && (
                      <p className="mt-2 text-[11px] leading-relaxed opacity-60 line-clamp-3">
                        {user.description}
                      </p>
                    )}
                  </div>

                  {/* Contact Info (Direct Channels) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                    {user.phone ? (
                      <p className="flex items-center gap-2">
                        <PhoneOutlined className="text-amber-500 shrink-0" />
                        <span className="font-bold">โทร:</span>{" "}
                        <a href={`tel:${user.phone}`} className="hover:underline">
                          {user.phone}
                        </a>
                      </p>
                    ) : null}
                    {user.email ? (
                      <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <MailOutlined className="text-amber-500 shrink-0" />
                        <span className="font-bold">อีเมล:</span>{" "}
                        <span className="truncate">{user.email}</span>
                      </p>
                    ) : null}
                    {user.lineId ? (
                      <p className="flex items-center gap-2">
                        <MessageOutlined className="text-amber-500 shrink-0" />
                        <span className="font-bold">Line:</span> <span>{user.lineId}</span>
                      </p>
                    ) : null}
                    {!user.phone && !user.email && !user.lineId && (
                      <p className="flex items-center gap-2 opacity-75">
                        <MailOutlined className="text-amber-500 shrink-0" />
                        <span className="font-bold">ติดต่อวิทยาลัย:</span>{" "}
                        <span>info@ktltc.ac.th</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-zinc-800 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white shadow-lg dark:bg-zinc-100 dark:text-slate-900 uppercase tracking-tighter">
                    <BuildFilled className="text-amber-500" />
                    <span>{departmentCode || "KTLTC PERSONNEL"}</span>
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
