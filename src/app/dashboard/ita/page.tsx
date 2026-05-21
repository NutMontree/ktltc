"use client";

import { useState, useEffect, useRef } from "react";
// import { useSession } from "react-dom"; // Wait, next-auth uses next-auth/react
import { useSession as useNextAuthSession } from "next-auth/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Calendar,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { uploadFile } from "@/lib/upload";

// 37 OIT default list for 2568
const OIT_INDICATORS_2568 = [
  {
    code: "O1",
    title: "O1 โครงสร้าง",
    desc: "แสดงแผนผัง แสดงโครงสร้างการแบ่งส่วนราชการของสถานศึกษา",
  },
  { code: "O2", title: "O2 ข้อมูลผู้บริหาร", desc: "แสดงรายนามผู้บริหาร ตำแหน่ง และรูปภาพ" },
  {
    code: "O3",
    title: "O3 อำนาจหน้าที่",
    desc: "แสดงหน้าที่และอำนาจตามกฎหมายจัดตั้ง หรือกฎหมายอื่นที่เกี่ยวข้อง",
  },
  {
    code: "O4",
    title: "O4 แผนพัฒนาสถานศึกษา",
    desc: "แสดงแผนยุทธศาสตร์ แผนพัฒนา หรือแผนปฏิบัติการของสถานศึกษา",
  },
  {
    code: "O5",
    title: "O5 ข้อมูลการติดต่อ",
    desc: "แสดงข้อมูลการติดต่อ ที่อยู่ โทรศัพท์ และแผนที่ตั้ง",
  },
  {
    code: "O6",
    title: "O6 กฎหมายที่เกี่ยวข้อง",
    desc: "แสดงกฎหมาย พระราชบัญญัติ ระเบียบ ข้อบังคับที่เกี่ยวข้องกับการบริหารงาน",
  },
  {
    code: "O7",
    title: "O7 ข่าวประชาสัมพันธ์",
    desc: "แสดงข่าวประชาสัมพันธ์ กิจกรรม และความเคลื่อนไหวล่าสุด",
  },
  {
    code: "O8",
    title: "O8 Q&A ช่องทางสื่อสาร",
    desc: "ช่องทางสื่อสารสองทาง เช่น Web board, Messenger Live Chat",
  },
  {
    code: "O9",
    title: "O9 Social Network",
    desc: "แสดงช่องทางเครือข่ายสังคมออนไลน์ของวิทยาลัย เช่น Facebook, YouTube",
  },
  {
    code: "O10",
    title: "O10 แผนดำเนินงานประจำปี",
    desc: "แสดงแผนปฏิบัติราชการประจำปี และขั้นตอนดำเนินงานประจำปี",
  },
  {
    code: "O11",
    title: "O11 รายงานผลการดำเนินงานประจำปี",
    desc: "แสดงรายงานการประเมินตนเอง หรือผลการดำเนินงานในปีที่ผ่านมา",
  },
  {
    code: "O12",
    title: "O12 คู่มือการปฏิบัติงานของบุคลากร",
    desc: "คู่มือหรือมาตรฐานการปฏิบัติงานที่เจ้าหน้าที่ใช้ยึดถือปฏิบัติ",
  },
  {
    code: "O13",
    title: "O13 คู่มือการให้บริการประชาชน",
    desc: "คู่มือการให้บริการประชาชน ผู้ปกครอง หรือนักเรียนนักศึกษา",
  },
  {
    code: "O14",
    title: "O14 ข้อมูลเชิงสถิติการให้บริการ",
    desc: "สถิติผู้มาขอรับบริการ หรือสรุปผลการให้บริการรายภาคเรียน/ปี",
  },
  {
    code: "O15",
    title: "O15 สรุปผลความพึงพอใจการบริการ",
    desc: "รายงานผลการสำรวจความพึงพอใจต่อการให้บริการของสถานศึกษา",
  },
  {
    code: "O16",
    title: "O16 E-Service",
    desc: "ช่องทางการให้บริการผ่านระบบออนไลน์ เช่น ระบบรับสมัครนักเรียน หรือระบบส่งงาน",
  },
  {
    code: "O17",
    title: "O17 แผนการใช้จ่ายงบประมาณประจำปี",
    desc: "แสดงแผนการใช้จ่ายเงิน แผนงบประมาณของวิทยาลัย",
  },
  {
    code: "O18",
    title: "O18 ผลการใช้จ่ายงบประมาณประจำปี",
    desc: "รายงานการรับ-จ่ายเงิน หรือรายงานสรุปการเงินการใช้จ่ายงบประมาณ",
  },
  {
    code: "O19",
    title: "O19 แผนการจัดซื้อจัดจ้าง/จัดหาพัสดุ",
    desc: "แสดงแผนการจัดซื้อจัดจ้างประจำปีงบประมาณ",
  },
  {
    code: "O20",
    title: "O20 ประกาศจัดซื้อจัดจ้าง",
    desc: "ประกาศประกวดราคา หรือประกาศผลการจัดซื้อจัดจ้างตามระเบียบ",
  },
  {
    code: "O21",
    title: "O21 สรุปผลการจัดซื้อจัดจ้างรายเดือน",
    desc: "รายงาน สขร.1 หรือสรุปผลการจัดซื้อจัดจ้างในแต่ละเดือน",
  },
  {
    code: "O22",
    title: "O22 รายงานผลการจัดซื้อจัดจ้างประจำปี",
    desc: "รายงานผลการวิเคราะห์และสรุปผลการจัดซื้อจัดจ้างในปีงบประมาณที่ผ่านมา",
  },
  {
    code: "O23",
    title: "O23 นโยบายบริหารทรัพยากรบุคคล",
    desc: "นโยบายการจัดหา พัฒนา และรักษาบุคลากรของวิทยาลัย",
  },
  {
    code: "O24",
    title: "O24 หลักเกณฑ์การบริหารและพัฒนา",
    desc: "ระเบียบ ประกาศ หรือหลักเกณฑ์การประเมิน เลื่อนขั้น เลื่อนตำแหน่ง",
  },
  {
    code: "O25",
    title: "O25 รายงานผลการบริหารทรัพยากรบุคคล",
    desc: "รายงานสรุปผลการดำเนินงานด้านทรัพยากรบุคคลประจำปี",
  },
  {
    code: "O26",
    title: "O26 แนวปฏิบัติการจัดการเรื่องร้องเรียนทุจริต",
    desc: "คู่มือหรือแนวทางปฏิบัติการแก้ไขและจัดการเรื่องร้องเรียนเมื่อพบเห็นการทุจริต",
  },
  {
    code: "O27",
    title: "O27 ช่องทางแจ้งเรื่องร้องเรียนการทุจริต",
    desc: "ระบบรับเรื่องร้องเรียนออนไลน์ หรือแบบฟอร์มส่งข้อมูลลับ",
  },
  {
    code: "O28",
    title: "O28 ข้อมูลเชิงสถิติเรื่องร้องเรียนทุจริต",
    desc: "รายงานสรุปสถิติจำนวนเรื่องร้องเรียนและผลการดำเนินการแต่ละข้อ",
  },
  {
    code: "O29",
    title: "O29 การเปิดโอกาสให้เกิดการมีส่วนร่วม",
    desc: "ภาพถ่าย หรือกิจกรรมที่เปิดโอกาสให้บุคคลภายนอกร่วมวางแผน/ตัดสินใจ",
  },
  {
    code: "O30",
    title: "O30 นโยบาย No Gift Policy",
    desc: "ประกาศนโยบายไม่รับของขวัญและของกำนัลทุกชนิดจากการปฏิบัติหน้าที่",
  },
  {
    code: "O31",
    title: "O31 การมีส่วนร่วมของผู้บริหาร",
    desc: "กิจกรรมที่ผู้บริหารสูงสุดร่วมประกาศนโยบาย No Gift Policy หรือสร้างจริยธรรม",
  },
  {
    code: "O32",
    title: "O32 การประเมินความเสี่ยงการทุจริต",
    desc: "รายงานวิเคราะห์และประเมินผลการดำเนินการเพื่อควบคุมหรือลดความเสี่ยงทุจริต",
  },
  {
    code: "O33",
    title: "O33 การเสริมสร้างวัฒนธรรมองค์กร",
    desc: "โครงการ กิจกรรม หรืองานอบรมสร้างจิตสำนึกสุจริตให้บุคลากรและนักเรียน",
  },
  {
    code: "O34",
    title: "O34 แผนปฏิบัติการป้องกันการทุจริต",
    desc: "แผนงานป้องกันและส่งเสริมคุณธรรมจริยธรรมประจำปี",
  },
  {
    code: "O35",
    title: "O35 รายงานผลการป้องกันการทุจริตประจำปี",
    desc: "สรุปผลการดำเนินงานโครงการในแผนปฏิบัติการทุจริตที่ทำสำเร็จ",
  },
  {
    code: "O36",
    title: "O36 มาตรการส่งเสริมความโปร่งใสในองค์กร",
    desc: "ประกาศระเบียบ หรือมาตรการเชิงบวกที่วิทยาลัยใช้กำกับการทำงาน",
  },
  {
    code: "O37",
    title: "O37 ผลการนำมาตรการไปปฏิบัติ",
    desc: "รายงานสรุปการตรวจสอบ การเปิดเผยข้อมูล หรือผลการบังคับใช้ข้อตกลงธรรมาภิบาล",
  },
];

