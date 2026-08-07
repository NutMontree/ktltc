"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TeachingRecordForm = ({ recordId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const EDITMODE = recordId !== "new";

  const [formData, setFormData] = useState({
    semester: initialData.semester || "1",
    academicYear: initialData.academicYear || "2569",
    courseCode: initialData.courseCode || "",
    courseName: initialData.courseName || "",
    teachingNo: initialData.teachingNo || "",
    date: initialData.date || "",
    weekNo: initialData.weekNo || "",
    unitNo: initialData.unitNo || "",
    unitName: initialData.unitName || "",
    topic: initialData.topic || "",
    activities: initialData.activities || "",
    isTheory: initialData.isTheory || false,
    isPractice: initialData.isPractice || true,
    results: initialData.results || "",
    problems: initialData.problems || "",
    signerName: initialData.signerName || "",
    headName: initialData.headName || "นางกิ่งดาว บุญประสิทธิ์",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const method = EDITMODE ? "PUT" : "POST";
      const endpoint = EDITMODE ? `/api/TeachingRecords/${recordId}` : `/api/TeachingRecords`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("บันทึกไม่สำเร็จ");
      }

      setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
      setTimeout(() => {
        setMessage(null);
        if (!EDITMODE) {
          router.push("/TeachingRecordPage");
          router.refresh();
        }
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาดในการบันทึก" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");

    const toThaiDigits = (str) => {
      if (!str) return "";
      return str.toString(); 
    };

    const checkTheory = formData.isTheory ? "☑" : "☐";
    const checkPractice = formData.isPractice ? "☑" : "☐";

    printWindow.document.write(`
      <html>
        <head>
          <title>บันทึกหลังการสอน - ${formData.courseName}</title>
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
            @page { size: A4; margin: 0; }
            body { 
              font-family: 'TH Sarabun New', sans-serif; 
              font-size: 16pt; 
              line-height: 1.3; 
              margin: 0;
              padding: 2cm 2.5cm;
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
            .para { text-indent: 1.5cm; text-align: justify; white-space: pre-line; }
            .checkbox-group { text-align: center; margin: 15px 0; font-size: 18pt;}
            .signature-section { display: flex; justify-content: space-around; margin-top: 40px; }
            .signature-box { text-align: center; width: 40%; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div class="header-title">บันทึกหลังการสอน รายวิชา ภาคเรียนที่ ${formData.semester} ปีการศึกษา ${formData.academicYear}</div>
            <div class="header-subtitle">วิทยาลัยเทคนิคกันทรลักษ์</div>
            <div class="flex-row">
              <span style="font-weight:bold;">รหัสวิชา</span><span style="margin-left: 5px; margin-right:15px;">${formData.courseCode}</span>
              <span style="font-weight:bold;">ชื่อวิชา</span><span style="margin-left: 5px;">${formData.courseName}</span>
            </div>
            <div class="flex-row">
              <span style="font-weight:bold;">สอนครั้งที่</span><span style="margin-left: 5px; margin-right:15px;">${formData.teachingNo}</span>
              <span style="font-weight:bold;">วันที่</span><span style="margin-left: 5px; margin-right:15px;">${formData.date}</span>
              <span style="font-weight:bold;">สัปดาห์ที่</span><span style="margin-left: 5px; margin-right:15px;">${formData.weekNo}</span>
              <span style="font-weight:bold;">หน่วยการเรียนรู้ที่</span><span style="margin-left: 5px;">${formData.unitNo}</span>
            </div>
            <div class="flex-row">
              <span style="font-weight:bold;">ชื่อหน่วย</span><span style="margin-left: 5px;">${formData.unitName}</span>
            </div>
            <div class="flex-row">
              <span style="font-weight:bold;">เรื่อง</span><span style="margin-left: 5px;">${formData.topic}</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">1. กิจกรรมการเรียนการสอน</div>
            <div class="para">${formData.activities}</div>
            <div class="checkbox-group">
              <span style="margin-right: 40px;">${checkTheory} ทฤษฎี</span>
              <span>${checkPractice} ปฏิบัติ</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">2. ผลการดำเนินกิจกรรมการเรียนการสอน</div>
            <div class="para">${formData.results}</div>
          </div>

          <div class="content-section">
            <div class="section-title">3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา</div>
            <div class="para">${formData.problems}</div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div style="margin-bottom: 40px;">ลงชื่อ.........................................................</div>
              <div>( ${formData.signerName || "...................................."} )</div>
              <div>ครูผู้สอน</div>
            </div>
            <div class="signature-box">
              <div style="margin-bottom: 40px;">ลงชื่อ.........................................................</div>
              <div>( ${formData.headName || "...................................."} )</div>
              <div>หัวหน้าแผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</div>
            </div>
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderInput = (label, name, placeholder = "", colSpan = "col-span-1") => (
    <div className={`group space-y-3 ${colSpan}`}>
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        {label}
      </label>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
      />
    </div>
  );

  const renderTextarea = (label, name, rows = 3) => (
    <div className="group space-y-3 mt-8">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={formData[name]}
        onChange={handleChange}
        className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-2">
      <form onSubmit={handleSave} className="space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-stroke bg-white/90 shadow-2xl shadow-primary/5 backdrop-blur-xl dark:border-strokedark dark:bg-boxdark/90 md:rounded-[2.5rem]">
          
          <div className="relative overflow-hidden bg-white px-6 py-8 dark:bg-boxdark md:px-12 md:py-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"></div>

            <div className="relative z-10 flex flex-col justify-between gap-8 border-b border-stroke pb-8 dark:border-strokedark md:flex-row md:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Registration Form
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-black dark:text-white md:text-4xl">
                  {EDITMODE ? "แก้ไขข้อมูล" : "แบบฟอร์มบันทึก"}{" "}
                  <span className="text-primary">การสอน (PDCA)</span>
                </h2>
                <p className="max-w-lg text-sm font-medium leading-relaxed text-gray-500">
                  กรอกข้อมูลรายละเอียดการสอนประจำสัปดาห์ให้ครบถ้วน ข้อมูลจะถูกนำไปใช้ออกแบบฟอร์ม PDF บันทึกหลังการสอน
                </p>
              </div>
              <div className="hidden h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 to-blue-500/10 text-4xl shadow-inner backdrop-blur-md md:flex">
                📝
              </div>
            </div>

            <div className="relative z-10 pt-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {renderInput("ภาคเรียนที่", "semester")}
                {renderInput("ปีการศึกษา", "academicYear")}
                {renderInput("รหัสวิชา", "courseCode")}
                {renderInput("ชื่อวิชา", "courseName")}

                {renderInput("สอนครั้งที่", "teachingNo")}
                {renderInput("วันที่", "date")}
                {renderInput("สัปดาห์ที่", "weekNo")}
                {renderInput("หน่วยการเรียนรู้ที่", "unitNo")}

                {renderInput("ชื่อหน่วย", "unitName", "", "md:col-span-2")}
                {renderInput("เรื่อง", "topic", "", "md:col-span-2")}
              </div>
            </div>
          </div>

          <div className="relative z-20 border-t border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark md:p-12">
            <h3 className="text-xl font-black text-black dark:text-white mb-6 flex items-center gap-2">
              <span className="text-primary">▶</span> รายละเอียดการสอน
            </h3>
            
            {renderTextarea("1. กิจกรรมการเรียนการสอน", "activities", 4)}
            
            <div className="mt-4 flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${formData.isTheory ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                  {formData.isTheory && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <input type="checkbox" name="isTheory" checked={formData.isTheory} onChange={handleChange} className="hidden" />
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary dark:text-gray-300">ทฤษฎี</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${formData.isPractice ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                  {formData.isPractice && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <input type="checkbox" name="isPractice" checked={formData.isPractice} onChange={handleChange} className="hidden" />
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary dark:text-gray-300">ปฏิบัติ</span>
              </label>
            </div>

            {renderTextarea("2. ผลการดำเนินกิจกรรมการเรียนการสอน", "results", 3)}
            {renderTextarea("3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา", "problems", 3)}
          </div>

          <div className="relative z-10 border-t border-stroke bg-gray-50/50 p-6 dark:border-strokedark dark:bg-meta-4/20 md:p-12">
            <h3 className="text-xl font-black text-black dark:text-white mb-6 flex items-center gap-2">
              <span className="text-primary">✍️</span> การลงนาม
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {renderInput("ชื่อครูผู้สอน", "signerName")}
              {renderInput("ชื่อหัวหน้าแผนก", "headName")}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-stroke pt-8 dark:border-strokedark sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleExportPDF}
            className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-success px-8 py-3 font-black text-white shadow-xl shadow-success/30 transition-all hover:scale-[1.02] hover:shadow-success/40 active:scale-95 disabled:opacity-50 sm:h-14 sm:min-w-[200px] sm:flex-none"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
            <div className="relative z-10 flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="text-sm sm:text-base">Export PDF</span>
            </div>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-primary to-blue-600 px-12 py-3 font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-95 disabled:opacity-50 sm:h-14 sm:min-w-[280px] sm:flex-none"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
            <div className="relative z-10 flex items-center gap-3">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              )}
              <span className="text-sm sm:text-base">
                {loading ? "กำลังประมวลผล..." : EDITMODE ? "อัปเดตข้อมูลทั้งหมด" : "บันทึกข้อมูลหลัก"}
              </span>
            </div>
          </button>

          <Link
            href="/TeachingRecordPage"
            className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gray-50 px-8 font-bold text-gray-600 transition-all hover:bg-gray-200 hover:text-black dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:h-14 sm:px-10"
          >
            <svg className="transition-transform group-hover:-translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>ยกเลิก</span>
          </Link>
        </div>
      </form>

      {message && (
        <div className={`fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl ${message.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default TeachingRecordForm;
