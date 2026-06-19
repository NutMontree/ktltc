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

  const [formData, setFormData] = useState({
    year: pdca.year || "2567",
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
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-lg dark:bg-boxdark">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold">ข้อมูลเอกสาร</h2>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-opacity-90 shadow-md"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
              <Link
                href="/InternalPdcaPage"
                className="rounded-lg bg-gray-200 px-4 py-2 font-bold"
              >
                กลับ
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold">ปีงบประมาณ</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-gray-50 p-3 dark:bg-meta-4"
              >
                {fiscalYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-bold">ฝ่ายที่รับผิดชอบ</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-gray-50 p-3 dark:bg-meta-4"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block font-bold">งาน / สายงาน</label>
              <input
                name="namework"
                value={formData.namework}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-gray-50 p-3 dark:bg-meta-4"
                placeholder="เช่น งานวางแผนและงบประมาณ"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block font-bold">ชื่อโครงการ</label>
              <input
                name="nameproject"
                value={formData.nameproject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-gray-50 p-3 dark:bg-meta-4"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-stroke bg-gray-50/50 p-6 shadow-sm dark:border-strokedark dark:bg-meta-4">
            <div 
              className="flex cursor-pointer items-center justify-between border-b border-stroke pb-4 transition hover:opacity-80 dark:border-strokedark"
              onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h3 className="text-xl font-bold text-primary">รายการตรวจสอบ</h3>
                <span className="text-xs font-bold text-gray-400">
                  * คลิกที่ชื่อเพื่อดาวน์โหลดเทมเพลต (.doc)
                </span>
              </div>
              <div className="flex items-center gap-4">
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
                  className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {internalPdcaItems.every(item => formData[`id${item.id}`]) ? "ยกเลิกการเลือกทั้งหมด" : "☑ เลือกทั้งหมด"}
                </button>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-transform dark:bg-gray-800 dark:text-gray-300 ${isChecklistOpen ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </div>
            </div>

            {isChecklistOpen && (
              <div className="mt-4 space-y-4 transition-all">

            {!EDITMODE && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
                ⚠️ กรุณาบันทึกข้อมูลโครงการเบื้องต้นก่อน
                เพื่อเริ่มกรอกแบบฟอร์มบันทึกข้อความและแบบฟอร์มขออนุมัติ
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {internalPdcaItems.map((item, idx) => {
                const fieldId = `id${item.id}`;
                const isChecked = !!formData[fieldId];
                const hasExistingPdf = !!existingItemPdfs[item.id];
                const hasNewPdf = !!itemPdfs[item.id];
                const hasPdf = hasExistingPdf || hasNewPdf;

                // Step mapping for link routing
                const stepMap = { 1: 'step1', 3: 'step2', 7: 'step3', 4: 'step4', 5: 'step5', 6: 'step6', 8: 'step8', 9: 'step9', 10: 'step10', 11: 'step11', 12: 'step12', 13: 'step13', 14: 'step14', 15: 'step15', 16: 'step16', 17: 'step17', 18: 'step18', 19: 'step19', 20: 'step20', 21: 'step21' };
                const stepPath = stepMap[item.id];

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-all ${isChecked ? "border-success bg-success/5 shadow-inner" : "border-stroke bg-gray-50 shadow-sm"}`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex flex-1 cursor-pointer items-center gap-4">
                        <input
                          type="checkbox"
                          name={fieldId}
                          value={`${item.label} ✅`}
                          checked={isChecked}
                          onChange={handleChange}
                          className="h-6 w-6 rounded-lg border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex flex-col">
                          <span
                            className={`text-lg font-bold ${isChecked ? "text-success" : "text-black dark:text-white"}`}
                          >
                            {item.label}
                          </span>
                          {item.file && (
                            <a
                              href={`/pdf/pdca/${item.file}`}
                              download
                              className="mt-1 flex items-center gap-1 text-xs text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              ดาวน์โหลดเทมเพลต: {item.file}
                            </a>
                          )}
                        </div>
                      </label>

                      {EDITMODE && (
                        <div className="flex flex-wrap gap-2">
                          {stepPath && (
                            <Link
                              href={`/InternalPdcaPage/${pdcaId}/${stepPath}`}
                              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700"
                            >
                              ✍️ กรอกข้อมูล
                            </Link>
                          )}
                          {/* Per-item PDF upload button */}
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-600">
                            📤 แนบ PDF
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
                      )}
                    </div>

                    {/* Show attached PDF for this item */}
                    {hasPdf && (
                      <div className="mt-3 ml-10 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger shrink-0"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        {hasNewPdf ? (
                          <span className="flex-1 truncate text-sm font-bold text-success">🆕 {itemPdfs[item.id].name}</span>
                        ) : (
                          <a href={existingItemPdfs[item.id].url} target="_blank" className="flex-1 truncate text-sm font-bold text-danger hover:underline">
                            📄 {existingItemPdfs[item.id].name}
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
                );
              })}
            </div>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-4 rounded-2xl border border-stroke bg-gray-50 p-6 shadow-sm dark:border-strokedark dark:bg-meta-4">
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M9 11h6"/><path d="M9 19h10"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-black dark:text-white">แนบไฟล์ PDF สรุปผล (แสกนที่มีลายเซ็นครบถ้วน)</h3>
                  <p className="text-xs font-bold text-gray-500">สำหรับเก็บเป็นหลักฐานในระบบ</p>
                </div>
              </div>
              <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold text-white dark:bg-white dark:text-black">.PDF Only</span>
            </div>
            
            {existingAttachments.length > 0 && (
              <div className="mb-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">ไฟล์ที่แนบไว้แล้ว ({existingAttachments.length})</p>
                <div className="flex flex-col gap-2">
                  {existingAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-stroke transition hover:border-primary dark:bg-boxdark dark:border-strokedark">
                      <a href={att.fileUrl} target="_blank" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 truncate">
                        📄 {att.originalFileName}
                      </a>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (confirm("ยืนยันการลบไฟล์นี้? หากบันทึกข้อมูล ไฟล์จะถูกลบออกจากระบบอย่างถาวร")) {
                            setExistingAttachments(existingAttachments.filter((_, i) => i !== idx));
                          }
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger hover:text-white"
                        title="ลบไฟล์"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
               <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">อัปโหลดไฟล์ใหม่ (เลือกได้หลายไฟล์)</p>
               <input
                 type="file"
                 accept="application/pdf"
                 multiple
                 onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                 className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-white p-6 text-center text-sm font-bold text-gray-500 transition hover:border-primary focus:outline-none dark:bg-boxdark dark:text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-black file:text-primary hover:file:bg-primary/20 cursor-pointer"
               />
               {selectedFiles.length > 0 && (
                 <p className="mt-2 text-sm font-bold text-success">✅ เลือกแล้ว {selectedFiles.length} ไฟล์</p>
               )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-opacity-90"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลหลัก"}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditInternalPdcaForm;