// 23 OIT default list for 2569
const OIT_INDICATORS_2569 = [
  {
    code: "O1",
    title: "O1 โครงสร้างและอำนาจหน้าที่",
    desc: "แสดงแผนผังโครงสร้างการแบ่งส่วนราชการ หน้าที่และอำนาจของสถานศึกษาตามที่กฎหมายกำหนด",
    responsible: "งานบุคลากร/งานบริหารทั่วไป",
  },
  {
    code: "O2",
    title: "O2 ข้อมูลผู้บริหารสถานศึกษา",
    desc: "แสดงข้อมูลของผู้อำนวยการและรองผู้อำนวยการสถานศึกษา เช่น ชื่อ-นามสกุล ตำแหน่ง รูปถ่าย และช่องทางการติดต่อ",
    responsible: "งานประชาสัมพันธ์/งานศูนย์ข้อมูล",
  },
  {
    code: "O3",
    title: "O3 แผนพัฒนาสถานศึกษา",
    desc: "แสดงแผนพัฒนาสถานศึกษาที่มีระยะมากกว่า 1 ปี ครอบคลุมยุทธศาสตร์ กลยุทธ์ เป้าหมาย และตัวชี้วัด",
    responsible: "งานวางแผนและงบประมาณ",
  },
  {
    code: "O4",
    title: "O4 ข้อมูลการติดต่อ",
    desc: "แสดงข้อมูลการติดต่อ ที่อยู่ เบอร์โทรศัพท์ อีเมล แผนที่ และช่องทางเครือข่ายสังคมออนไลน์",
    responsible: "งานศูนย์ข้อมูล",
  },
  {
    code: "O5",
    title: "O5 กฎหมายที่เกี่ยวข้อง",
    desc: "แสดงกฎหมายที่เกี่ยวข้องกับการดำเนินงานหรือปฏิบัติงานของสถานศึกษา ไม่น้อยกว่า 5 ฉบับ",
    responsible: "งานบริหารทั่วไป/งานบุคลากร",
  },
  {
    code: "O6",
    title: "O6 แผนปฏิบัติราชการและแผนการใช้จ่ายงบประมาณประจำปี",
    desc: "แสดงแผนปฏิบัติราชการประจำปี งบประมาณที่ได้รับ และรายละเอียดโครงการประจำปีงบประมาณปัจจุบัน",
    responsible: "งานวางแผนและงบประมาณ",
  },
  {
    code: "O7",
    title: "O7 รายงานผลการดำเนินงานของสถานศึกษาประจำปี",
    desc: "แสดงสรุปผลการดำเนินงานโครงการ การใช้จ่ายงบประมาณ และปัญหาอุปสรรคย้อนหลัง 1 ปีงบประมาณ",
    responsible: "งานวางแผนและงบประมาณ/ผู้รับผิดชอบโครงการ",
  },
  {
    code: "O8",
    title: "O8 รายงานผลการประเมินตนเอง (SAR) ของสถานศึกษาประจำปี",
    desc: "แสดงรายงานผลการประเมินตนเองคุณภาพภายในสถานศึกษา ย้อนหลัง 1 ปีการศึกษา",
    responsible: "งานประกันคุณภาพ",
  },
  {
    code: "O9",
    title: "O9 ข่าวประชาสัมพันธ์",
    desc: "แสดงข้อมูลข่าวสารและกิจกรรมที่เกิดขึ้นในสถานศึกษาในปีงบประมาณปัจจุบัน",
    responsible: "งานศูนย์ข้อมูล/งานประชาสัมพันธ์",
  },
  {
    code: "O10",
    title: "O10 ประกาศจัดซื้อจัดจ้างหรือการจัดหาพัสดุ",
    desc: "แสดงประกาศการจัดซื้อจัดจ้างตามระเบียบ พ.ร.บ. จัดซื้อจัดจ้างฯ พ.ศ. 2560 ในปีงบประมาณปัจจุบัน",
    responsible: "งานพัสดุ",
  },
  {
    code: "O11",
    title: "O11 รายงานผลการจัดซื้อจัดจ้างหรือการจัดหาพัสดุประจำปี",
    desc: "แสดงสรุปผลการจัดซื้อจัดจ้างประจำปี และรายงานผลการจัดซื้อจัดจ้างย้อนหลัง 1 ปีงบประมาณ",
    responsible: "งานพัสดุ",
  },
  {
    code: "O12",
    title: "O12 คู่มือหรือขั้นตอนการปฏิบัติงานภายในสถานศึกษา",
    desc: "แสดงคู่มือขั้นตอนการปฏิบัติงานภายในตามโครงสร้างสถานศึกษาอย่างน้อยฝ่ายละ 1 เล่ม (รวม 4 เล่ม)",
    responsible: "งานประกันคุณภาพ",
  },
  {
    code: "O13",
    title: "O13 คู่มือหรือขั้นตอนการให้บริการ",
    desc: "แสดงคู่มือหรือขั้นตอนการให้บริการประชาชน เช่น คู่มือนักเรียนนักศึกษา คู่มือการลงทะเบียน",
    responsible: "งานทะเบียน/งานทวิภาคี/งานแนะแนว",
  },
  {
    code: "O14",
    title: "O14 E-Service",
    desc: "แสดงช่องทางบริการธุรกรรมออนไลน์ที่ผู้รับบริการไม่จำเป็นต้องเดินทางมา เช่น ระบบ ศธ.02",
    responsible: "งานศูนย์ข้อมูล",
  },
  {
    code: "O15",
    title: "O15 ข้อมูลเชิงสถิติและความพึงพอใจต่อการให้บริการ",
    desc: "แสดงข้อมูลสถิติและความพึงพอใจการให้บริการ อย่างน้อย 3 โครงการย้อนหลัง 1 ปีงบประมาณ",
    responsible: "งานวิจัยและนวัตกรรม",
  },
  {
    code: "O16",
    title: "O16 การบริหารและพัฒนาทรัพยากรบุคคล",
    desc: "แสดงหลักเกณฑ์การสรรหา การพัฒนา การประเมินผล และการสร้างขวัญกำลังใจแก่บุคลากรที่ยังใช้บังคับ",
    responsible: "งานบุคลากร",
  },
  {
    code: "O17",
    title: "O17 ประมวลจริยธรรมและการขับเคลื่อนจริยธรรมของข้าราชการครูและบุคลากรทางการศึกษา",
    desc: "แสดงแนวปฏิบัติ Do's & Don't และกิจกรรมส่งเสริมจริยธรรมของครูและบุคลากรอาชีวศึกษา",
    responsible: "งานบริหารทั่วไป",
  },
  {
    code: "O18",
    title: "O18 แนวปฏิบัติการจัดการเรื่องร้องเรียนการทุจริตและประพฤติมิชอบ",
    desc: "แสดงคู่มือขั้นตอนการดำเนินการต่อเรื่องร้องเรียนที่เกี่ยวข้องกับการทุจริตและประพฤติมิชอบของเจ้าหน้าที่",
    responsible: "งานบริหารทั่วไป",
  },
  {
    code: "O19",
    title: "O19 ข้อมูลเชิงสถิติเรื่องร้องเรียนการทุจริตและประพฤติมิชอบ",
    desc: "แสดงสถิติจำนวนเรื่องร้องเรียนทุจริต การดำเนินการ และความก้าวหน้าแบบรายเดือน/ไตรมาส/6 เดือน",
    responsible: "งานบริหารทั่วไป",
  },
  {
    code: "O20",
    title: "O20 การขับเคลื่อนนโยบาย No Gift Policy",
    desc: "แสดงการประกาศเจตนารมณ์ No Gift Policy และการสร้างวัฒนธรรมองค์กรในการปฏิบัติหน้าที่",
    responsible: "ผู้บริหารสูงสุด/งานบริหารทั่วไป",
  },
  {
    code: "O21",
    title: "O21 การประเมินความเสี่ยงการทุจริตประจำปี",
    desc: "แสดงรายงานการประเมินความเสี่ยงเพื่อควบคุมหรือลดความเสี่ยงทุจริต ประจำปีงบประมาณ พ.ศ. 2569",
    responsible: "งานบริหารทั่วไป",
  },
  {
    code: "O22",
    title: "O22 แผนปฏิบัติการป้องกันการทุจริตประจำปี",
    desc: "แสดงแผนงานป้องกันและส่งเสริมคุณธรรมจริยธรรม ประจำปีงบประมาณ พ.ศ. 2569",
    responsible: "งานวางแผนและงบประมาณ",
  },
  {
    code: "O23",
    title: "O23 มาตรการส่งเสริมคุณธรรมและความโปร่งใสภายในสถานศึกษา",
    desc: "แสดงโครงการ/กิจกรรมส่งเสริมความซื่อสัตย์สุจริตและความโปร่งใส หรือการแต่งตั้งคณะกรรมการ ITA ในปีงบประมาณปัจจุบัน",
    responsible: "ผู้เกี่ยวข้องที่ได้รับมอบหมาย",
  },
];

