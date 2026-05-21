"use client";

import React, { useState, useEffect } from "react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { TeamOutlined } from "@ant-design/icons";
import { Scale, GraduationCap, Briefcase, Users2, Landmark } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";

interface StaffItem {
  title: string;
  position?: string;
  department?: string;
  faction?: string;
  description?: string;
  img: string;
}

// --- 1. Person Card (Director & Deputy) ---
const LeaderCard = ({
  img,
  name,
  position,
  isDirector = false,
  colorClass = "bg-blue-500",
}: {
  img: string;
  name: string;
  position: string;
  isDirector?: boolean;
  colorClass?: string;
}) => {
  return (
    <div className={`relative flex flex-col items-center ${isDirector ? "z-20 scale-110" : "z-10"}`}>
      <div className={`relative w-64 overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900 
        ${isDirector ? "border-2 border-yellow-400" : "border border-slate-200 dark:border-zinc-800"}`}
      >
        <div className={`h-2 w-full ${isDirector ? "bg-yellow-400" : colorClass}`}></div>
        <div className="p-4 text-center">
          <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-full border-4 border-slate-50 shadow-sm dark:border-zinc-800">
            <Image
              src={img}
              alt={name}
              className="h-full w-full object-cover"
              removeWrapper
            />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {name}
          </h3>
          <p className={`text-sm font-medium ${isDirector ? "text-yellow-600" : "text-slate-500"} dark:text-slate-400`}>
            {position}
          </p>
        </div>
      </div>
      <div className="absolute -bottom-6 left-1/2 h-6 w-0.5 bg-slate-300 dark:bg-zinc-700"></div>
    </div>
  );
};

// --- 2. Staff Card (Horizontal) ---
const StaffCard = ({
  img,
  name,
  position,
  details,
}: {
  img: string;
  name: string;
  position?: string;
  details?: string[];
}) => {
  return (
    <div className="relative flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={img}
          alt={name}
          className="h-full w-full object-cover"
          removeWrapper
        />
      </div>
      <div className="flex flex-col text-left">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
          {name}
        </h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {position}
        </p>
        {details && (
          <p className="text-[10px] text-slate-400 line-clamp-1">
            {details.join(", ")}
          </p>
        )}
      </div>
      <div className="absolute -left-6 top-1/2 h-0.5 w-6 bg-slate-300 dark:bg-zinc-700"></div>
    </div>
  );
};

