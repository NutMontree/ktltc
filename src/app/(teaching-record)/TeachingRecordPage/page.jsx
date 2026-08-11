"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";


export default function TeachingRecordPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toLowerCase() || "";
  const isSuperAdmin = userRole === "super_admin" || userRole === "admin";
  const currentUser = session?.user?.name || "";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const triggerPrint = async (recordsToPrint) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Loading...</title></head><body><h2 style='text-align:center;font-family:sans-serif;margin-top:20vh;'>กำลังเตรียมข้อมูล PDF... กรุณารอสักครู่</h2></body></html>");

    let recordsArray = Array.isArray(recordsToPrint) ? recordsToPrint : [recordsToPrint];

    // Fetch missing signatures asynchronously
    recordsArray = await Promise.all(recordsArray.map(async (record) => {
      let teacherSig = record.teacherSignature;
      let headSig = record.headSignature;

      if (!teacherSig && record.signerName) {
        try {
          const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(record.signerName)}&type=teacher`);
          if (res.ok) {
            const data = await res.json();
            teacherSig = data.signature || "";
          }
        } catch (e) { }
      }

      if (!headSig && record.headName) {
        try {
          const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(record.headName)}&type=head`);
          if (res.ok) {
            const data = await res.json();
            headSig = data.signature || "";
          }
        } catch (e) { }
      }

      return {
        ...record,
        teacherSignature: teacherSig,
        headSignature: headSig,
        semester: record.semester || "1",
        academicYear: record.academicYear || "2569",
      };
    }));

    const formatDateToThai = (dateString) => {
      if (!dateString) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-");
        const thaiMonths = [
          "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const thaiYear = parseInt(year) + (parseInt(year) < 2500 ? 543 : 0);
        return `${parseInt(day)} ${thaiMonths[parseInt(month) - 1]} ${thaiYear}`;
      }
      return dateString;
    };

    const renderParagraphs = (text) => {
      if (!text) return `<div class="para">-</div>`;
      return text
        .split("\n")
        .map((p) => `<div class="para">${p}</div>`)
        .join("");
    };

    const renderSectionImages = (images = []) => {
      if (!images || images.length === 0) return "";
      if (images.length === 1) {
        return `
          <div style="text-align: center; margin-top: 15px;">
            <img src="${images[0]}" style="max-height: 250px; max-width: 90%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
          </div>
        `;
      }
      return `
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 15px;">
          ${images
          .map(
            (img) => `
            <img src="${img}" style="max-height: 200px; max-width: 45%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
          `
          )
          .join("")}
        </div>
      `;
    };

    const pagesHTML = recordsArray.map((record, index) => {
      const checkTheory = record.isTheory ? "☑" : "☐";
      const checkPractice = record.isPractice ? "☑" : "☐";
      const formattedDate = formatDateToThai(record.date);

      return `
        <div style="${index < recordsArray.length - 1 ? 'page-break-after: always;' : ''}">
          <div class="header-box">
            <div class="header-title">บันทึกหลังการสอน รายวิชา ภาคเรียนที่ ${record.semester} ปีการศึกษา ${record.academicYear}</div>
            <div class="header-subtitle">วิทยาลัยเทคนิคกันทรลักษ์</div>
            <div class="flex-row">
              <span>รหัสวิชา</span><span style="margin-left: 5px; margin-right:15px;">${record.courseCode || ""}</span>
              <span>ชื่อวิชา</span><span style="margin-left: 5px;">${record.courseName || ""}</span>
            </div>
            <div class="flex-row">
              <span>สอนครั้งที่</span><span style="margin-left: 5px; margin-right:15px;">${record.teachingNo || ""}</span>
              <span>วันที่</span><span style="margin-left: 5px; margin-right:15px;">${formattedDate}</span>
              <span>สัปดาห์ที่</span><span style="margin-left: 5px; margin-right:15px;">${record.weekNo || ""}</span>
              <span>หน่วยการเรียนรู้ที่</span><span style="margin-left: 5px;">${record.unitNo || ""}</span>
            </div>
            <div class="flex-row">
              <span>ชื่อหน่วย</span><span style="margin-left: 5px;">${record.unitName || ""}</span>
            </div>
            <div class="flex-row">
              <span>เรื่อง</span><span style="margin-left: 5px;">${record.topic || ""}</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">1. กิจกรรมการเรียนการสอน</div>
            ${renderParagraphs(record.activities)}
            ${renderSectionImages(record.activitiesImages)}
            <div class="checkbox-group">
              <span style="margin-right: 40px;">${checkTheory} ทฤษฎี</span>
              <span>${checkPractice} ปฏิบัติ</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">2. ผลการดำเนินกิจกรรมการเรียนการสอน</div>
            ${renderParagraphs(record.results)}
            ${renderSectionImages(record.resultsImages)}
          </div>

          <div class="content-section">
            <div class="section-title">3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา</div>
            ${renderParagraphs(record.problems)}
            ${renderSectionImages(record.problemsImages)}
          </div>

          <div class="signature-section">
            <div class="signature-box" style="display: flex; justify-content: center;">
              <table style="border-collapse: collapse; border: none; font-size: 16pt;">
                <tr>
                  <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
                  <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
                    ${record.teacherSignature ? `<img src="${record.teacherSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
                  </td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">(${record.signerName || "...................................."})</td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">ครูผู้สอน</td>
                </tr>
              </table>
            </div>
            <div class="signature-box" style="display: flex; justify-content: center;">
              <table style="border-collapse: collapse; border: none; font-size: 16pt;">
                <tr>
                  <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
                  <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
                    ${record.headSignature ? `<img src="${record.headSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
                  </td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">(${record.headName || "...................................."})</td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">หัวหน้าแผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `;
    }).join("");

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>บันทึกหลังการสอน</title>
          <base href="${window.location.origin}">
          <style>
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew.ttf') format('truetype');
              font-weight: normal; font-style: normal;
            }
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew-Bold.ttf') format('truetype');
              font-weight: bold; font-style: normal;
            }
            @page { size: A4; margin: 1cm 1.5cm; }
            body { 
              font-family: 'TH Sarabun IT9', 'TH Sarabun New', serif; 
              font-size: 16pt; 
              line-height: 1.3; 
              margin: 0;
              padding: 0;
              color: black;
              box-sizing: border-box;
            }
            .header-box {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
            }
            .header-title { font-size: 18pt; font-weight: bold; text-align: center; }
            .header-subtitle { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 10px; }
            .flex-row { display: flex; align-items: baseline; margin-bottom: 5px; }
            .content-section { margin-top: 15px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .para { text-indent: 1.5cm; text-align: justify; text-justify: inter-character; white-space: pre-line; word-break: break-word; }
            .checkbox-group { text-align: center; margin: 15px 0; font-size: 18pt;}
            .signature-section { display: flex; justify-content: space-around; margin-top: 20px; page-break-inside: avoid; }
            .signature-box { text-align: center; width: 45%; }
          </style>
        </head>
        <body>
          ${pagesHTML}
          <script>
            const printContent = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(printContent);
            } else {
              printContent();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [users, setUsers] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [viewingWeekRecords, setViewingWeekRecords] = useState(null);
  const [activeTab, setActiveTab] = useState("submitted");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resRecords, resUsers] = await Promise.all([
          fetch("/api/TeachingRecords"),
          fetch("/api/users/all")
        ]);
        if (resRecords.ok) {
          setRecords(await resRecords.json());
        }
        if (resUsers.ok) {
          const uData = await resUsers.json();
          setUsers(uData.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/TeachingRecords/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords(records.filter((r) => r._id !== id));
        if (viewingWeekRecords) {
          const updatedRecords = viewingWeekRecords.records.filter(r => r._id !== id);
          if (updatedRecords.length === 0) {
            setViewingWeekRecords(null);
          } else {
            setViewingWeekRecords({ ...viewingWeekRecords, records: updatedRecords });
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const teacherUsers = users.filter(u => u.role === "teacher");
  const validTeacherNames = new Set(teacherUsers.map(u => u.name));

  const userDeptMap = {};
  const userImageMap = {};
  teacherUsers.forEach(u => {
    userDeptMap[u.name] = u.department || "ไม่ระบุแผนก";
    userImageMap[u.name] = u.image || "";
  });

  const availableSemesters = Array.from(new Set(records.map(r => r.semester || "1"))).sort();
  const availableYears = Array.from(new Set(records.map(r => r.academicYear || "2569"))).sort().reverse();
  const availableDepts = Array.from(new Set(
    teacherUsers.map(u => u.department)
         .filter(Boolean)
         .filter(d => !d.startsWith("งาน") && d.includes("แผนก"))
  )).sort();

  const filteredRecords = records.filter(r => {
    if (!validTeacherNames.has(r.signerName)) return false;

    const sem = r.semester || "1";
    const year = r.academicYear || "2569";
    const dept = userDeptMap[r.signerName] || "ไม่ระบุแผนก";
    
    if (selectedSemester && sem !== selectedSemester) return false;
    if (selectedAcademicYear && String(year) !== String(selectedAcademicYear)) return false;
    if (selectedDepartment && dept !== selectedDepartment) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(r.courseName || "").toLowerCase().includes(term) &&
          !(r.signerName || "").toLowerCase().includes(term) &&
          !(r.courseCode || "").toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const weekGroups = {};
  for (let i = 1; i <= 18; i++) {
    weekGroups[i] = [];
  }
  
  filteredRecords.forEach(r => {
    const w = parseInt(r.weekNo);
    if (!isNaN(w) && w >= 1 && w <= 18) {
      weekGroups[w].push(r);
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white">ภาพรวมบันทึกการสอนรายสัปดาห์</h1>
            <p className="mt-1 text-sm text-gray-500">ตรวจสอบยอดการส่งบันทึกการสอนแบ่งตามสัปดาห์</p>
          </div>
          <Link
            href={`/TeachingRecordPage/new?teacher=${encodeURIComponent(currentUser)}`}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 self-start md:self-auto"
          >
            + สร้างบันทึกใหม่
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 rounded-3xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-500">ภาคเรียน</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">ทั้งหมด</option>
              {availableSemesters.map(s => <option key={s} value={s}>เทอม {s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-500">ปีการศึกษา</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">ทั้งหมด</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-500">แผนกวิชา</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">ทั้งหมด</option>
              {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-500">ค้นหาวิชา / ผู้สอน</label>
            <input
              type="text"
              placeholder="พิมพ์ชื่อวิชา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-500">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
            const recordsForWeek = weekGroups[week];
            const hasRecord = recordsForWeek.length > 0;
            return (
              <div
                key={week}
                onClick={() => {
                  setViewingWeekRecords({ week, records: recordsForWeek });
                  setActiveTab('submitted');
                }}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border p-6 shadow-sm transition hover:scale-105 hover:shadow-lg ${
                  hasRecord 
                    ? "border-primary/30 bg-primary/5 hover:border-primary dark:bg-boxdark dark:border-strokedark" 
                    : "border-stroke bg-white hover:border-primary/50 dark:border-strokedark dark:bg-boxdark opacity-70 hover:opacity-100"
                }`}
              >
                <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full transition ${
                  hasRecord 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "bg-gray-100 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary dark:bg-meta-4"
                }`}>
                  <span className="text-2xl font-black">{week}</span>
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white text-center">
                  สัปดาห์ที่ {week}
                </h3>
                <p className={`mt-2 text-sm font-semibold text-center rounded-lg px-3 py-1 ${hasRecord ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-gray-400'}`}>
                  {hasRecord ? `ส่งแล้ว ${recordsForWeek.length} รายการ` : 'ยังไม่มีคนส่ง'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal View Week Records */}
      {viewingWeekRecords && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-boxdark">
            <div className="flex items-center justify-between border-b border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-meta-4">
              <h3 className="text-2xl font-black text-black dark:text-white">
                บันทึกการสอน สัปดาห์ที่ {viewingWeekRecords.week}
              </h3>
              <button
                onClick={() => setViewingWeekRecords(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition hover:bg-danger hover:text-white dark:bg-boxdark"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-boxdark">
              {(() => {
                const submittedTeachers = new Set(viewingWeekRecords.records.map(r => r.signerName));
                const targetTeachers = teacherUsers.filter(u => {
                  if (selectedDepartment) return u.department === selectedDepartment;
                  return u.department && availableDepts.includes(u.department); 
                });
                const unsubmittedTeachers = targetTeachers.filter(u => u.name && !submittedTeachers.has(u.name));
                return (
                  <>
                    <div className="mb-6 flex space-x-2 border-b border-stroke dark:border-strokedark pb-2">
                      <button
                        onClick={() => setActiveTab('submitted')}
                        className={`px-4 py-2 font-bold transition ${activeTab === 'submitted' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                      >
                        ส่งแล้ว ({viewingWeekRecords.records.length} รายการ)
                      </button>
                      <button
                        onClick={() => setActiveTab('missing')}
                        className={`px-4 py-2 font-bold transition ${activeTab === 'missing' ? 'border-b-2 border-danger text-danger' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                      >
                        ยังไม่ส่ง ({unsubmittedTeachers.length} คน)
                      </button>
                    </div>

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          แสดงข้อมูล: {selectedDepartment || "ทุกแผนก"} | เทอม {selectedSemester || "ทั้งหมด"} | ปี {selectedAcademicYear || "ทั้งหมด"}
                        </p>
                      </div>
                      {activeTab === 'submitted' && (
                        <button
                          onClick={() => triggerPrint(viewingWeekRecords.records)}
                          className="rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-opacity-90 flex items-center gap-2"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                          Export PDF ทั้งสัปดาห์
                        </button>
                      )}
                    </div>

                    {activeTab === 'submitted' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {viewingWeekRecords.records.map((record) => (
                          <div key={record._id} className="flex flex-col rounded-2xl border border-stroke bg-gray-50 p-6 shadow-sm transition hover:border-primary/50 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-bold text-black dark:text-white line-clamp-1 pr-4">{record.courseName}</h3>
                              <span className="shrink-0 text-xs font-bold bg-white dark:bg-boxdark text-primary px-3 py-1.5 rounded-lg shadow-sm border border-stroke dark:border-strokedark">สอนครั้งที่ {record.teachingNo}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-4 rounded-xl bg-white p-3 border border-stroke dark:bg-boxdark dark:border-strokedark shadow-sm">
                              {userImageMap[record.signerName] ? (
                                <img src={userImageMap[record.signerName]} alt={record.signerName} className="h-10 w-10 rounded-full object-cover border border-primary/20" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                  {(record.signerName || "อ")[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-black dark:text-white">{record.signerName || "ไม่ระบุชื่อครูผู้สอน"}</p>
                                <p className="text-xs font-semibold text-gray-500">วันที่: {record.date || "ไม่ระบุ"}</p>
                              </div>
                            </div>
                            
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 flex-1 mb-4">เรื่อง: {record.topic}</p>

                            <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-stroke dark:border-strokedark">
                              {(isSuperAdmin || currentUser === (record.signerName || "ไม่ระบุชื่อครูผู้สอน")) && (
                                <Link
                                  href={`/TeachingRecordPage/${record._id}`}
                                  className="flex-1 rounded-xl bg-primary/10 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-white min-w-[80px]"
                                >
                                  แก้ไข
                                </Link>
                              )}
                              <button
                                onClick={() => triggerPrint([record])}
                                className="flex-1 rounded-xl bg-indigo-500/10 py-2.5 text-center text-sm font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white min-w-[80px]"
                              >
                                Export PDF
                              </button>
                              {(isSuperAdmin || currentUser === (record.signerName || "ไม่ระบุชื่อครูผู้สอน")) && (
                                <button
                                  onClick={(e) => handleDelete(record._id, e)}
                                  className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-bold text-danger transition hover:bg-danger hover:text-white"
                                >
                                  ลบ
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {unsubmittedTeachers.length > 0 ? unsubmittedTeachers.map((t) => (
                          <div key={t._id || t.name} className="flex items-center gap-3 rounded-2xl border border-stroke bg-gray-50 p-4 shadow-sm dark:border-strokedark dark:bg-meta-4">
                            {userImageMap[t.name] ? (
                              <img src={userImageMap[t.name]} alt={t.name} className="h-12 w-12 shrink-0 rounded-full object-cover border border-danger/20" />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger font-bold text-xl">
                                {(t.name || "อ")[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-black dark:text-white line-clamp-1">{t.name}</p>
                              <p className="text-xs font-semibold text-gray-500 line-clamp-1">{t.department}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="col-span-full py-10 text-center text-gray-500 font-bold">
                            ส่งครบทุกคนแล้ว! 🎉
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