export default function ItaDashboard() {
  const { data: session, status } = useNextAuthSession();
  const [selectedYear, setSelectedYear] = useState("2569");
  const [selectedOit, setSelectedOit] = useState("O1");

  const activeIndicators = selectedYear === "2568" ? OIT_INDICATORS_2568 : OIT_INDICATORS_2569;
  const activeOitMeta = activeIndicators.find((ind) => ind.code === selectedOit) as any;

  // Dynamic years list states
  const [years, setYears] = useState<string[]>(["2569"]);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [isAddingYear, setIsAddingYear] = useState(false);

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/ita/years");
      if (res.ok) {
        const data = await res.json();
        if (data.years && data.years.length > 0) {
          // Filter out year 2568 so it cannot be managed or modified from the admin dashboard
          setYears(data.years.filter((y: string) => y !== "2568"));
        }
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || !/^\d{4}$/.test(newYearInput)) {
      alert("กรุณากรอกปีงบประมาณเป็นตัวเลข 4 หลัก");
      return;
    }
    setIsAddingYear(true);
    try {
      const res = await fetch("/api/ita/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: newYearInput }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowAddYearModal(false);
        setNewYearInput("");
        await fetchYears();
        setSelectedYear(newYearInput);
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsAddingYear(false);
    }
  };

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<{ name: string; url: string }[]>([]);

  // Upload states & refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage(null);

      const result = await uploadFile(file, "ita_uploads", (percent) => {
        setUploadProgress(percent);
      });

      if (result.secure_url) {
        const nextIndex = links.length + 1;
        const cleanName = `${nextIndex}. ${file.name}`;
        setLinks([...links, { name: cleanName, url: result.secure_url }]);
        setMessage({
          type: "success",
          text: `อัปโหลดไฟล์ "${file.name}" เรียบร้อยและเพิ่มลงในรายการลิงก์แล้ว!`,
        });
      } else {
        setMessage({ type: "error", text: "อัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่อีกครั้ง" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์" });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // System states
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch all database records for the selected year
  const fetchItaData = async (year: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/ita?year=${year}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setDbItems(data);
        updateFormFields(selectedOit, data, year);
      }
    } catch (error) {
      console.error("Error fetching ITA items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when year changes
  useEffect(() => {
    if (status === "authenticated") {
      setSelectedOit("O1");
      fetchItaData(selectedYear);
    }
  }, [selectedYear, status]);

  // Update form fields based on the selected OIT code and database items
  const updateFormFields = (oitCode: string, itemsList: any[], year: string = selectedYear) => {
    const existing = itemsList.find((item) => item.oitCode === oitCode);
    const activeIndicators = year === "2568" ? OIT_INDICATORS_2568 : OIT_INDICATORS_2569;
    const defaultMeta = activeIndicators.find((ind) => ind.code === oitCode);

    if (existing) {
      setTitle(existing.title || defaultMeta?.title || "");
      setDescription(existing.description || defaultMeta?.desc || "");
      setLinks(existing.links || []);
    } else {
      // Pre-populate with official OIT structure defaults
      setTitle(defaultMeta?.title || "");
      setDescription(defaultMeta?.desc || "");
      setLinks([]);
    }
  };

  // Update form fields when active OIT selection changes
  const handleOitChange = (code: string) => {
    setSelectedOit(code);
    updateFormFields(code, dbItems, selectedYear);
    setMessage(null);
  };

  // Add a new link input field
  const handleAddLink = () => {
    const nextIndex = links.length + 1;
    setLinks([...links, { name: `${nextIndex}. ลิงก์ข้อมูลเพิ่มเติม`, url: "" }]);
  };

  // Remove a specific link
  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, idx) => idx !== index));
  };

  // Update specific link attribute
  const handleLinkChange = (index: number, field: "name" | "url", val: string) => {
    const updated = links.map((link, idx) => {
      if (idx === index) {
        return { ...link, [field]: val };
      }
      return link;
    });
    setLinks(updated);
  };

  // Submit form data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: "error", text: "กรุณาระบุชื่อหัวข้อ OIT" });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      // Clean empty links
      const cleanLinks = links.filter((l) => l.name.trim() && l.url.trim());

      const res = await fetch("/api/ita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          oitCode: selectedOit,
          title,
          description,
          links: cleanLinks,
        }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `บันทึกข้อมูลดัชนี ${selectedOit} สำเร็จเรียบร้อยแล้ว!`,
        });
        // Refresh local data list
        fetchItaData(selectedYear);
      } else {
        const errData = await res.json();
        setMessage({ type: "error", text: errData.error || "เกิดข้อผิดพลาดในการบันทึก" });
      }
    } catch (error) {
      console.error("Save Error:", error);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้" });
    } finally {
      setIsSaving(false);
    }
  };

  // Auth checking
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Access Panel...
        </p>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role?.toLowerCase();
  const hasAccess = ["super_admin", "admin", "editor", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "teacher", "staff"].includes(userRole);

  if (status === "unauthenticated" || !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            การเข้าถึงถูกจำกัด
          </h2>
          <p className="text-zinc-500 mt-2 font-bold max-w-md">
            เฉพาะผู้ดูแลระบบและผู้แก้ไขเนื้อหา (Super Admin / Admin / Editor)
            เท่านั้นที่มีสิทธิ์เข้าจัดการเมนูนี้
          </p>
        </div>
        <Link href="/dashboard">
          <button className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer">
            กลับหน้า Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-600/10" />
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12 relative">
        <DashboardHeader user={user} />

        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <FileText className="text-blue-500" />
              จัดการข้อมูลการประเมินคุณธรรมและความโปร่งใส (OIT)
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-semibold text-sm">
              เพิ่ม แก้ไข และควบคุมลิงก์ตัวชี้วัดความโปร่งใสรายหัวข้อ O1 - O37
            </p>
          </div>

          {/* Year Selector & Add Year button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200 p-1.5 shadow-md dark:bg-slate-900/50 dark:border-slate-700">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    selectedYear === year
                      ? "text-white bg-linear-to-r from-blue-600 to-teal-500 shadow-md"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  ปีงบประมาณ {year}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddYearModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} strokeWidth={3} />
              <span>เพิ่มปีงบประมาณ</span>
            </button>
          </div>
        </div>

        {/* Dynamic Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* OIT Sidebar selector (O1 - O37) */}
          <div className="lg:col-span-4 bg-white/60 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/80 backdrop-blur-xl rounded-[2.5rem] p-6 max-h-[750px] overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              ตัวชี้วัดย่อยทั้งหมด ({selectedYear === "2568" ? "O1 - O37" : "O1 - O23"})
            </h3>
            <div className="space-y-1">
              {(selectedYear === "2568" ? OIT_INDICATORS_2568 : OIT_INDICATORS_2569).map((ind) => {
                const isSelected = selectedOit === ind.code;
                const hasData = dbItems.some((item) => item.oitCode === ind.code && Array.isArray(item.links) && item.links.length > 0);

                return (
                  <button
                    key={ind.code}
                    onClick={() => handleOitChange(ind.code)}
                    className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? "bg-linear-to-r from-blue-500/10 to-teal-500/10 border-l-4 border-blue-500 text-blue-700 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 hover:text-slate-800"
                    }`}
                  >
                    <div className="flex flex-col grow min-w-0 pr-2">
                      <span className="text-[13px] font-black tracking-wide truncate">
                        {ind.title}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                        {ind.desc}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center gap-2">
                      {hasData ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                          บันทึกข้อมูลแล้ว
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800 whitespace-nowrap">
                          ยังไม่บันทึก
                        </span>
                      )}
                      <ChevronRight size={14} className="opacity-40" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedOit}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 via-teal-400 to-indigo-600" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 text-[10px] font-black bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-widest">
                        ช่องกรอกข้อมูล ITA {selectedYear}
                      </span>
                      {activeOitMeta?.responsible && (
                        <span className="px-3 py-1 text-[10px] font-black bg-teal-100 text-teal-700 rounded-full dark:bg-teal-900/30 dark:text-teal-400 uppercase tracking-widest">
                          งานที่รับผิดชอบ: {activeOitMeta.responsible}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-2">
                      หัวข้อ {selectedOit}
                    </h2>
                  </div>

                  <Link href="/ITA" target="_blank">
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-500 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      ดูหน้าแสดงผลจริง <ExternalLink size={12} />
                    </button>
                  </Link>
                </div>

                {/* Form Notification Toast */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl mb-8 flex items-start gap-3 border ${
                      message.type === "success"
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-800/30 dark:text-emerald-400"
                        : "bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/10 dark:border-rose-800/30 dark:text-rose-400"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm font-bold leading-relaxed">{message.text}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Title field */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2.5 block">
                      ชื่อดัชนีชี้วัด (Indicator Title)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น O1 โครงสร้าง"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Description field */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2.5 block">
                      คำชี้แจง/คำอธิบายประกอบ (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ระบุข้อกำหนด หรือแนวปฏิบัติในการแสดงข้อมูลเพื่อรับการประเมิน..."
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y"
                    />
                  </div>

                  {/* Dynamic Links Section */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">
                        ลิงก์เอกสาร หรือลิงก์เว็บไซต์อ้างอิง (Attachment Links)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="application/pdf,image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={handleTriggerUpload}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl text-[11px] font-black transition-all dark:bg-teal-900/30 dark:text-teal-400 cursor-pointer disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 size={12} className="animate-spin" /> กำลังอัปโหลด (
                              {uploadProgress}%)
                            </>
                          ) : (
                            <>
                              <Upload size={12} /> อัปโหลดไฟล์ PDF / รูปภาพ
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[11px] font-black transition-all dark:bg-blue-900/30 dark:text-blue-400 cursor-pointer"
                        >
                          <Plus size={12} /> เพิ่มช่องลิงก์
                        </button>
                      </div>
                    </div>

                    {links.length === 0 ? (
                      <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                        <LinkIcon
                          className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2"
                          size={32}
                        />
                        <p className="text-xs text-zinc-400 font-bold">
                          ยังไม่ได้เพิ่มลิงก์ข้อมูล กดปุ่มขวาบนเพื่อเพิ่ม
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {links.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col md:flex-row items-center gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl"
                          >
                            {/* Link Name Input */}
                            <div className="w-full md:w-1/3">
                              <input
                                type="text"
                                value={link.name}
                                onChange={(e) => handleLinkChange(idx, "name", e.target.value)}
                                placeholder="เช่น 1. เอกสารแนบ"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:outline-none"
                              />
                            </div>

                            {/* Link URL Input */}
                            <div className="w-full md:w-2/3 flex items-center gap-2">
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                                placeholder="https://..."
                                className="grow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(idx)}
                                className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-4 bg-linear-to-r from-blue-600 to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-teal-600 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> บันทึกหัวข้อ {selectedOit}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Year Modal */}
      <AnimatePresence>
        {showAddYearModal && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddYearModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl z-10"
            >
              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                เพิ่มปีงบประมาณใหม่
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-6">
                กรุณาระบุปีงบประมาณที่ต้องการเพิ่มสำหรับการประเมิน ITA / OIT (เช่น 2570)
              </p>

              <form onSubmit={handleAddYear} className="space-y-4">
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="เช่น 2570"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddYearModal(false);
                      setNewYearInput("");
                    }}
                    className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingYear}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAddingYear ? "กำลังเพิ่ม..." : "เพิ่มปีงบประมาณ"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
