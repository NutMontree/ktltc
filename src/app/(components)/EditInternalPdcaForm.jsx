"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define only the 2 required items
export const internalPdcaItems = [
  {
    id: 1,
    label: "1. แบบฟอร์มขออนุมัติโครงการ",
    file: "3.แบบฟอร์มขออนุมัติโครงการ.docx",
  },
  {
    id: 3,
    label: "2. แบบฟอร์มขออนุญาตดำเนินโครงการ",
    file: "4.แบบฟอร์มขออนุญาตดำเนินโครงการ.docx",
  },
  {
    id: 7,
    label: "3. แบบฟอร์มโครงการ",
    file: "7.แบบฟอร์มโครงการ.doc",
  },
  {
    id: 4,
    label: "4. บันทึกขออนุมัติคำสั่งแต่งตั้งคณะกรรมการดำเนินงาน",
  },
  {
    id: 5,
    label: "5. คำสั่งแต่งตั้งคณะกรรมการดำเนินงาน",
  },
  {
    id: 6,
    label: "6. บันทึกข้อความขออนุญาตประชุม",
  },
  {
    id: 8,
    label: "7. บันทึกข้อความขอเชิญประชุม",
  },
  { id: 9, label: "8. บันทึกข้อความขอรายงานการประชุม" },
  { id: 10, label: "9. บันทึกข้อความขอความอนุเคราะห์ประชาสัมพันธ์โครงการ" },
  { id: 11, label: "10. บันทึกข้อความรายงานการประชาสัมพันธ์โครงการ" },
  { id: 12, label: "11. กำหนดการจัดกิจกรรม" },
  { id: 13, label: "12. หนังสือเชิญเป็นวิทยากร/หนังสือตอบรับเป็นวิทยากร/หนังสือขอบคุณวิทยากร" },
  { id: 14, label: "13. ลายมือชื่อผู้เข้าร่วมโครงการ" },
  { id: 15, label: "14. รูปภาพการดำเนินงานโครงการ" },
  { id: 16, label: "15. บันทึกข้อความรายงานสรุปการใช้งบประมาณ" },
  { id: 17, label: "16. เอกสารชุดเบิกโครงการ" },
  { id: 18, label: "17. แบบสอบถามประเมินความพึงพอใจผู้เข้าร่วมโครงการ Google form / QR Code" },
  { id: 19, label: "18. บันทึกข้อความรายงานสรุปผลการวิเคราะห์ข้อมูลการดำเนินโครงการ" },
  { id: 20, label: "19. ผลการวิเคราะห์ข้อมูล" },
  { id: 21, label: "20. บันทึกข้อความรายงานสรุปผลการดำเนินโครงการ" },
];

