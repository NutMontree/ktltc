"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";


export default function TeachingRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");

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
        } catch (e) {}
      }

      if (!headSig && record.headName) {
        try {
          const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(record.headName)}&type=head`);
          if (res.ok) {
            const data = await res.json();
            headSig = data.signature || "";
          }
        } catch (e) {}
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

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/TeachingRecords");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    if(e) e.stopPropagation();
    if (!confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/TeachingRecords/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords(records.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const teachers = Array.from(new Set(records.map(r => r.signerName || "ไม่ระบุชื่อครูผู้สอน")));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">บันทึกการสอน</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลบันทึกหลังการสอน</p>
        </div>
        <Link
          href="/TeachingRecordPage/new"
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90"
        >
          + สร้างบันทึกใหม่
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-500">กำลังโหลด...</div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-strokedark">
          ยังไม่มีข้อมูลบันทึกการสอน
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {teachers.map((teacherName) => {
            const teacherRecords = records.filter(r => (r.signerName || "ไม่ระบุชื่อครูผู้สอน") === teacherName);
            return (
              <div
                key={teacherName}
                onClick={() => setSelectedTeacher(teacherName)}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-stroke bg-white p-8 shadow-sm transition hover:border-primary hover:shadow-lg dark:border-strokedark dark:bg-boxdark"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black group-hover:text-primary dark:text-white text-center line-clamp-2">
                  {teacherName}
                </h3>
                <p className="mt-2 text-sm font-semibold text-gray-500 text-center">
                  มีบันทึกการสอน {teacherRecords.length} รายการ
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal แสดงรายการบันทึกของครู */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-5xl flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-boxdark">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
              <h2 className="text-2xl font-black text-black dark:text-white flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                บันทึกการสอนของ: <span className="text-primary">{selectedTeacher}</span>
              </h2>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition hover:bg-danger hover:text-white dark:bg-boxdark"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-boxdark">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-gray-500">กรองตามสัปดาห์:</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="rounded-xl border border-stroke bg-transparent px-4 py-2 font-bold text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">ทั้งหมด</option>
                    {Array.from(new Set(records.filter(r => (r.signerName || "ไม่ระบุชื่อครูผู้สอน") === selectedTeacher).map(r => r.weekNo))).sort((a,b)=>parseInt(a)-parseInt(b)).map(w => (
                      <option key={w} value={w}>สัปดาห์ที่ {w}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedWeek && (
                    <button
                      onClick={() => {
                        const weekRecords = records
                          .filter(r => (r.signerName || "ไม่ระบุชื่อครูผู้สอน") === selectedTeacher)
                          .filter(r => String(r.weekNo) === String(selectedWeek))
                          .sort((a, b) => new Date(a.date) - new Date(b.date));
                        if(weekRecords.length > 0) {
                           triggerPrint(weekRecords);
                        }
                      }}
                      className="rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-opacity-90 flex items-center gap-2"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                      Export PDF ทั้งสัปดาห์
                    </button>
                  )}
                  <Link
                    href={`/TeachingRecordPage/new?teacher=${encodeURIComponent(selectedTeacher === "ไม่ระบุชื่อครูผู้สอน" ? "" : selectedTeacher)}`}
                    className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 flex items-center gap-2"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    เพิ่มข้อมูล
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {records
                  .filter(r => (r.signerName || "ไม่ระบุชื่อครูผู้สอน") === selectedTeacher)
                  .filter(r => selectedWeek ? String(r.weekNo) === String(selectedWeek) : true)
                  .map((record) => (
                  <div key={record._id} className="flex flex-col rounded-2xl border border-stroke bg-gray-50 p-6 shadow-sm transition hover:border-primary/50 dark:border-strokedark dark:bg-meta-4">
                     <div className="flex justify-between items-start mb-3">
                       <h3 className="text-lg font-bold text-black dark:text-white line-clamp-1 pr-4">{record.courseName}</h3>
                       <span className="shrink-0 text-xs font-bold bg-white dark:bg-boxdark text-primary px-3 py-1.5 rounded-lg shadow-sm border border-stroke dark:border-strokedark">สอนครั้งที่ {record.teachingNo}</span>
                     </div>
                     <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">เรื่อง: {record.topic}</p>
                     <p className="text-sm text-gray-500 mb-5 mt-1">วันที่สอน: {
                        ((dateString) => {
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
                        })(record.date)
                     }</p>
                     
                     <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                        <Link
                          href={`/TeachingRecordPage/${record._id}`}
                          className="flex-1 rounded-xl bg-primary/10 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-white min-w-[120px]"
                        >
                          ดูข้อมูล / แก้ไข
                        </Link>
                        <button
                          onClick={() => triggerPrint(record)}
                          className="flex-1 rounded-xl bg-indigo-500/10 py-2.5 text-center text-sm font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white min-w-[120px]"
                        >
                          Export PDF
                        </button>
                        <button
                          onClick={(e) => handleDelete(record._id, e)}
                          className="rounded-xl bg-danger/10 px-5 py-2.5 text-sm font-bold text-danger transition hover:bg-danger hover:text-white"
                        >
                          ลบ
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
