"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  X,
  ZoomIn,
  FileCheck2,
  Activity,
  Award,
  Video,
  FileText,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, DatePicker, message } from "antd";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  image?: string;
  createdAt: string;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    department: string;
    totalWeeks?: string;
    daysPerWeek?: string;
    hoursPerDay?: string;
  }>;
  teachingActivity: {
    totalClasses: number;
    uniqueDates: number;
    totalStudents: number;
    avgStudentsPerClass: number;
    recentActivity: number;
    lastTeachingDate: string | null;
  };
  isActive: boolean;
  // Mock properties for expanded evaluation
  lessonPlanStatus?: "submitted" | "missing" | "approved";
  teachingHours?: number;
  plcHours?: number;
  paStatus?: "approved" | "pending" | "not_started";
  sdqCompletion?: number;
  checklist?: {
    hasLessonPlan?: boolean;
    hasAfterClassNote?: boolean;
    videoCount?: number;
    hasStudentOutcome?: boolean;
    evidenceLink?: string;
  };
  supervisions?: Array<{
    date: string;
    score: number;
    maxScore: number;
  }>;
}

export default function TeacherVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState<"teaching" | "pa" | "plc" | "supervision">("teaching");
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [teacherLessonPlans, setTeacherLessonPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planFilterYear, setPlanFilterYear] = useState<string>("");
  const [planFilterSemester, setPlanFilterSemester] = useState<string>("");

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    async function verifyPermission() {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/permissions?_t=" + Date.now());
        if (res.ok) {
          const permissions = await res.json();
          if (permissions?.access_teacher_verification) {
            setCheckingAccess(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      }
      router.replace("/dashboard");
    }
    verifyPermission();
  }, [status, router]);

  useEffect(() => {
    if (!checkingAccess) {
      fetchTeachers();
    }
  }, [departmentFilter, dateRange, checkingAccess]);

  useEffect(() => {
    applyFilters();
  }, [teachers, departmentFilter, statusFilter, searchQuery]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter) params.append("department", departmentFilter);
      if (dateRange) {
        params.append("startDate", dateRange[0]);
        params.append("endDate", dateRange[1]);
      }

      const res = await fetch(`/api/admin/teacher-verification?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTeachers(data.teachers);
        setFilteredTeachers(data.teachers);
        if (data.departments) {
          setDepartments(data.departments);
        }
      } else {
        message.error("ไม่สามารถโหลดข้อมูลครูได้");
      }
    } catch (error) {
      console.error("Fetch teachers error:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...teachers];
    if (departmentFilter) filtered = filtered.filter((t) => t.department.includes(departmentFilter));
    if (statusFilter === "active") filtered = filtered.filter((t) => t.isActive);
    else if (statusFilter === "inactive") filtered = filtered.filter((t) => !t.isActive);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(query) || t.email.toLowerCase().includes(query));
    }
    setFilteredTeachers(filtered);
  };

  // ดึงแผนการสอนของครูที่เลือก
  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherLessonPlans(selectedTeacher.name);
    } else {
      setTeacherLessonPlans([]);
    }
  }, [selectedTeacher]);

  const fetchTeacherLessonPlans = async (teacherName: string) => {
    setLoadingPlans(true);
    try {
      const res = await fetch(`/api/director/lesson-plans?teacher=${encodeURIComponent(teacherName)}`);
      const data = await res.json();
      setTeacherLessonPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch lesson plans error:", err);
      setTeacherLessonPlans([]);
    }
    setLoadingPlans(false);
  };

  const exportAllTeachersToPdf = () => {
    if (filteredTeachers.length === 0) {
      message.warning("ไม่มีข้อมูลให้ส่งออก");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      message.error("กรุณาอนุญาต Pop-up เพื่อดูรายงาน PDF");
      return;
    }

    const d = new Date();
    const currentDate = d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

    const htmlContent = `
      <html>
        <head>
          <title>รายงานระบบตรวจสอบข้อมูลครู</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
            body {
              font-family: 'Sarabun', sans-serif;
              padding: 30px;
              color: #1f2937;
              background-color: #ffffff;
              line-height: 1.5;
            }
            h1 {
              text-align: center;
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 5px;
              color: #111827;
            }
            .subtitle {
              text-align: center;
              font-size: 13px;
              color: #4b5563;
              margin-bottom: 25px;
              font-weight: 400;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 6px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 700;
              color: #374151;
              text-transform: uppercase;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 9px;
              font-weight: 600;
              border-radius: 9999px;
            }
            .status-active { background-color: #d1fae5; color: #065f46; }
            .status-inactive { background-color: #fee2e2; color: #b91c1c; }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <h1>รายงานระบบตรวจสอบข้อมูลครู (Teacher Verification)</h1>
          <div class="subtitle">วิทยาลัยเทคนิคกันทรลักษ์ • ข้อมูล ณ วันที่ ${currentDate}</div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">ลำดับ</th>
                <th style="width: 25%;">ชื่อ-นามสกุล</th>
                <th style="width: 20%;">แผนกวิชา</th>
                <th style="width: 10%; text-align: center;">จำนวนวิชา</th>
                <th style="width: 15%; text-align: center;">สถานะแผนการสอน</th>
                <th style="width: 15%; text-align: center;">ชั่วโมง/สัปดาห์</th>
                <th style="width: 10%; text-align: center;">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTeachers.map((t, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td style="font-weight: 600;">${t.name}</td>
                  <td>${t.department}</td>
                  <td style="text-align: center;">${t.subjects.length}</td>
                  <td style="text-align: center;">
                    ${t.lessonPlanStatus === 'submitted' ? '<span style="color:#059669;">✓ ส่งแล้ว</span>' : '<span style="color:#dc2626;">✗ ค้างส่ง</span>'}
                  </td>
                  <td style="text-align: center; ${(t.teachingHours || 0) < 12 ? 'color:#dc2626; font-weight:bold;' : ''}">${t.teachingHours || 0}</td>
                  <td style="text-align: center;">
                    <span class="status-badge ${t.isActive ? 'status-active' : 'status-inactive'}">
                      ${t.isActive ? 'สอนปกติ' : 'ไม่ได้สอน'}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportTeacherReportToPdf = () => {
    if (!selectedTeacher) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      message.error("กรุณาอนุญาต Pop-up เพื่อดูรายงาน PDF");
      return;
    }

    const d = new Date();
    const currentDate = d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

    const htmlContent = `
      <html>
        <head>
          <title>รายงานการตรวจสอบข้อมูลครู - ${selectedTeacher.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
            body {
              font-family: 'Sarabun', sans-serif;
              padding: 40px;
              color: #1f2937;
              background-color: #ffffff;
              line-height: 1.5;
            }
            h1 {
              text-align: center;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 5px;
              color: #111827;
            }
            .subtitle {
              text-align: center;
              font-size: 14px;
              color: #4b5563;
              margin-bottom: 30px;
              font-weight: 400;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              margin-top: 25px;
              margin-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
              color: #374151;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              background-color: #f9fafb;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 20px;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 700;
              color: #374151;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 9999px;
            }
            .status-good {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-warn {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-bad {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .checklist-item {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .check-icon {
              color: #059669;
              margin-right: 10px;
              font-weight: bold;
            }
            .cross-icon {
              color: #dc2626;
              margin-right: 10px;
              font-weight: bold;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-around;
              text-align: center;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 40%;
            }
            .signature-line {
              border-bottom: 1px dotted #1f2937;
              margin-bottom: 10px;
              height: 40px;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <h1>รายงานสรุปผลการปฏิบัติงานรายบุคคล</h1>
          <div class="subtitle">วิทยาลัยเทคนิคกันทรลักษ์ • ข้อมูล ณ วันที่ ${currentDate}</div>
          
          <div class="section-title">ข้อมูลส่วนตัวและภาระงานสอน</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">ชื่อ-นามสกุล</div>
              <div class="info-value">${selectedTeacher.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">แผนกวิชา</div>
              <div class="info-value">${selectedTeacher.department}</div>
            </div>
            <div class="info-item">
              <div class="info-label">ชั่วโมงสอน</div>
              <div class="info-value">${selectedTeacher.teachingHours || 0} ชั่วโมง/สัปดาห์</div>
            </div>
            <div class="info-item">
              <div class="info-label">คลาสทั้งหมด / ความคืบหน้า SDQ</div>
              <div class="info-value">${selectedTeacher.teachingActivity?.totalClasses || 0} คลาส / ${selectedTeacher.sdqCompletion || 0}%</div>
            </div>
            <div class="info-item">
              <div class="info-label">ชั่วโมง PLC</div>
              <div class="info-value">${selectedTeacher.plcHours || 0} ชั่วโมง</div>
            </div>
            <div class="info-item">
              <div class="info-label">สถานะข้อตกลง PA</div>
              <div class="info-value">
                ${selectedTeacher.paStatus === "approved" ? "ผู้อำนวยการอนุมัติแล้ว" : selectedTeacher.paStatus === "pending" ? "รอพิจารณา" : "ยังไม่ดำเนินการ"}
              </div>
            </div>
          </div>

          <div class="section-title">รายวิชาที่รับผิดชอบและแผนการสอน</div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">ลำดับ</th>
                <th style="width: 15%;">รหัสวิชา</th>
                <th style="width: 45%;">ชื่อรายวิชา</th>
                <th style="width: 15%; text-align: center;">คาบ/สัปดาห์</th>
                <th style="width: 20%; text-align: center;">แผนการสอน</th>
              </tr>
            </thead>
            <tbody>
              ${selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? selectedTeacher.subjects.map((s, idx) => {
                const matchingPlans = teacherLessonPlans.filter((lp: any) =>
                  lp.subject === s.name || lp.subject === s.code || lp.subject?.includes(s.name) || s.name?.includes(lp.subject)
                );
                const hasPlan = matchingPlans.length > 0;
                return `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${s.code}</td>
                    <td>${s.name}</td>
                    <td style="text-align: center;">${s.hoursPerDay || 2}</td>
                    <td style="text-align: center;">
                      <span class="status-badge ${hasPlan ? 'status-good' : 'status-bad'}">
                        ${hasPlan ? 'มีแผนการสอน' : 'ไม่มีแผน'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("") : `<tr><td colspan="5" style="text-align: center;">ไม่มีข้อมูลรายวิชา</td></tr>`}
            </tbody>
          </table>

          <div class="section-title">ความพร้อมสำหรับการประเมิน ว.PA / DPA</div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <div class="checklist-item">
              <span class="${selectedTeacher.checklist?.hasLessonPlan ? 'check-icon' : 'cross-icon'}">${selectedTeacher.checklist?.hasLessonPlan ? '✓' : '✗'}</span>
              1. จัดทำแผนการสอนล่วงหน้า
            </div>
            <div class="checklist-item">
              <span class="${selectedTeacher.checklist?.hasAfterClassNote ? 'check-icon' : 'cross-icon'}">${selectedTeacher.checklist?.hasAfterClassNote ? '✓' : '✗'}</span>
              2. บันทึกหลังสอนครบถ้วน
            </div>
            <div class="checklist-item">
              <span class="${(selectedTeacher.checklist?.videoCount || 0) >= 2 ? 'check-icon' : 'cross-icon'}">${(selectedTeacher.checklist?.videoCount || 0) >= 2 ? '✓' : '✗'}</span>
              3. อัปโหลดคลิปวิดีโอการสอน (${selectedTeacher.checklist?.videoCount || 0}/2 คลิป)
            </div>
            <div class="checklist-item">
              <span class="${selectedTeacher.checklist?.hasStudentOutcome ? 'check-icon' : 'cross-icon'}">${selectedTeacher.checklist?.hasStudentOutcome ? '✓' : '✗'}</span>
              4. รายงานผลลัพธ์ผู้เรียน
            </div>
          </div>

          <div class="section-title">ผลการนิเทศการสอนภายใน</div>
          <table>
            <thead>
              <tr>
                <th style="width: 10%; text-align: center;">ครั้งที่</th>
                <th style="width: 45%;">วันที่รับการนิเทศ</th>
                <th style="width: 45%; text-align: center;">ผลการประเมิน (คะแนน)</th>
              </tr>
            </thead>
            <tbody>
              ${selectedTeacher.supervisions && selectedTeacher.supervisions.length > 0 ? selectedTeacher.supervisions.map((sup, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${new Date(sup.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</td>
                  <td style="text-align: center; font-weight: bold;">
                    ${sup.score} / ${sup.maxScore}
                  </td>
                </tr>
              `).join("") : `<tr><td colspan="3" style="text-align: center;">ยังไม่มีข้อมูลการนิเทศการสอน</td></tr>`}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>(...............................................................)</div>
              <div style="font-size: 13px; margin-top: 8px; color: #4b5563;">ผู้รับการประเมิน / ผู้รายงาน</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>(...............................................................)</div>
              <div style="font-size: 13px; margin-top: 8px; color: #4b5563;">ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (status === "loading" || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-4xl p-8 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              ระบบตรวจสอบข้อมูลครู <span className="text-indigo-500">(Teacher Verification)</span>
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
              เจาะลึกข้อมูลรายบุคคล เพื่อประกอบการประเมินเลื่อนวิทยฐานะ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportAllTeachersToPdf}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <FileText size={16} /> ดาวน์โหลดประวัติ (PDF)
            </button>
            <button
              onClick={() => fetchTeachers()}
              disabled={loading}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              รีโหลดข้อมูล
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-900 rounded-4xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ค้นหา</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ชื่อ หรือ อีเมล"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">แผนกวิชา</label>
              <Select
                placeholder="ทั้งหมด"
                value={departmentFilter || undefined}
                onChange={(val) => setDepartmentFilter(val || "")}
                options={[{ label: "ทั้งหมด", value: "" }, ...departments.map((d) => ({ label: d, value: d }))]}
                className="w-full h-[46px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">สถานะการสอน</label>
              <Select
                placeholder="ทั้งหมด"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "ทั้งหมด", value: "all" },
                  { label: "สอนปกติ", value: "active" },
                  { label: "ไม่ได้สอน/พัก", value: "inactive" },
                ]}
                className="w-full h-[46px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ช่วงเวลา</label>
              <DatePicker.RangePicker
                className="w-full h-[46px]"
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                  } else setDateRange(null);
                }}
              />
            </div>
          </div>
        </div>

        {/* Teacher Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
              รายชื่อครู ({filteredTeachers.length} คน)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-zinc-800/50 font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">โปรไฟล์ครู</th>
                  <th className="px-4 py-4 text-center">วิชาทั้งหมด</th>
                  <th className="px-4 py-4 text-center">แผนการสอน</th>
                  <th className="px-4 py-4 text-center">ชั่วโมง/สัปดาห์</th>
                  <th className="px-4 py-4 text-center">สถานะ</th>
                  <th className="px-4 py-4 text-center">ประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredTeachers.map((teacher) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-indigo-50/30 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setActiveTab("teaching");
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                          {teacher.image ? <img src={teacher.image} className="w-full h-full object-cover" /> : teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-base">{teacher.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{teacher.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {teacher.subjects.length} วิชา
                    </td>
                    <td className="px-4 py-4 text-center">
                      {teacher.lessonPlanStatus === "submitted" ? (
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded font-bold text-xs"><CheckCircle size={14} className="inline mr-1" />ส่งแล้ว</span>
                      ) : (
                        <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded font-bold text-xs"><AlertCircle size={14} className="inline mr-1" />ค้างส่ง</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-black">
                      <span className={(teacher.teachingHours || 0) < 12 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>
                        {teacher.teachingHours} ชม.
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {teacher.isActive ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto"></div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                        ตรวจสอบ
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Advanced Teacher Evaluation Modal */}
      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 z-100"
            onClick={() => setSelectedTeacher(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-950 rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 flex gap-6 items-end relative border-b border-slate-100 dark:border-zinc-800/50 pb-6">
                <button onClick={() => setSelectedTeacher(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-zinc-800 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
                <div className="w-28 h-28 rounded-4xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-black text-4xl text-indigo-500 overflow-hidden shadow-inner">
                  {selectedTeacher.image ? <img src={selectedTeacher.image} className="w-full h-full object-cover" /> : selectedTeacher.name.charAt(0)}
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{selectedTeacher.name}</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedTeacher.department}</p>
                </div>
                <div className="flex flex-col gap-2 mb-2 items-end">
                  <a href={`/dashboard/dve?teacherId=${selectedTeacher.id}&teacherName=${encodeURIComponent(selectedTeacher.name)}&teacherDept=${encodeURIComponent(selectedTeacher.department)}`} target="_blank" rel="noopener noreferrer" className="flex px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold items-center gap-2 hover:scale-105 transition-transform text-sm shadow-md shadow-indigo-500/20">
                    <BookOpen size={16} /> ดูในมุมมองผู้สอน (DVE)
                  </a>
                  <button onClick={exportTeacherReportToPdf} className="flex px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold items-center gap-2 hover:scale-105 transition-transform text-sm shadow-md">
                    <Printer size={16} /> พิมพ์รายงาน (PDF)
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-8 gap-6 border-b border-slate-100 dark:border-zinc-800/50 overflow-x-auto">
                {[
                  { id: "teaching", label: "ภาระงานสอน", icon: BookOpen },
                  { id: "pa", label: "การประเมิน ว.PA/DPA", icon: Award },
                  { id: "plc", label: "การพัฒนาตนเอง (PLC)", icon: Users },
                  { id: "supervision", label: "นิเทศการสอน", icon: Video }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={"py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap " + (
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    )}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-zinc-950/50">

                {/* 1. Teaching Tab */}
                {activeTab === "teaching" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ชั่วโมงสอน</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{selectedTeacher.teachingHours} <span className="text-sm font-medium text-slate-500">ชม./สัปดาห์</span></p>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">คลาสทั้งหมด</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{selectedTeacher.teachingActivity.totalClasses}</p>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ความคืบหน้า SDQ</p>
                        <p className="text-3xl font-black text-emerald-500">{selectedTeacher.sdqCompletion}%</p>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ระบบดูแล (เยี่ยมบ้าน)</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">100%</p>
                      </div>
                    </div>

                    {/* ตัวกรอง ปี/เทอม สำหรับแผนการสอน */}
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">กรองแผนการสอน:</span>
                      <select
                        className="px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={planFilterYear}
                        onChange={e => setPlanFilterYear(e.target.value)}
                      >
                        <option value="">📅 ทุกปีการศึกษา</option>
                        {Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() + 543 - 3 + i)).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <select
                        className="px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={planFilterSemester}
                        onChange={e => setPlanFilterSemester(e.target.value)}
                      >
                        <option value="">📌 ทุกเทอม</option>
                        <option value="1">เทอม 1</option>
                        <option value="2">เทอม 2</option>
                        <option value="3">เทอม 3</option>
                      </select>
                      {(planFilterYear || planFilterSemester) && (
                        <button onClick={() => { setPlanFilterYear(""); setPlanFilterSemester(""); }} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-950/30 rounded-xl hover:bg-rose-100 transition-colors">
                          ✕ ล้างตัวกรอง
                        </button>
                      )}
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider">รายวิชาที่รับผิดชอบ</h3>
                        <button onClick={() => router.push(`/dashboard/director/lesson-plans?teacher=${encodeURIComponent(selectedTeacher.name)}`)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                          ดูทั้งหมดในหน้าแผนการสอน →
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedTeacher.subjects.map(s => {
                          // กรองแผนการสอนตาม ปี/เทอม ก่อน แล้วค่อย match วิชา
                          const filteredLessonPlans = teacherLessonPlans.filter((lp: any) => {
                            if (planFilterYear && String(lp.academicYear) !== String(planFilterYear)) return false;
                            if (planFilterSemester && String(lp.semester) !== String(planFilterSemester)) return false;
                            return true;
                          });
                          const matchingPlans = filteredLessonPlans.filter((lp: any) =>
                            lp.subject === s.name || lp.subject === s.code || lp.subject?.includes(s.name) || s.name?.includes(lp.subject)
                          );
                          return (
                            <div key={s.id} className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                              <div className="flex justify-between items-start gap-3 mb-2">
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white">[{s.code}] {s.name}</p>
                                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">จำนวนคาบ: {s.hoursPerDay || 2} คาบ/สัปดาห์</p>
                                </div>
                                {matchingPlans.length > 0 ? (
                                  <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider whitespace-nowrap"><CheckCircle size={12} className="inline mr-1" />มีแผน {matchingPlans.length} ฉบับ</span>
                                ) : (
                                  <span className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider whitespace-nowrap"><AlertCircle size={12} className="inline mr-1" />ยังไม่มีแผน</span>
                                )}
                              </div>
                              {/* แสดงรายการแผนการสอนที่ตรง */}
                              {loadingPlans ? (
                                <p className="text-xs text-slate-400 mt-2">กำลังโหลดแผนการสอน...</p>
                              ) : matchingPlans.length > 0 ? (
                                <div className="mt-3 space-y-2 pl-2 border-l-2 border-emerald-200 dark:border-emerald-800">
                                  {matchingPlans.map((lp: any) => (
                                    <div key={lp._id} className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-700">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{lp.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-slate-400">เทอม {lp.semester}/{lp.academicYear}</span>
                                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                            lp.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                                            lp.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' :
                                            'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                                          }`}>
                                            {lp.status === 'approved' ? 'อนุมัติแล้ว' : lp.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                                          </span>
                                        </div>
                                      </div>
                                      {lp.fileUrl ? (
                                        <a href={lp.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors">
                                          <FileText size={13} /> เปิด PDF
                                        </a>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 font-bold">ไม่มีไฟล์</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      {/* แสดงแผนการสอนที่ไม่ตรงกับวิชาใด */}
                      {teacherLessonPlans.length > 0 && (() => {
                        const filteredAll = teacherLessonPlans.filter((lp: any) => {
                          if (planFilterYear && String(lp.academicYear) !== String(planFilterYear)) return false;
                          if (planFilterSemester && String(lp.semester) !== String(planFilterSemester)) return false;
                          return true;
                        });
                        const unmatchedPlans = filteredAll.filter((lp: any) => {
                          return !selectedTeacher.subjects.some(s =>
                            lp.subject === s.name || lp.subject === s.code || lp.subject?.includes(s.name) || s.name?.includes(lp.subject)
                          );
                        });
                        if (unmatchedPlans.length === 0) return null;
                        return (
                          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">แผนการสอนอื่นๆ ที่ส่ง ({unmatchedPlans.length} ฉบับ)</h4>
                            <div className="space-y-2">
                              {unmatchedPlans.map((lp: any) => (
                                <div key={lp._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{lp.subject} — {lp.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-bold text-slate-400">เทอม {lp.semester}/{lp.academicYear}</span>
                                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                        lp.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        lp.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                        'bg-amber-50 text-amber-600'
                                      }`}>
                                        {lp.status === 'approved' ? 'อนุมัติแล้ว' : lp.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                                      </span>
                                    </div>
                                  </div>
                                  {lp.fileUrl ? (
                                    <a href={lp.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors">
                                      <FileText size={13} /> เปิด PDF
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">ไม่มีไฟล์</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. PA & DPA Tab */}
                {activeTab === "pa" && (
                  <div className="space-y-6">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                      <Award className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10" />
                      <h3 className="text-2xl font-black mb-2">ข้อตกลงในการพัฒนางาน (PA)</h3>
                      <p className="text-sm font-medium text-white/80 max-w-lg mb-6">
                        ติดตามสถานะการจัดทำไฟล์ประเด็นท้าทาย และคลิปวิดีโอการสอน เพื่อเตรียมประเมิน DPA ในรอบปีการศึกษา
                      </p>
                      <div className="flex gap-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">สถานะล่าสุด</p>
                          <p className="text-lg font-bold">{selectedTeacher.paStatus === "approved" ? "ผอ. อนุมัติแล้ว" : "รอพิจารณา"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <h4 className="font-black text-slate-800 dark:text-white mb-4">Checklist ความพร้อม</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasLessonPlan ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-rose-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">1. จัดทำแผนการสอนล่วงหน้า</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasAfterClassNote ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">2. บันทึกหลังสอนครบถ้วน</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {(selectedTeacher.checklist?.videoCount || 0) >= 2 ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">3. อัปโหลดคลิปวิดีโอการสอน ({selectedTeacher.checklist?.videoCount || 0}/2 คลิป)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasStudentOutcome ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">4. รายงานผลลัพธ์ผู้เรียน</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                        <FileCheck2 size={40} className="text-slate-300 dark:text-zinc-700 mb-4" />
                        <h4 className="font-black text-slate-800 dark:text-white">เอกสารข้อตกลง PA</h4>
                        <p className="text-xs text-slate-500 mt-2 mb-4">ไฟล์ PDF เสนอผู้อำนวยการอนุมัติ (PA1)</p>
                        <button onClick={() => { if (selectedTeacher.checklist?.evidenceLink) window.open(selectedTeacher.checklist.evidenceLink, "_blank"); else message.warning("ยังไม่มีไฟล์เอกสาร"); }} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold w-full">{selectedTeacher.checklist?.evidenceLink ? "ดาวน์โหลดเอกสาร" : "ยังไม่ส่งเอกสาร"}</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PLC Tab */}
                {activeTab === "plc" && (
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center justify-center min-h-[300px]">
                    <Users className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ชั่วโมงเข้าร่วม PLC ทั้งหมด</p>
                    <p className="text-5xl font-black text-slate-800 dark:text-white mb-6">{selectedTeacher.plcHours} <span className="text-xl text-slate-400">ชม.</span></p>
                    <p className="text-sm text-slate-500 max-w-md">บุคลากรต้องเข้าร่วมกระบวนการชุมชนการเรียนรู้ทางวิชาชีพ (PLC) เพื่อแก้ปัญหาในชั้นเรียนร่วมกับเพื่อนครูอย่างน้อย 50 ชั่วโมง/ปีการศึกษา</p>
                  </div>
                )}

                {/* 4. Supervision Tab */}
                {activeTab === "supervision" && (
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center justify-center min-h-[300px]">
                    <Video className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-2">ผลการนิเทศการสอนภายใน</h3>
                    {selectedTeacher.supervisions && selectedTeacher.supervisions.length > 0 ? (
                      <div className="mb-6 space-y-4 w-full max-w-md">
                        {selectedTeacher.supervisions.map((sup: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl flex justify-between items-center w-full">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                              ครั้งที่ {idx + 1} ({new Date(sup.date).toLocaleDateString("th-TH")})
                            </span>
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              {sup.score}/{sup.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 max-w-md mb-6">ยังไม่มีผลการประเมินการจัดการเรียนรู้ในชั้นเรียน</p>
                    )}
                    <button onClick={() => router.push('/dashboard/director/plc?teacher=' + encodeURIComponent(selectedTeacher.name))} className="px-6 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-100 transition-colors">
                      ไปที่ระบบนิเทศ/PLC
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