const EditInternalPdcaForm = ({
  pdca = {},
  departments = [],
  fiscalYears = [],
}) => {
  const router = useRouter();
  const pdcaId = pdca?._id;
  const EDITMODE = pdcaId && pdcaId !== "new";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = (new Date().getFullYear() + 543).toString();
  const displayFiscalYears = fiscalYears.includes(currentYear) ? fiscalYears : [...fiscalYears, currentYear].sort();

  const [formData, setFormData] = useState({
    year: pdca.year || currentYear,
    department: pdca.department || departments[0] || "",
    namework: pdca.namework || "",
    nameproject: pdca.nameproject || "",
    pdcaLink: pdca.pdcaLink || "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  // Per-item PDF state: { [itemId]: File | null }
  const [itemPdfs, setItemPdfs] = useState({});
  // Existing per-item PDFs from database: { [itemId]: { url, name } }
  const [existingItemPdfs, setExistingItemPdfs] = useState({});
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);

  useEffect(() => {
    if (EDITMODE) {
      const initialFormData = { ...formData };
      internalPdcaItems.forEach((item) => {
        initialFormData[`id${item.id}`] = pdca[`id${item.id}`] || "";
      });
      setFormData(initialFormData);

      if (pdca.fileUrl && Array.isArray(pdca.fileUrl)) {
        const attachments = pdca.fileUrl.map((url, i) => ({
          fileUrl: url,
          originalFileName: pdca.originalFileName?.[i] || "Unknown File",
        }));
        setExistingAttachments(attachments);
      }

      // Load existing per-item PDFs
      const existingPdfs = {};
      internalPdcaItems.forEach((item) => {
        if (pdca[`pdf${item.id}`]) {
          existingPdfs[item.id] = {
            url: pdca[`pdf${item.id}`],
            name: pdca[`pdfName${item.id}`] || "PDF",
          };
        }
      });
      setExistingItemPdfs(existingPdfs);
    }
  }, [pdca]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? value : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // PDF Export removed

  const handleItemPdfSelect = (itemId, file) => {
    setItemPdfs((prev) => ({ ...prev, [itemId]: file }));
  };

  const handleRemoveItemPdf = (itemId) => {
    setExistingItemPdfs((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    setItemPdfs((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formToSend.append(key, formData[key]),
      );
      selectedFiles.forEach((file, i) =>
        formToSend.append(`filepdf_${i}`, file),
      );
      formToSend.append(
        "existingAttachments",
        JSON.stringify(existingAttachments),
      );

      // Append per-item PDFs (new files)
      Object.entries(itemPdfs).forEach(([itemId, file]) => {
        if (file) {
          formToSend.append(`itempdf_${itemId}`, file);
        }
      });

      // Handle existing or removed PDFs by explicitly sending empty strings for missing ones
      internalPdcaItems.forEach((item) => {
        const itemId = item.id;
        if (existingItemPdfs[itemId] && !itemPdfs[itemId]) {
          // Keep existing
          formToSend.append(`pdf${itemId}`, existingItemPdfs[itemId].url);
          formToSend.append(`pdfName${itemId}`, existingItemPdfs[itemId].name);
        } else if (!itemPdfs[itemId]) {
          // Explicitly clear removed/non-existent PDFs
          formToSend.append(`pdf${itemId}`, "");
          formToSend.append(`pdfName${itemId}`, "");
        }
      });

      const url = EDITMODE
        ? `/api/InternalPdcas/${pdcaId}`
        : "/api/InternalPdcas";
      const method = EDITMODE ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formToSend });
      if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

      const savedData = await res.json();

      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      router.push("/InternalPdcaPage");
      router.refresh();
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-2">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Main Info Card */}
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
                    <span className="text-primary">PDCA ภายใน</span>
                  </h2>
                  <p className="max-w-lg text-sm font-medium leading-relaxed text-gray-500">
                    กรอกข้อมูลรายละเอียดโครงการและแนบไฟล์เอกสารที่เกี่ยวข้องให้ครบถ้วน
                    ข้อมูลจะถูกบันทึกเข้าระบบเพื่อติดตามประเมินผล
                  </p>
                </div>
                <div className="hidden h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 to-blue-500/10 text-4xl shadow-inner backdrop-blur-md md:flex">
                  📝
                </div>
              </div>

              {error && (
                <div className="animate-shake mb-8 flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-5 text-danger">
                  <span className="text-xl">⚠️</span>
                  <p className="font-bold">{error}</p>
                </div>
              )}

              <div className="relative z-10 pt-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Year Selection */}
                  <div className="group space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      ปีงบประมาณ
                    </label>
                    <div className="relative">
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
                      >
                        {displayFiscalYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Department Selection */}
                  <div className="group space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      ฝ่ายที่รับผิดชอบ
                    </label>
                    <div className="relative">
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Work Name */}
                  <div className="group space-y-3 md:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      ชื่อสายงาน / งาน
                    </label>
                    <input
                      name="namework"
                      type="text"
                      placeholder="ระบุชื่องาน..."
                      value={formData.namework}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
                    />
                  </div>

                  {/* Project Name */}
                  <div className="group space-y-3 md:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      ชื่อโครงการ
                    </label>
                    <input
                      name="nameproject"
                      type="text"
                      placeholder="ระบุชื่อโครงการ..."
                      value={formData.nameproject}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Link Section */}
            <div className="relative z-20 border-t border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark md:p-12">
              <div className="mb-2">
                <label className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black dark:text-white">
                  <span className="text-xl">🔗</span> ลิงก์เอกสารอ้างอิงภายนอก (ถ้ามี)
                </label>
                <div className="group relative">
                  <input
                    name="pdcaLink"
                    type="url"
                    placeholder="เช่น ลิงก์ Google Drive, SharePoint หรือโฟลเดอร์ผลงาน..."
                    value={formData.pdcaLink || ""}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-6 py-4 text-sm font-bold text-black outline-none transition focus:border-primary focus:bg-white focus:shadow-md group-hover:border-primary/50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  />
                </div>
                <p className="mt-3 pl-2 text-xs font-bold text-gray-500">
                  * เคล็ดลับ: คุณสามารถแนบลิงก์ไฟล์ หรือโฟลเดอร์ Google Drive
                  แทนการอัปโหลดไฟล์ขนาดใหญ่ได้ เพื่อลดพื้นที่จัดเก็บของระบบ
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="relative z-10 border-t border-stroke bg-gray-50/50 p-6 dark:border-strokedark dark:bg-meta-4/20 md:p-12">
              <div className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 bg-white/60 p-8 text-center backdrop-blur-md transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-xl dark:border-primary/20 dark:bg-boxdark/60 md:rounded-[2.5rem] md:p-12">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white md:h-24 md:w-24">
                  <svg className="h-8 w-8 md:h-10 md:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h4 className="mb-2 text-xl font-black text-black dark:text-white md:text-2xl">
                  อัปโหลดไฟล์รายงาน (PDF)
                </h4>
                <p className="mb-8 max-w-md text-sm font-medium text-gray-500">
                  รองรับการอัปโหลดเอกสาร PDF หลายไฟล์พร้อมกันเพื่อใช้เป็นหลักฐานอ้างอิงของโครงการ
                </p>

                <div className="relative mx-auto w-full max-w-md">
                  <input
                    id="filepdf"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const validFiles = files.filter(f => f.type === "application/pdf");
                      if (validFiles.length < files.length) {
                        setError("มีไฟล์ที่ไม่ใช่ PDF ถูกข้ามไป (กรุณาเลือกเฉพาะไฟล์ PDF)");
                      } else {
                        setError(null);
                      }
                      setSelectedFiles(prev => [...prev, ...validFiles]);
                      e.target.value = "";
                    }}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-opacity-90 md:px-8 md:py-4 md:text-base">
                    เลือกไฟล์จากเครื่องคอมพิวเตอร์
                  </div>
                </div>

                {(selectedFiles.length > 0 || existingAttachments.length > 0) && (
                  <div className="mt-8 flex w-full max-w-md flex-col gap-3 text-left">
                    {/* Existing Attachments */}
                    {existingAttachments.map((attachment, idx) => (
                      <div key={`exist-${idx}`} className="flex items-center justify-between rounded-xl border border-stroke bg-gray-100 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-black text-primary">✓</span>
                          <span className="truncate text-sm font-bold text-black dark:text-white">
                            {attachment.originalFileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("ยืนยันการลบไฟล์นี้? หากบันทึกข้อมูล ไฟล์จะถูกลบออกจากระบบอย่างถาวร")) {
                              setExistingAttachments(prev => prev.filter((_, i) => i !== idx));
                            }
                          }}
                          className="ml-2 text-gray-400 hover:text-danger"
                          title="ลบไฟล์นี้"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* New Selected Files */}
                    {selectedFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="flex items-center justify-between rounded-xl border border-success/20 bg-success/10 px-4 py-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-black text-success">+</span>
                          <span className="truncate text-sm font-bold text-black dark:text-white">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="ml-2 text-gray-400 hover:text-danger"
                          title="ลบไฟล์นี้"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="overflow-hidden rounded-3xl border border-stroke bg-white shadow-2xl shadow-success/5 dark:border-strokedark dark:bg-boxdark md:rounded-[2.5rem]">
            <div 
              className="flex cursor-pointer flex-col justify-between gap-6 border-b border-stroke bg-gray-50 px-6 py-6 transition-colors hover:bg-gray-100 dark:border-strokedark dark:bg-meta-4/30 dark:hover:bg-meta-4/50 md:flex-row md:items-center md:px-8 md:py-8"
              onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            >
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-success">
                    Progress Tracking
                  </span>
                </div>
                <h3 className="text-2xl font-black leading-tight tracking-tight text-black dark:text-white md:text-3xl">
                  รายการตรวจสอบความคืบหน้า
                </h3>
                <div className="mb-4 mt-2 max-w-lg text-xs font-medium text-gray-500 md:text-sm flex items-center gap-2">
                  <span>คลิกเพื่อย่อ/ขยาย หรือเลือกรายการที่ได้ดำเนินการเสร็จสิ้น</span>
                  <span className="text-blue-500 font-bold">* คลิกที่ชื่อเพื่อดาวน์โหลดเทมเพลต (.doc)</span>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const isAllSelected = internalPdcaItems.every(item => formData[`id${item.id}`]);
                      const newFormData = { ...formData };
                      internalPdcaItems.forEach(item => {
                        newFormData[`id${item.id}`] = isAllSelected ? "" : `${item.label} ✅`;
                      });
                      setFormData(newFormData);
                    }}
                    className="group inline-flex items-center gap-3 rounded-full bg-success/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-success transition-all hover:bg-success hover:text-white hover:shadow-lg hover:shadow-success/30 active:scale-95"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white shadow-sm transition-colors group-hover:bg-white group-hover:text-success">
                      {internalPdcaItems.every((item) => !!formData[`id${item.id}`]) ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </div>
                    <span>
                      {internalPdcaItems.every((item) => !!formData[`id${item.id}`]) ? "ยกเลิกการเลือกทั้งหมด" : "เลือกรายการทั้งหมด"}
                    </span>
                  </button>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-transform dark:bg-gray-800 dark:text-gray-300 ${isChecklistOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>
              </div>
              <div className="hidden rounded-2xl border border-stroke bg-white p-4 text-right shadow-sm dark:border-strokedark dark:bg-boxdark lg:block">
                <div className="text-4xl font-black text-success">
                  {internalPdcaItems.filter((item) => formData[`id${item.id}`]).length}{" "}
                  <span className="text-xl text-gray-300 dark:text-gray-600">
                    / {internalPdcaItems.length}
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Completed Items
                </div>
              </div>
            </div>

            <div className={`transition-all duration-500 overflow-hidden ${isChecklistOpen ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
              <div className="p-6 md:p-10">
                {!EDITMODE && (
                  <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm font-bold text-yellow-800 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    กรุณาบันทึกข้อมูลโครงการเบื้องต้นก่อน เพื่อเริ่มกรอกแบบฟอร์มบันทึกข้อความและแบบฟอร์มขออนุมัติย่อย
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {internalPdcaItems.map((item, index) => {
                    const id = `id${item.id}`;
                    const valueWithCheck = `${index + 1}. ${item.label} ✅`;
                    const isChecked = !!formData[id];
                    const hasExistingPdf = !!existingItemPdfs[item.id];
                    const hasNewPdf = !!itemPdfs[item.id];
                    const hasPdf = hasExistingPdf || hasNewPdf;
                    const stepMap = { 1: 'step1', 3: 'step2', 7: 'step3', 4: 'step4', 5: 'step5', 6: 'step6', 8: 'step8', 9: 'step9', 10: 'step10', 11: 'step11', 14: 'step14', 15: 'step15', 16: 'step16', 17: 'step17', 18: 'step18', 19: 'step19', 20: 'step20', 21: 'step21' };
                    const stepPath = stepMap[item.id];

                    return (
                      <label
                        key={id}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
                          isChecked
                            ? "border-success bg-success/5 shadow-md shadow-success/10"
                            : "border-stroke bg-white hover:border-success/50 hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4/50"
                        }`}
                      >
                        {isChecked && (
                          <div className="absolute left-0 top-0 h-full w-1.5 bg-success"></div>
                        )}
                        
                        <div className="flex items-start gap-5">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-300 ${
                              isChecked
                                ? "scale-110 border-success bg-success text-white"
                                : "border-gray-300 bg-white group-hover:border-success/50 dark:border-gray-600 dark:bg-meta-4"
                            }`}
                          >
                            {isChecked && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                          </div>

                          <div className="flex-1">
                            <input
                              id={id}
                              name={id}
                              type="checkbox"
                              value={valueWithCheck}
                              checked={isChecked}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <div className={`text-base font-bold leading-tight transition-colors md:text-lg ${isChecked ? "text-success dark:text-success" : "text-black group-hover:text-success dark:text-white"}`}>
                              {item.label}
                            </div>
                            
                            {item.file && (
                              <a
                                href={`/pdf/pdca/${item.file}`}
                                download
                                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                โหลดเทมเพลต {item.file}
                              </a>
                            )}
                            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                              STEP {(index + 1).toString().padStart(2, "0")}
                            </div>
                          </div>
                        </div>

                        {EDITMODE && (
                          <div className="mt-4 flex flex-col gap-3 border-t border-stroke pt-4 dark:border-strokedark" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap items-center gap-2">
                              {stepPath && (
                                <Link
                                  href={`/InternalPdcaPage/${pdcaId}/${stepPath}`}
                                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700"
                                >
                                  ✍️ กรอกฟอร์มย่อย
                                </Link>
                              )}
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-amber-600">
                                📤 แนบ PDF หลักฐาน
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleItemPdfSelect(item.id, e.target.files[0]);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Show attached PDF for this item */}
                            {hasPdf && (
                              <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-3 py-2.5">
                                <span className="text-xl">📄</span>
                                {hasNewPdf ? (
                                  <span className="flex-1 truncate text-xs font-bold text-success">🆕 {itemPdfs[item.id].name}</span>
                                ) : (
                                  <a href={existingItemPdfs[item.id].url} target="_blank" className="flex-1 truncate text-xs font-bold text-blue-600 hover:underline">
                                    {existingItemPdfs[item.id].name}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemPdf(item.id)}
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger hover:text-white"
                                  title="ลบไฟล์ PDF"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-10 flex flex-col gap-4 border-t border-stroke pt-8 dark:border-strokedark sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-primary to-blue-600 px-12 py-3 font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-95 disabled:opacity-50 sm:h-14 sm:min-w-[280px] sm:flex-none"
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
              <div className="relative z-10 flex items-center gap-3">
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                )}
                <span className="text-sm sm:text-base">
                  {isSubmitting ? "กำลังประมวลผล..." : EDITMODE ? "อัปเดตข้อมูลทั้งหมด" : "บันทึกข้อมูลหลัก"}
                </span>
              </div>
            </button>

            <Link
              href="/InternalPdcaPage"
              className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gray-50 px-8 font-bold text-gray-600 transition-all hover:bg-gray-200 hover:text-black dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:h-14 sm:px-10"
            >
              <svg className="transition-transform group-hover:-translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>ยกเลิก</span>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditInternalPdcaForm;
