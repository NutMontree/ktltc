"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const EditPdcaForm = ({ pdca }) => {
  const EDITMODE = pdca && pdca._id !== "new";
  const router = useRouter();

  const [departments, setDepartments] = useState([
    "ฝ่ายยุทธศาสตร์และแผนงาน",
    "ฝ่ายพัฒนากิจการนักเรียน",
    "ฝ่ายวิชาการ",
    "ฝ่ายบริหารทรัพยากร",
  ]);
  const [fiscalYears, setFiscalYears] = useState(["2567", "2568", "2569", "2570"]);
  const [pdcaItems, setPdcaItems] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const currentYear = (new Date().getFullYear() + 543).toString();
  const displayFiscalYears = fiscalYears.includes(currentYear) ? fiscalYears : [...fiscalYears, currentYear].sort();

  const [formData, setFormData] = useState({
    year: currentYear,
    department: departments[0],
    namework: "",
    nameproject: "",
    pdcaLink: "",
    id1: "",
    id2: "",
    id3: "",
    id4: "",
    id5: "",
    id6: "",
    id7: "",
    id8: "",
    id9: "",
    id10: "",
    id11: "",
    id12: "",
    id13: "",
    id14: "",
    id15: "",
    id16: "",
    id17: "",
    id18: "",
    id19: "",
    id20: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/FormConfig");
        const data = await res.json();
        if (data.departments) setDepartments(data.departments);
        if (data.pdcaItems) setPdcaItems(data.pdcaItems);
        if (data.fiscalYears) setFiscalYears(data.fiscalYears);

        if (!EDITMODE) {
          setFormData((prev) => ({
            ...prev,
            department: data.departments?.length > 0 ? data.departments[0] : prev.department,
            year:
              data.fiscalYears?.length > 0
                ? data.fiscalYears[data.fiscalYears.length - 1]
                : prev.year,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch form config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [EDITMODE]);

  useEffect(() => {
    if (EDITMODE && pdca) {
      // Dynamically load all checklist states from the database
      const checklistData = {};
      Object.keys(pdca).forEach((key) => {
        if (key.startsWith("id") && typeof pdca[key] === "string") {
          checklistData[key] = pdca[key];
        }
      });

      setFormData((prev) => ({
        ...prev,
        year: pdca.year || currentYear,
        department: pdca.department || departments[0],
        namework: pdca.namework || "",
        nameproject: pdca.nameproject || "",
        pdcaLink: pdca.pdcaLink || "",
        ...checklistData,
      }));

      // Load existing attachments correctly
      if (pdca.attachments && pdca.attachments.length > 0) {
        setExistingAttachments(pdca.attachments);
      } else if (pdca.fileUrl) {
        setExistingAttachments([
          { fileUrl: pdca.fileUrl, originalFileName: pdca.originalFileName },
        ]);
      }
    }
  }, [EDITMODE, pdca]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? value : "") : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach((file) => {
      if (file.type !== "application/pdf") {
        setError("มีไฟล์ที่ไม่ใช่ PDF ถูกข้ามไป (กรุณาเลือกเฉพาะไฟล์ PDF)");
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setError(null);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    // Clear input so same file can be selected again if needed
    e.target.value = "";
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    const newFormData = { ...formData };

    // Toggle logic: if all items are currently checked, deselect all. Otherwise, select all.
    const allSelected =
      pdcaItems.length > 0 && pdcaItems.every((item) => !!formData[`id${item.id}`]);

    if (allSelected) {
      // Deselect all
      pdcaItems.forEach((item) => {
        newFormData[`id${item.id}`] = "";
      });
    } else {
      // Select all
      pdcaItems.forEach((item, index) => {
        newFormData[`id${item.id}`] = `${index + 1}. ${item.label} ✅`;
      });
    }

    setFormData(newFormData);
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (index) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formToSend = new FormData();
      formToSend.append("year", formData.year);
      formToSend.append("department", formData.department);
      formToSend.append("namework", formData.namework);
      formToSend.append("nameproject", formData.nameproject);
      formToSend.append("pdcaLink", formData.pdcaLink || "");

      selectedFiles.forEach((file, index) => {
        formToSend.append(`filepdf_${index}`, file);
      });

      formToSend.append("existingAttachments", JSON.stringify(existingAttachments));

      // Map dynamic checklist items instead of hardcoding 1-20
      pdcaItems.forEach((item) => {
        const key = `id${item.id}`;
        // If the item is checked, it will have a value, otherwise send empty string to clear it
        formToSend.append(key, formData[key] || "");
      });

      const url = EDITMODE ? `/api/Pdcas/${pdca._id}` : "/api/Pdcas";
      const method = EDITMODE ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save data");
      }

      router.refresh();
      router.push("/pdca");
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
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
                    <span className="text-primary">PDCA</span>
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                  <svg
                    className="h-8 w-8 md:h-10 md:w-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                    onChange={handleFileChange}
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
                      <div
                        key={`exist-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-stroke bg-gray-100 px-4 py-3 dark:border-strokedark dark:bg-meta-4"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-black text-primary">✓</span>
                          <span className="truncate text-sm font-bold text-black dark:text-white">
                            {attachment.originalFileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingAttachment(idx)}
                          className="ml-2 text-gray-400 hover:text-danger"
                          title="ลบไฟล์นี้"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* New Selected Files */}
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-success/20 bg-success/10 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-black text-success">+</span>
                          <span className="truncate text-sm font-bold text-black dark:text-white">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(idx)}
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
            <div className="flex flex-col justify-between gap-6 border-b border-stroke bg-gray-50 px-6 py-6 dark:border-strokedark dark:bg-meta-4/30 md:flex-row md:items-center md:px-8 md:py-8">
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
                <p className="mb-4 mt-2 max-w-lg text-xs font-medium text-gray-500 md:text-sm">
                  คลิกเลือกรายการที่ได้ดำเนินการเสร็จสิ้นเรียบร้อยแล้ว
                  ระบบจะบันทึกสถานะโครงการตามรายการที่ท่านเลือก
                </p>

                <button
                  onClick={handleSelectAll}
                  type="button"
                  className="group inline-flex items-center gap-3 rounded-full bg-success/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-success transition-all hover:bg-success hover:text-white hover:shadow-lg hover:shadow-success/30 active:scale-95"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white shadow-sm transition-colors group-hover:bg-white group-hover:text-success">
                    {pdcaItems.length > 0 &&
                    pdcaItems.every((item) => !!formData[`id${item.id}`]) ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span>
                    {pdcaItems.length > 0 && pdcaItems.every((item) => !!formData[`id${item.id}`])
                      ? "ยกเลิกการเลือกทั้งหมด"
                      : "เลือกรายการทั้งหมด"}
                  </span>
                </button>
              </div>
              <div className="hidden rounded-2xl border border-stroke bg-white p-4 text-right shadow-sm dark:border-strokedark dark:bg-boxdark lg:block">
                <div className="text-4xl font-black text-success">
                  {pdcaItems.filter((item) => formData[`id${item.id}`]).length}{" "}
                  <span className="text-xl text-gray-300 dark:text-gray-600">
                    / {pdcaItems.length}
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Completed Items
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {pdcaItems.map((item, index) => {
                  const id = `id${item.id}`;
                  const valueWithCheck = `${index + 1}. ${item.label} ✅`;
                  const isChecked = !!formData[id];

                  return (
                    <label
                      key={id}
                      className={`group relative flex cursor-pointer items-start gap-5 overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
                        isChecked
                          ? "border-success bg-success/5 shadow-md shadow-success/10"
                          : "border-stroke bg-white hover:border-success/50 hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4/50"
                      }`}
                    >
                      {isChecked && (
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-success"></div>
                      )}

                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-300 ${
                          isChecked
                            ? "scale-110 border-success bg-success text-white"
                            : "border-gray-300 bg-white group-hover:border-success/50 dark:border-gray-600 dark:bg-meta-4"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
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
                        <div
                          className={`text-base font-bold leading-tight transition-colors md:text-lg ${isChecked ? "text-success dark:text-success" : "text-black group-hover:text-success dark:text-white"}`}
                        >
                          {item.label}
                        </div>
                        <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          STEP {(index + 1).toString().padStart(2, "0")}
                        </div>
                      </div>
                    </label>
                  );
                })}
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
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                )}
                <span className="text-sm sm:text-base">
                  {isSubmitting
                    ? "กำลังประมวลผล..."
                    : EDITMODE
                      ? "อัปเดตข้อมูลทั้งหมด"
                      : "บันทึกข้อมูลโครงการ"}
                </span>
              </div>
            </button>

            <Link
              href="/pdca"
              className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gray-50 px-8 font-bold text-gray-600 transition-all hover:bg-gray-200 hover:text-black dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:h-14 sm:px-10"
            >
              <svg
                className="transition-transform group-hover:-translate-x-1"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>ยกเลิก</span>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditPdcaForm;