// --- 3. Department Section ---
const DepartmentColumn = ({
  title,
  head,
  colorClass,
  onClick,
  isActive,
}: {
  title: string;
  head: { name: string; img: string; position: string };
  colorClass: string;
  onClick: () => void;
  isActive: boolean;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-8 w-0.5 bg-slate-300 dark:bg-zinc-700"></div>
      <div 
        onClick={onClick}
        className={`cursor-pointer transition-all duration-300 ${isActive ? "ring-4 ring-amber-500/30 scale-105" : "hover:scale-102"}`}
      >
        <LeaderCard
          img={head.img}
          name={head.name}
          position={head.position}
          colorClass={colorClass}
        />
      </div>
      <button 
        onClick={onClick}
        className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          isActive 
            ? "bg-slate-800 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-md" 
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:text-slate-300 dark:border-zinc-800"
        }`}
      >
        ดูข้อมูลฝ่ายงาน →
      </button>
    </div>
  );
};

export default function AdministrativeStructure() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resource" | "strategy" | "student" | "academic">("resource");
  
  const [director, setDirector] = useState<any>(null);
  const [deputyResource, setDeputyResource] = useState<any>(null);
  const [deputyStrategy, setDeputyStrategy] = useState<any>(null);
  const [deputyStudent, setDeputyStudent] = useState<any>(null);
  const [deputyAcademic, setDeputyAcademic] = useState<any>(null);

  const [resourceHeads, setResourceHeads] = useState<StaffItem[]>([]);
  const [resourceOfficers, setResourceOfficers] = useState<StaffItem[]>([]);
  
  const [strategyHeads, setStrategyHeads] = useState<StaffItem[]>([]);
  const [strategyOfficers, setStrategyOfficers] = useState<StaffItem[]>([]);
  
  const [studentHeads, setStudentHeads] = useState<StaffItem[]>([]);
  const [studentOfficers, setStudentOfficers] = useState<StaffItem[]>([]);
  
  const [academicHeads, setAcademicHeads] = useState<StaffItem[]>([]);
  const [academicOfficers, setAcademicOfficers] = useState<StaffItem[]>([]);
  const [academicDepts, setAcademicDepts] = useState<StaffItem[]>([]);
  
  const [committee, setCommittee] = useState<StaffItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const users = data.users || [];

          const dir = users.find((u: any) => u.role === "director");
          const depRes = users.find((u: any) => u.role === "deputy_resource");
          const depStrat = users.find((u: any) => u.role === "deputy_strategy");
          const depStu = users.find((u: any) => u.role === "deputy_student_affairs");
          const depAcad = users.find((u: any) => u.role === "deputy_academic");

          setDirector(dir);
          setDeputyResource(depRes);
          setDeputyStrategy(depStrat);
          setDeputyStudent(depStu);
          setDeputyAcademic(depAcad);

          const normalizeName = (name: string) => {
            if (!name) return "";
            let clean = name.replace(/\s+/g, "");
            const prefixes = ["นางสาว", "นาย", "นาง", "ดร."];
            for (const prefix of prefixes) {
              if (clean.startsWith(prefix)) {
                clean = clean.substring(prefix.length);
                break;
              }
            }
            return clean;
          };

          const isPlaceholderImg = (path: string) => {
            if (!path) return true;
            const p = path.toLowerCase();
            return p.includes("error") || p.includes("placeholder") || p.includes("default") || p === "";
          };

          const getValidImg = (dbImg: string, fallbackImg: string) => {
            return !isPlaceholderImg(dbImg) ? dbImg : fallbackImg;
          };

          const dbStaff = users.map((u: any) => ({
            title: u.name || "ไม่ระบุชื่อ",
            position: u.position || u.role || "",
            department: u.department || "",
            faction: u.faction || "",
            description: u.description || "",
            img: getValidImg(u.image || u.img, "/images/error.webp"),
            role: u.role,
            respWorkHead: u.respWorkHead || "",
            respDeptHead: u.respDeptHead || "",
          }));

          const isResourceFaction = (u: any) => {
            const text = `${u.faction || ""} ${u.position || ""} ${u.respWorkHead || ""} ${u.department || ""} ${u.role || ""}`.toLowerCase();
            return text.includes("บริหารทรัพยากร") ||
                   text.includes("บริหารงานทั่วไป") || 
                   text.includes("บริหารทั่วไป") ||
                   text.includes("บุคลากร") || 
                   text.includes("การเงิน") || 
                   text.includes("บัญชี") || 
                   text.includes("อาคารสถานที่") || 
                   text.includes("พัสดุ") || 
                   text.includes("ทะเบียน") ||
                   text.includes("พนักงานขับรถ") ||
                   text.includes("เจ้าหน้าที่/ฝ่ายบริหารทรัพยากร") ||
                   u.role === "deputy_resource";
          };

          const isStrategyFaction = (u: any) => {
            const text = `${u.faction || ""} ${u.position || ""} ${u.respWorkHead || ""} ${u.department || ""} ${u.role || ""}`.toLowerCase();
            return text.includes("แผนงานและความร่วมมือ") ||
                   text.includes("แผนงาน") || 
                   text.includes("โครงการ") || 
                   text.includes("ยุทธศาสตร์และแผนงาน") || 
                   text.includes("แผนงานความร่วมมือ") ||
                   text.includes("ศูนย์ข้อมูลสารสนเทศ") || 
                   text.includes("พัสดุ") || 
                   text.includes("ความร่วมมือ") || 
                   text.includes("ประกันคุณภาพ") || 
                   text.includes("งานประกันคุณภาพการศึกษา") || 
                   text.includes("วิจัย") || 
                   text.includes("ความร่วมมือภายนอก") || 
                   text.includes("ความร่วมมือและพัฒนานวัตกรรม") ||
                   text.includes("งบประมาณ") ||
                   text.includes("บัญชี") ||
                   text.includes("รองผู้อำนวยการ/ฝ่ายแผนงานและความร่วมมือ") ||
                   u.role === "deputy_strategy";
          };

          const isStudentFaction = (u: any) => {
            const text = `${u.faction || ""} ${u.position || ""} ${u.respWorkHead || ""} ${u.department || ""} ${u.role || ""}`.toLowerCase();
            return text.includes("พัฒนากิจการนักเรียนนักศึกษา") ||
                   text.includes("พัฒนานักเรียน") || 
                   text.includes("งานกิจกรรมนักเรียนนักศึกษา") || 
                   text.includes("งานนักศึกษา") || 
                   text.includes("งานกิจกรรม") || 
                   text.includes("แนะแนว") || 
                   text.includes("ปกครอง") || 
                   text.includes("กิจกรรมนักเรียนนักศึกษา") || 
                   text.includes("งานแนะแนวอาชีพ") ||
                   text.includes("งานกิจกรรมนักเรียนนักศึกษาและพัฒนานักศึกษา") ||
                   text.includes("รองผู้อำนวยการ/ฝ่ายพัฒนากิจการนักเรียนนักศึกษา") ||
                   u.role === "deputy_student_affairs";
          };

          const isAcademicFaction = (u: any) => {
            const text = `${u.faction || ""} ${u.position || ""} ${u.respWorkHead || ""} ${u.respDeptHead || ""} ${u.department || ""} ${u.role || ""}`.toLowerCase();
            return text.includes("วิชาการ") ||
                   text.includes("หลักสูตร") || 
                   text.includes("เรียนการสอน") || 
                   text.includes("วัดผล") || 
                   text.includes("ประเมินผล") || 
                   text.includes("วิทยบริการ") || 
                   text.includes("ห้องสมุด") || 
                   text.includes("ทวิภาคี") ||
                   text.includes("แผนกวิชา") ||
                   text.includes("ช่างยนต์") ||
                   text.includes("ช่างกล") ||
                   text.includes("ช่างเชื่อม") ||
                   text.includes("ช่างไฟฟ้า") ||
                   text.includes("อิเล็ก") ||
                   text.includes("เทคนิคพื้นฐาน") ||
                   text.includes("ก่อสร้าง") ||
                   text.includes("การตลาด") ||
                   text.includes("การโรงแรม") ||
                   text.includes("บัญชี") ||
                   text.includes("คอมพิวเตอร์") ||
                   text.includes("สามัญสัมพันธ์") ||
                   u.role === "deputy_academic";
          };

          const getGroupedStaff = (factionFilter: (u: any) => boolean) => {
            const factionUsers = dbStaff.filter((u: any) => {
              const name = u.title;
              const isExec = u.role === "director" || String(u.role).startsWith("deputy") ||
                             normalizeName(name) === normalizeName("นางสาวทักษิณา ชมจันทร์") || 
                             normalizeName(name) === normalizeName("นางสาววิภาวรรณ สีแดด") || 
                             normalizeName(name) === normalizeName("นายสมศักดิ์ จันทานิตย์") || 
                             normalizeName(name) === normalizeName("นายอาทร ศรีมะณี") || 
                             normalizeName(name) === normalizeName("นางสาวภวิกา โพธิ์ขาว");
              return factionFilter(u) && !isExec;
            });

            const heads = factionUsers.filter((item: any) => 
              (item.position && (item.position.includes("หัวหน้า") || item.position.includes("รองหัวหน้า"))) ||
              (item.faction && (item.faction.includes("หัวหน้า") || item.faction.includes("รองหัวหน้า"))) ||
              (item.description && (item.description.includes("หัวหน้า") || item.description.includes("รองหัวหน้า"))) ||
              (item.respWorkHead && item.respWorkHead !== "") ||
              (item.respDeptHead && item.respDeptHead !== "")
            );

            const officers = factionUsers.filter((item: any) => 
              !heads.some((h: any) => normalizeName(h.title) === normalizeName(item.title)) &&
              !item.position?.includes("แผนกวิชา") && 
              !item.faction?.includes("แผนกวิชา") &&
              !item.department?.includes("ช่าง") &&
              !item.department?.includes("บัญชี") &&
              !item.department?.includes("ตลาด") &&
              !item.department?.includes("โรงแรม") &&
              !item.department?.includes("คอมพิวเตอร์") &&
              !item.department?.includes("สามัญสัมพันธ์")
            );

            const depts = factionUsers.filter((item: any) => 
              !heads.some((h: any) => normalizeName(h.title) === normalizeName(item.title)) &&
              !officers.some((o: any) => normalizeName(o.title) === normalizeName(item.title))
            );

            return { heads, officers, depts };
          };

          const resClassified = getGroupedStaff(isResourceFaction);
          setResourceHeads(resClassified.heads);
          setResourceOfficers(resClassified.officers);

          const stratClassified = getGroupedStaff(isStrategyFaction);
          setStrategyHeads(stratClassified.heads);
          setStrategyOfficers(stratClassified.officers);

          const studentClassified = getGroupedStaff(isStudentFaction);
          setStudentHeads(studentClassified.heads);
          setStudentOfficers(studentClassified.officers);

          const acadClassified = getGroupedStaff(isAcademicFaction);
          setAcademicHeads(acadClassified.heads);
          setAcademicOfficers(acadClassified.officers);
          setAcademicDepts(acadClassified.depts);

          // คณะกรรมการบริหารสถานศึกษา
          const commStaff = dbStaff.filter((u: any) => 
            u.faction === "คณะกรรมการบริหารสถานศึกษา" || 
            u.role === "committee" || 
            u.position?.includes("คณะกรรมการ")
          );
          setCommittee(commStaff);
        }
      } catch (error) {
        console.error("Failed to fetch administrative structure data", error);
        setResourceHeads([]);
        setResourceOfficers([]);
        setStrategyHeads([]);
        setStrategyOfficers([]);
        setStudentHeads([]);
        setStudentOfficers([]);
        setAcademicHeads([]);
        setAcademicOfficers([]);
        setAcademicDepts([]);
        setCommittee([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[500px]">
        <LoadingOutlined className="text-4xl text-amber-500 mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดโครงสร้างองค์กร...</p>
      </div>
    );
  }

  const currentFactionInfo = () => {
    switch (activeTab) {
      case "resource":
        return {
          title: "ฝ่ายบริหารทรัพยากร",
          deputy: deputyResource,
          fallbackName: "นางสาวภวิกา โพธิ์ขาว",
          fallbackImg: "/images/personal/ภวิกา.webp",
          heads: resourceHeads,
          officers: resourceOfficers,
          depts: [],
          color: "from-emerald-500 to-teal-600",
          icon: <Landmark className="w-5 h-5 text-white" />
        };
      case "strategy":
        return {
          title: "ฝ่ายแผนงานและความร่วมมือ",
          deputy: deputyStrategy,
          fallbackName: "นายสมศักดิ์ จันทานิตย์",
          fallbackImg: "/images/personal/สมศักดิ์.webp",
          heads: strategyHeads,
          officers: strategyOfficers,
          depts: [],
          color: "from-blue-500 to-indigo-600",
          icon: <Scale className="w-5 h-5 text-white" />
        };
      case "student":
        return {
          title: "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา",
          deputy: deputyStudent,
          fallbackName: "นางสาววิภาวรรณ สีแดด",
          fallbackImg: "/images/personal/วิภาวรรณ.webp",
          heads: studentHeads,
          officers: studentOfficers,
          depts: [],
          color: "from-rose-500 to-pink-600",
          icon: <Users2 className="w-5 h-5 text-white" />
        };
      case "academic":
        return {
          title: "ฝ่ายวิชาการ",
          deputy: deputyAcademic,
          fallbackName: "นายอาทร ศรีมะณี",
          fallbackImg: "/images/personal/อาทร.webp",
          heads: academicHeads,
          officers: academicOfficers,
          depts: academicDepts,
          color: "from-amber-500 to-orange-600",
          icon: <GraduationCap className="w-5 h-5 text-white" />
        };
    }
  };

  const activeFaction = currentFactionInfo();

  return (
    <section className="max-w-[1600px] mx-auto overflow-x-hidden bg-slate-50 py-20 font-sans text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300">
            <TeamOutlined /> Organization Structure
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            โครงสร้าง
            <span className="bg-linear-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent ml-2">
              การแบ่งส่วนราชการ
            </span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            แผนผังโครงสร้างการบริหารงาน แสดงความเชื่อมโยงของแต่ละฝ่ายงานภายในวิทยาลัยเทคนิคกันทรลักษ์
          </p>
        </motion.div>

        <div className="flex flex-col items-center mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="relative z-10 mb-8"
          >
            <LeaderCard
              img={director?.image || "/images/personal/ผู้อำนวยการ.webp"}
              name={director?.name || "นางสาวทักษิณา ชมจันทร์"}
              position={director?.position || "ผู้อำนวยการสถานศึกษา"}
              isDirector={true}
            />
          </motion.div>

          <div className="relative mb-8 h-8 w-full max-w-6xl">
            <div className="absolute left-1/2 top-0 h-8 w-0.5 -translate-x-1/2 bg-slate-300 dark:bg-zinc-700"></div>
            <div className="absolute bottom-0 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-slate-300 dark:border-zinc-700"></div>
          </div>

          <div className="grid w-full max-w-[1600px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <DepartmentColumn
              title="ฝ่ายบริหารทรัพยากร"
              head={{
                name: deputyResource?.name || "นางสาวภวิกา โพธิ์ขาว",
                img: deputyResource?.image || "/images/personal/ภวิกา.webp",
                position: deputyResource?.position || "รองผู้อำนวยการฝ่ายบริหารทรัพยากร",
              }}
              colorClass="bg-emerald-500"
              onClick={() => setActiveTab("resource")}
              isActive={activeTab === "resource"}
            />

            <DepartmentColumn
              title="ฝ่ายแผนงานและความร่วมมือ"
              head={{
                name: deputyStrategy?.name || "นายสมศักดิ์ จันทานิตย์",
                img: deputyStrategy?.image || "/images/personal/สมศักดิ์.webp",
                position: deputyStrategy?.position || "รองผู้อำนวยการฝ่ายแผนงานและความร่วมมือ",
              }}
              colorClass="bg-blue-500"
              onClick={() => setActiveTab("strategy")}
              isActive={activeTab === "strategy"}
            />

            <DepartmentColumn
              title="ฝ่ายพัฒนากิจการนักเรียนนักศึกษา"
              head={{
                name: deputyStudent?.name || "นางสาววิภาวรรณ สีแดด",
                img: deputyStudent?.image || "/images/personal/วิภาวรรณ.webp",
                position: deputyStudent?.position || "รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียนนักศึกษา",
              }}
              colorClass="bg-rose-500"
              onClick={() => setActiveTab("student")}
              isActive={activeTab === "student"}
            />

            <DepartmentColumn
              title="ฝ่ายวิชาการ"
              head={{
                name: deputyAcademic?.name || "นายอาทร ศรีมะณี",
                img: deputyAcademic?.image || "/images/personal/อาทร.webp",
                position: deputyAcademic?.position || "รองผู้อำนวยการฝ่ายวิชาการ",
              }}
              colorClass="bg-amber-500"
              onClick={() => setActiveTab("academic")}
              isActive={activeTab === "academic"}
            />
          </div>
        </div>

        <div className="my-20 scroll-mt-24" id="division-details">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
              <span>รายละเอียดโครงสร้างภายใน</span>
              <span className={`inline-flex items-center justify-center p-2 rounded-xl bg-linear-to-r ${activeFaction.color} text-white shadow-sm`}>
                {activeFaction.icon}
              </span>
              <span className="text-amber-500">{activeFaction.title}</span>
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              การแบ่งงานย่อยภายใต้การดูแลของ {activeFaction.deputy?.name || activeFaction.fallbackName}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 lg:p-10 shadow-xs border border-slate-100 dark:border-zinc-800">
            <div className="lg:col-span-4 flex flex-col items-center text-center lg:border-r border-slate-100 dark:border-zinc-800 lg:pr-8">
              <div className="sticky top-24 flex flex-col items-center">
                <div className={`p-1.5 rounded-2xl bg-linear-to-br ${activeFaction.color} shadow-lg mb-6`}>
                  <div className="w-48 h-56 overflow-hidden rounded-xl bg-white dark:bg-zinc-800">
                    <img 
                      src={activeFaction.deputy?.image || activeFaction.fallbackImg} 
                      alt={activeFaction.deputy?.name || activeFaction.fallbackName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  {activeFaction.deputy?.name || activeFaction.fallbackName}
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold bg-linear-to-r ${activeFaction.color} text-white shadow-xs mb-4`}>
                  {activeFaction.deputy?.position || "รองผู้อำนวยการสถานศึกษา"}
                </span>
                <p className="text-sm text-slate-400 max-w-xs">
                  ดูแลและรับผิดชอบการดำเนินงานทั้งหมดของ{activeFaction.title} เพื่อบรรลุเป้าหมายของสถานศึกษา
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-10">
              {activeFaction.heads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="w-1.5 h-6 rounded-full bg-amber-500"></div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      หัวหน้างานและผู้ช่วยหัวหน้างาน (Heads of Internal Works)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeFaction.heads.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
                        <div className="w-14 h-14 overflow-hidden rounded-xl shrink-0 bg-slate-200">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {item.title}
                          </h5>
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mt-1">
                            {item.faction || item.position}
                          </span>
                          {item.department && (
                            <span className="text-[10px] text-slate-400 block">
                              แผนกวิชาหลัก: {item.department}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFaction.officers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="w-1.5 h-6 rounded-full bg-teal-500"></div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      เจ้าหน้าที่และผู้ปฏิบัติงานภายในฝ่าย (Support Staff & Officers)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeFaction.officers.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
                        <div className="w-14 h-14 overflow-hidden rounded-xl shrink-0 bg-slate-200">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {item.title}
                          </h5>
                          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 block mt-1">
                            {item.position || item.faction || "เจ้าหน้าที่"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFaction.depts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="w-1.5 h-6 rounded-full bg-blue-500"></div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      แผนกวิชาการเรียนการสอน (Teaching Departments)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeFaction.depts.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
                        <div className="w-14 h-14 overflow-hidden rounded-xl shrink-0 bg-slate-200">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {item.title}
                          </h5>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mt-1">
                            {item.position || "ครูประจำแผนก"}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            แผนกวิชา: {item.department}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-slate-200 pt-12 dark:border-zinc-800">
          <h2 className="mb-10 text-center text-2xl font-bold text-slate-700 dark:text-slate-300">
            คณะกรรมการบริหารสถานศึกษา
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {committee.map((item: StaffItem, i: number) => (
              <StaffCard
                key={i}
                img={item.img}
                name={item.title}
                position={item.position || item.faction}
                details={[item.description || ""]}
              />
            ))}
          </div>
        </div>

        <div className="mt-24 rounded-3xl bg-white p-8 shadow-xs dark:bg-zinc-900 md:p-12 border border-slate-100 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-50 dark:bg-amber-900/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-50 dark:bg-blue-900/10 blur-3xl"></div>
          
          <div className="relative z-10 text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
              <Scale className="h-4 w-4" /> บทบาทและอำนาจหน้าที่
            </div>
            <h2 className="text-3xl font-extrabold md:text-4xl text-slate-800 dark:text-white">
              หน้าที่และอำนาจของสถานศึกษา
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-linear-to-r from-amber-400 to-amber-600"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              ตามระเบียบสำนักงานคณะกรรมการการอาชีวศึกษา ว่าด้วยการบริหารสถานศึกษา พ.ศ. 2552 สถานศึกษามีหน้าที่และอำนาจในการดำเนินงานดังต่อไปนี้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:border-zinc-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">การจัดการศึกษาและการฝึกอบรม</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  จัดการอาชีวศึกษาและการฝึกอบรมวิชาชีพ ทั้งในระบบ นอกระบบ และระบบทวิภาคี เพื่อผลิตและพัฒนากำลังคนให้สอดคล้องกับความต้องการของตลาดแรงงานและการพัฒนาประเทศ
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:border-zinc-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">การบริหารจัดการภายใน</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  บริหารงานวิชาการ บริหารงบประมาณ บริหารงานบุคคล และบริการทั่วไปของสถานศึกษา ให้เป็นไปตามระเบียบและข้อบังคับ เพื่อให้เกิดประสิทธิภาพสูงสุด
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:border-zinc-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Users2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">การประสานความร่วมมือ</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  ประสานความร่วมมือกับชุมชน ท้องถิ่น สถานประกอบการ และหน่วยงานอื่นๆ เพื่อสนับสนุนการจัดการศึกษา การฝึกงานอาชีพ และการจัดหางานให้แก่ผู้สำเร็จการศึกษา
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:border-zinc-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">การปฏิบัติการตามกฎหมาย</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  ปฏิบัติหน้าที่อื่นตามที่กฎหมาย ระเบียบ หรือข้อบังคับกำหนดไว้ หรือตามที่คณะกรรมการการอาชีวศึกษา หรือกระทรวงศึกษาธิการมอบหมาย
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
