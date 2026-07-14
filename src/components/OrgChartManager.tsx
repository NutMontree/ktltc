"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, MessageSquare, Briefcase, Building2, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { DEPARTMENT_GROUPS } from "@/constants/departments";

interface OrgChartManagerProps {
  department: string;
  departmentNameTh: string;
  title: string;
}

interface UserItem {
  _id: string;
  name: string;
  position: string;
  description?: string;
  image?: string;
  role: string;
  positionNumber?: string;
  affiliation?: string;
  department?: string;
  faction?: string;
  phone?: string;
  email?: string;
  lineId?: string;
}

export default function OrgChartManager({ departmentNameTh, title }: OrgChartManagerProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const roleMap: Record<string, string> = {
          "ฝ่ายบริหารทรัพยากร": "deputy_resource",
          "ฝ่ายยุทธศาสตร์และแผนงาน": "deputy_strategy",
          "ฝ่ายวิชาการ": "deputy_academic",
          "ฝ่ายพัฒากิจการนักเรียน นักศึกษา": "deputy_student_affairs",
          "ฝ่ายพัฒนากิจการนักเรียน นักศึกษา": "deputy_student_affairs",
        };
        const targetRole = roleMap[departmentNameTh];

        // ค้นหารายชื่องานย่อย (sub-factions) ที่อยู่ในฝ่ายนี้
        const findMatchedGroup = (deptName: string) => {
          if (deptName.includes("กิจการนักเรียน")) {
            return DEPARTMENT_GROUPS.find(g => g.label.includes("กิจการนักเรียน"));
          }
          return DEPARTMENT_GROUPS.find(g => g.label.includes(deptName));
        };
        const matchedGroup = findMatchedGroup(departmentNameTh);
        const subFactions = matchedGroup ? matchedGroup.options.map(o => o.value) : [];

        const processUsers = (allUsers: any[]) => {
          const deptUsers = allUsers.filter((u: any) => {
            const userDept = u.department || "";
            const userFaction = u.faction || "";
            const userRole = String(u.role || "").toLowerCase();
            
            // ยกเว้นนักเรียนและสมาชิกทั่วไป ไม่ให้แสดงในแผนภูมิบุคลากร
            if (["student", "user", "member", "members"].includes(userRole || "")) {
              return false;
            }
            
            const isDirectMatch = userDept.includes(departmentNameTh) || userFaction.includes(departmentNameTh);
            const isSubFactionMatch = subFactions.some(sub => userDept.includes(sub) || userFaction.includes(sub));
            
            return isDirectMatch || isSubFactionMatch || (targetRole && u.role === targetRole);
          });
          setUsers(deptUsers);
        };

        const cacheKey = "ktltc_users_all_v2";
        const timeKey = "ktltc_users_all_time_v2";
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(timeKey);
        
        if (cached && cacheTime && Date.now() - Number(cacheTime) < 300000) {
          processUsers(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const allUsers = data.users || [];
          
          sessionStorage.setItem(cacheKey, JSON.stringify(allUsers));
          sessionStorage.setItem(timeKey, String(Date.now()));

          processUsers(allUsers);
        }
      } catch (error) {
        console.error("Failed to fetch org users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [departmentNameTh]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลบุคลากร...</p>
      </div>
    );
  }

  // แยกระดับผู้บริหารฝ่าย (ผู้อำนวยการ / รองผู้อำนวยการ / หัวหน้าฝ่าย) กับสมาชิก
  const heads = users.filter(u => 
    String(u.role).startsWith("deputy") || 
    String(u.role) === "director" ||
    (u.position && (u.position.includes("ผู้อำนวยการ") || u.position.includes("หัวหน้าฝ่าย")))
  );
  
  const members = users.filter(u => !heads.includes(u));

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const UserCard = ({ item, isHead = false }: { item: UserItem; isHead?: boolean }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -10 }}
      className={`group relative h-full w-full mx-auto ${isHead ? 'max-w-md' : ''}`}
    >
      <div className={`relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-lg transition-all duration-300 hover:border-amber-200 hover:shadow-xl dark:border-neutral-900/60 dark:bg-neutral-900/65 dark:hover:border-amber-950/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]`}>
        
        {/* Image Frame */}
        <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-800 ${isHead ? 'h-[320px]' : 'h-[240px]'}`}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="w-16 h-16 text-slate-300 dark:text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="relative p-6 text-center">
          {/* Floating Icon */}
          <div className="absolute -top-8 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-50 shadow-md dark:border-neutral-900 dark:bg-neutral-800 transition-colors group-hover:border-amber-100 dark:group-hover:border-amber-900/50">
            {isHead ? (
              <Star className="w-5 h-5 text-amber-500" />
            ) : (
              <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            )}
          </div>

          <div className="mt-6 flex flex-col h-full">
            <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 leading-tight transition-colors">
              {item.name}
            </h3>
            <p className="mt-1 text-sm font-black text-amber-600 dark:text-amber-400">
              {item.position || "บุคลากร"}
            </p>

            <div className="mx-auto mt-4 mb-4 h-0.5 w-12 rounded-full bg-slate-200 group-hover:bg-amber-400 dark:bg-neutral-800 transition-colors" />

            {/* Affiliation / Section */}
            {item.faction && (
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-neutral-800 text-xs rounded-full text-slate-600 dark:text-slate-400 mb-3 mx-auto border border-slate-200 dark:border-neutral-700">
                {item.faction}
              </span>
            )}

            {/* Contact Info */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-neutral-800 text-left text-xs space-y-2 text-slate-600 dark:text-slate-400">
              {item.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold">โทร:</span>{" "}
                  <a href={`tel:${item.phone}`} className="hover:underline text-slate-500 dark:text-slate-400">
                    {item.phone}
                  </a>
                </p>
              )}
              {item.email && (
                <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold">อีเมล:</span>{" "}
                  <span className="truncate">{item.email}</span>
                </p>
              )}
              {item.lineId && (
                <p className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold">Line:</span> <span>{item.lineId}</span>
                </p>
              )}
            </div>

            {/* Profile Button */}
            <div className="mt-5">
              <Link href={`/dashboard/profile/${String(item._id)}`} className="block w-full">
                <button className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-amber-200/50 dark:border-amber-900/30">
                  <UserOutlined />
                  ดูโปรไฟล์
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="font-sans text-slate-800 dark:text-slate-200 py-10">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
            บุคลากร<span className="text-[#DAA520]">{departmentNameTh}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {title}
          </p>
        </div>

        {users.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-slate-300 dark:border-zinc-700 mx-8 rounded-2xl bg-slate-50 dark:bg-zinc-800/30 text-center">
            <p className="text-slate-500 dark:text-zinc-400 font-medium">
              ยังไม่มีข้อมูลบุคลากรใน {departmentNameTh}
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {/* Heads Section */}
            {heads.length > 0 && (
              <div className="mb-16">
                <div className="flex justify-center flex-wrap gap-8">
                  {heads.map((user) => (
                    <div key={user._id} className="w-full sm:w-[320px]">
                      <UserCard item={user} isHead={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider if both exist */}
            {heads.length > 0 && members.length > 0 && (
              <div className="relative mb-12 max-w-4xl mx-auto">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200/80 dark:border-neutral-800/80"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-50 dark:bg-neutral-950 px-6 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 backdrop-blur-md rounded-full">
                    เจ้าหน้าที่และบุคลากร
                  </span>
                </div>
              </div>
            )}

            {/* Members Section */}
            {members.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
                {members.map((user) => (
                  <UserCard key={user._id} item={user} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
