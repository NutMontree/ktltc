"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const FormEditorPage = () => {
  const [pdcaItems, setPdcaItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // States for inline editing
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemText, setEditingItemText] = useState("");

  const [editingDeptIdx, setEditingDeptIdx] = useState(null);
  const [editingDeptText, setEditingDeptText] = useState("");

  const [editingYearIdx, setEditingYearIdx] = useState(null);
  const [editingYearText, setEditingYearText] = useState("");

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedDeptIndex, setDraggedDeptIndex] = useState(null);
  const [draggedYearIndex, setDraggedYearIndex] = useState(null);

  const [fiscalYears, setFiscalYears] = useState([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/FormConfig");
        const data = await res.json();
        setPdcaItems(data.pdcaItems || []);
        setDepartments(data.departments || []);
        setFiscalYears(data.fiscalYears || ["2567", "2568", "2569", "2570"]);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveConfigToDB = async (
    newItems = pdcaItems,
    newDepts = departments,
    newYears = fiscalYears,
  ) => {
    try {
      const res = await fetch("/api/FormConfig", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdcaItems: newItems, departments: newDepts, fiscalYears: newYears }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  // --- PDCA Items Handlers ---
  const handleDragStartItem = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e) => {
    e.preventDefault();
  };

  const handleDropItem = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const newItems = [...pdcaItems];
    const draggedItem = newItems.splice(draggedItemIndex, 1)[0];
    newItems.splice(targetIndex, 0, draggedItem);

    setPdcaItems(newItems);
    saveConfigToDB(newItems, departments);
    setDraggedItemIndex(null);
  };

  const handleDragEndItem = () => {
    setDraggedItemIndex(null);
  };

  // --- Department Drag Handlers ---
  const handleDragStartDept = (e, index) => {
    setDraggedDeptIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverDept = (e) => {
    e.preventDefault();
  };

  const handleDropDept = (e, targetIndex) => {
    e.preventDefault();
    if (draggedDeptIndex === null || draggedDeptIndex === targetIndex) return;

    const newDepts = [...departments];
    const draggedDept = newDepts.splice(draggedDeptIndex, 1)[0];
    newDepts.splice(targetIndex, 0, draggedDept);

    setDepartments(newDepts);
    saveConfigToDB(pdcaItems, newDepts);
    setDraggedDeptIndex(null);
  };

  const handleDragEndDept = () => {
    setDraggedDeptIndex(null);
  };

  // --- Fiscal Year Handlers ---
  const handleDragStartYear = (e, index) => {
    setDraggedYearIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOverYear = (e) => {
    e.preventDefault();
  };
  const handleDropYear = (e, targetIndex) => {
    e.preventDefault();
    if (draggedYearIndex === null || draggedYearIndex === targetIndex) return;
    const newYears = [...fiscalYears];
    const draggedYear = newYears.splice(draggedYearIndex, 1)[0];
    newYears.splice(targetIndex, 0, draggedYear);
    setFiscalYears(newYears);
    saveConfigToDB(pdcaItems, departments, newYears);
    setDraggedYearIndex(null);
  };
  const handleDragEndYear = () => setDraggedYearIndex(null);

  const handleAddYear = () => {
    const lastYear = parseInt(fiscalYears[fiscalYears.length - 1] || "2567");
    const newYear = (lastYear + 1).toString();
    const newYears = [...fiscalYears, newYear];
    setFiscalYears(newYears);
    saveConfigToDB(pdcaItems, departments, newYears);
  };

  const handleRemoveYear = (index) => {
    if (!confirm("ยืนยันการลบปีงบประมาณนี้?")) return;
    const newYears = fiscalYears.filter((_, i) => i !== index);
    setFiscalYears(newYears);
    saveConfigToDB(pdcaItems, departments, newYears);
  };

  const startEditYear = (idx, text) => {
    setEditingYearIdx(idx);
    setEditingYearText(text);
  };

  const saveEditYear = () => {
    if (!editingYearText.trim()) return showMessage("ปีงบประมาณห้ามว่างเปล่า", "error");
    const newYears = [...fiscalYears];
    newYears[editingYearIdx] = editingYearText;
    setFiscalYears(newYears);
    setEditingYearIdx(null);
    saveConfigToDB(pdcaItems, departments, newYears);
  };

  const cancelEditYear = () => {
    setEditingYearIdx(null);
  };

  const handleAddItem = () => {
    const nextId = pdcaItems.length > 0 ? Math.max(...pdcaItems.map((i) => i.id)) + 1 : 1;
    const newItem = { id: nextId, label: "รายการหัวข้อใหม่" };
    const newItems = [...pdcaItems, newItem];
    setPdcaItems(newItems);
    saveConfigToDB(newItems, departments);
  };

  const handleRemoveItem = (id) => {
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    const newItems = pdcaItems.filter((item) => item.id !== id);
    setPdcaItems(newItems);
    saveConfigToDB(newItems, departments);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemText(item.label);
  };

  const saveEditItem = () => {
    if (!editingItemText.trim()) return showMessage("ชื่อหัวข้อห้ามว่างเปล่า", "error");
    const newItems = pdcaItems.map((item) =>
      item.id === editingItemId ? { ...item, label: editingItemText } : item,
    );
    setPdcaItems(newItems);
    setEditingItemId(null);
    saveConfigToDB(newItems, departments);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
  };

  // --- Departments Handlers ---
  const handleAddDept = () => {
    const newDepts = [...departments, "หน่วยงานใหม่"];
    setDepartments(newDepts);
    saveConfigToDB(pdcaItems, newDepts);
  };

  const handleRemoveDept = (index) => {
    if (!confirm("ยืนยันการลบฝ่ายนี้?")) return;
    const newDepts = departments.filter((_, i) => i !== index);
    setDepartments(newDepts);
    saveConfigToDB(pdcaItems, newDepts);
  };

  const startEditDept = (idx, text) => {
    setEditingDeptIdx(idx);
    setEditingDeptText(text);
  };

  const saveEditDept = () => {
    if (!editingDeptText.trim()) return showMessage("ชื่อฝ่ายห้ามว่างเปล่า", "error");
    const newDepts = [...departments];
    newDepts[editingDeptIdx] = editingDeptText;
    setDepartments(newDepts);
    setEditingDeptIdx(null);
    saveConfigToDB(pdcaItems, newDepts);
  };

  const cancelEditDept = () => {
    setEditingDeptIdx(null);
  };

  const resetToDefaults = async () => {
    if (
      !confirm(
        "คำเตือน: ข้อมูลปัจจุบันทั้งหมดจะถูกลบและแทนที่ด้วยค่าเริ่มต้น 20 รายการ\nคุณต้องการกู้คืนค่าเริ่มต้นใช่หรือไม่?",
      )
    )
      return;

    // Default Items
    const DEFAULT_ITEMS = [
      "บันทึกข้อความขออนุมัติโครงการ",
      "บันทึกข้อความขออนุญาติดำเนินโครงการ",
      "โครงการ ที่ผู้บริหารลงนามแล้ว",
      "บันทึกขออนุมัติคำสั่ง",
      "คำสั่งแต่งตั้งคณะกรรมการดำเนินงาน",
      "บันทึกข้อความขออนุญาตประชุม",
      "บันทึกข้อความขอเชิญประชุม",
      "บันทึกข้อความขอรายงานการประชุม",
      "บันทึกข้อความขอความอนุเคราะห์ประชาสัมพันธ์โครงการ",
      "บันทึกข้อความรายงานการประชาสัมพันธ์โครงการ",
      "กำหนดการจัดกิจกรรม",
      "หนังสือเชิญเป็นวิทยากร/หนังสือตอบรับเป็นวิทยากร/หนังสือขอบคุณวิทยากร",
      "ลายมือชื่อผู้เข้าร่วมโครงการ",
      "รูปภาพการดำเนินงานโครงการ",
      "บันทึกข้อความรายงานสรุปการใช้งบประมาณ",
      "เอกสารชุดเบิกโครงการ",
      "แบบสอบถามประเมินความพึงพอใจผู้เข้าร่วมโครงการ Google from / QR Code",
      "บันทึกข้อความรายงานสรุปผลการวิเคราะห์ข้อมูลการดำเนินโครงการ",
      "ผลการวิเคราะห์ข้อมูล",
      "บันทึกกข้อความรายงานสรุปผลการดำเนินโครงการ",
    ].map((label, index) => ({ id: index + 1, label }));

    const DEFAULT_DEPARTMENTS = [
      "ฝ่ายยุทธศาสตร์และแผนงาน",
      "ฝ่ายพัฒนากิจการนักเรียน",
      "ฝ่ายวิชาการ",
      "ฝ่ายบริหารทรัพยากร",
    ];

    const DEFAULT_FISCAL_YEARS = ["2567", "2568", "2569", "2570"];

    setPdcaItems(DEFAULT_ITEMS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setFiscalYears(DEFAULT_FISCAL_YEARS);
    await saveConfigToDB(DEFAULT_ITEMS, DEFAULT_DEPARTMENTS, DEFAULT_FISCAL_YEARS);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === "admin1234") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      setPinInput("");
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl border border-stroke dark:bg-boxdark dark:border-strokedark text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-black text-black dark:text-white mb-2">
              เข้าสู่ระบบจัดการ
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-8">
              กรุณากรอกรหัส PIN เพื่อเข้าใช้งาน Form Editor
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-6 py-4 text-center text-2xl font-black tracking-[0.5em] text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  autoFocus
                />
                {pinError && <p className="mt-3 text-sm font-bold text-danger">{pinError}</p>}
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition-all hover:bg-opacity-90 active:scale-95"
              >
                ยืนยันรหัสผ่าน
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 animate-ping rounded-full bg-primary/20"></div>
            <div className="relative h-16 w-16 animate-spin rounded-full border-[5px] border-primary/20 border-t-primary"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="ตั้งค่าระบบฟอร์ม (Form Setup)" />

      <div className="mx-auto max-w-6xl space-y-12 pb-32">
        {/* Modern Header Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stroke dark:bg-boxdark dark:border-strokedark transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  System Config
                </span>
              </div>
              <h2 className="text-4xl font-black text-black dark:text-white tracking-tight">
                สถาปัตยกรรม<span className="text-primary">ฟอร์ม PDCA</span>
              </h2>
              <p className="text-base font-medium text-gray-500 max-w-lg">
                ควบคุมและปรับแต่งโครงสร้างการทำงานของระบบได้อย่างอิสระ
                การเปลี่ยนแปลงจะมีผลกับฟอร์มสร้างโครงการใหม่ทันที
              </p>
              <button
                onClick={resetToDefaults}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-danger hover:text-danger/70 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                กู้คืนรายการเริ่มต้น (Restore Defaults)
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="flex flex-col justify-center rounded-2xl bg-gray-50 px-6 py-4 border border-stroke dark:bg-meta-4 dark:border-strokedark">
                <span className="text-[10px] font-black uppercase text-gray-400">Total Items</span>
                <span className="text-3xl font-black text-primary">{pdcaItems.length}</span>
              </div>
              <div className="flex flex-col justify-center rounded-2xl bg-gray-50 px-6 py-4 border border-stroke dark:bg-meta-4 dark:border-strokedark">
                <span className="text-[10px] font-black uppercase text-gray-400">Departments</span>
                <span className="text-3xl font-black text-success">{departments.length}</span>
              </div>
            </div>
          </div>
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px]"></div>
        </div>

        {/* Global Toast Notification */}
        {message && (
          <div
            className={`fixed bottom-10 right-10 z-9999 flex items-center gap-4 rounded-2xl px-6 py-4 font-bold shadow-2xl animate-slide-up backdrop-blur-md ${message.type === "success" ? "bg-success/90 text-white" : "bg-danger/90 text-white"}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">
              {message.type === "success" ? "✓" : "!"}
            </span>
            {message.text}
          </div>
        )}

        {/* Section: PDCA Items */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">
                  รายการเอกสาร (Checklist)
                </h3>
                <p className="text-sm font-medium text-gray-400">กำหนดขั้นตอนการประเมินโครงการ</p>
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <span className="text-lg leading-none">+</span> เพิ่มหัวข้อใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {pdcaItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStartItem(e, index)}
                onDragOver={handleDragOverItem}
                onDrop={(e) => handleDropItem(e, index)}
                onDragEnd={handleDragEndItem}
                className={`group flex flex-col gap-5 rounded-4xl border bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-boxdark sm:flex-row sm:items-center
                  ${editingItemId === item.id ? "border-primary ring-4 ring-primary/10 scale-[1.01]" : "border-stroke dark:border-strokedark hover:border-primary/40"}
                  ${draggedItemIndex === index ? "opacity-40 scale-[0.98] border-dashed border-primary" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="cursor-grab text-gray-300 hover:text-primary active:cursor-grabbing px-2 transition-colors"
                    title="จับเพื่อเลื่อน"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                  </div>
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black transition-colors
                    ${editingItemId === item.id ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary dark:bg-meta-4"}`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="flex-1">
                  {editingItemId === item.id ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        className="w-full rounded-xl border-2 border-primary bg-white px-5 py-3 text-lg font-bold text-black outline-none shadow-sm dark:bg-meta-4 dark:text-white"
                        autoFocus
                        placeholder="พิมพ์ชื่อหัวข้อเอกสารที่นี่..."
                        onKeyDown={(e) => e.key === "Enter" && saveEditItem()}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        Press Enter ↵
                      </span>
                    </div>
                  ) : (
                    <div className="px-2">
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                        รายการที่ {index + 1}
                      </label>
                      <div className="text-xl font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                        {item.label}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-stroke pt-4 dark:border-strokedark sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6">
                  {editingItemId === item.id ? (
                    <>
                      <button
                        onClick={saveEditItem}
                        className="flex h-12 items-center justify-center rounded-xl bg-black px-8 text-sm font-black text-white shadow-md transition-all hover:bg-primary hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEditItem}
                        className="flex h-12 items-center justify-center rounded-xl bg-gray-100 px-6 text-sm font-bold text-black transition-all hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditItem(item)}
                        className="flex h-12 items-center gap-2 rounded-xl bg-gray-50 px-6 text-sm font-bold text-black transition-all hover:bg-primary/10 hover:text-primary dark:bg-meta-4 dark:text-white dark:hover:bg-primary"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/5 text-danger transition-all hover:bg-danger hover:text-white hover:scale-105 active:scale-95"
                        title="ลบรายการ"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Fiscal Years */}
        <div className="space-y-8 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">
                  ปีงบประมาณ (Fiscal Years)
                </h3>
                <p className="text-sm font-medium text-gray-400">
                  กำหนดปีงบประมาณสำหรับให้ผู้ใช้เลือกในฟอร์ม
                </p>
              </div>
            </div>
            <button
              onClick={handleAddYear}
              className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-warning px-6 text-sm font-black text-white shadow-lg shadow-warning/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-warning/30 active:translate-y-0"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <span className="text-lg leading-none">+</span> เพิ่มปีใหม่
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {fiscalYears.map((year, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStartYear(e, idx)}
                onDragOver={handleDragOverYear}
                onDrop={(e) => handleDropYear(e, idx)}
                onDragEnd={handleDragEndYear}
                className={`group flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-boxdark
                  ${editingYearIdx === idx ? "border-warning ring-4 ring-warning/10 scale-[1.02]" : "border-stroke dark:border-strokedark hover:border-warning/40"}
                  ${draggedYearIndex === idx ? "opacity-40 scale-[0.98] border-dashed border-warning" : ""}`}
              >
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div
                      className="cursor-grab text-gray-300 hover:text-warning active:cursor-grabbing transition-colors"
                      title="จับเพื่อเลื่อน"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>
                  </div>

                  {editingYearIdx === idx ? (
                    <input
                      type="text"
                      value={editingYearText}
                      onChange={(e) => setEditingYearText(e.target.value)}
                      className="w-full rounded-xl border-2 border-warning bg-white px-3 py-2 text-center text-lg font-black tracking-widest text-black outline-none shadow-sm dark:bg-meta-4 dark:text-white"
                      autoFocus
                      placeholder="เช่น 2568"
                      onKeyDown={(e) => e.key === "Enter" && saveEditYear()}
                    />
                  ) : (
                    <div className="text-3xl font-black tracking-widest text-black dark:text-white group-hover:text-warning transition-colors">
                      {year}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 border-t border-stroke pt-3 dark:border-strokedark">
                  {editingYearIdx === idx ? (
                    <>
                      <button
                        onClick={saveEditYear}
                        className="flex h-10 w-full items-center justify-center rounded-xl bg-black px-4 text-xs font-black text-white shadow-md transition-all hover:bg-warning hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEditYear}
                        className="flex h-10 w-full items-center justify-center rounded-xl bg-gray-100 px-4 text-xs font-bold text-black transition-all hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditYear(idx, year)}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 text-xs font-bold text-black transition-all hover:bg-warning/10 hover:text-warning dark:bg-meta-4 dark:text-white dark:hover:bg-warning"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleRemoveYear(idx)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/5 text-danger transition-all hover:bg-danger hover:text-white hover:scale-105 active:scale-95"
                        title="ลบปีงบประมาณ"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Departments */}
        <div className="space-y-8 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18"></path>
                  <path d="M9 8h1"></path>
                  <path d="M9 12h1"></path>
                  <path d="M9 16h1"></path>
                  <path d="M14 8h1"></path>
                  <path d="M14 12h1"></path>
                  <path d="M14 16h1"></path>
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">
                  รายชื่อฝ่าย (Departments)
                </h3>
                <p className="text-sm font-medium text-gray-400">หน่วยงานที่รับผิดชอบโครงการ</p>
              </div>
            </div>
            <button
              onClick={handleAddDept}
              className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-success px-6 text-sm font-black text-white shadow-lg shadow-success/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-success/30 active:translate-y-0"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <span className="text-lg leading-none">+</span> เพิ่มฝ่ายใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStartDept(e, idx)}
                onDragOver={handleDragOverDept}
                onDrop={(e) => handleDropDept(e, idx)}
                onDragEnd={handleDragEndDept}
                className={`group flex flex-col gap-4 rounded-4xl border bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-boxdark
                  ${editingDeptIdx === idx ? "border-success ring-4 ring-success/10 scale-[1.02]" : "border-stroke dark:border-strokedark hover:border-success/40"}
                  ${draggedDeptIndex === idx ? "opacity-40 scale-[0.98] border-dashed border-success" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="cursor-grab text-gray-300 hover:text-success active:cursor-grabbing transition-colors"
                      title="จับเพื่อเลื่อน"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-black dark:bg-meta-4 dark:text-white">
                        {idx + 1}
                      </span>
                      ฝ่ายรับผิดชอบ
                    </label>
                  </div>

                  {editingDeptIdx === idx ? (
                    <input
                      type="text"
                      value={editingDeptText}
                      onChange={(e) => setEditingDeptText(e.target.value)}
                      className="w-full rounded-xl border-2 border-success bg-white px-5 py-3 text-lg font-bold text-black outline-none shadow-sm dark:bg-meta-4 dark:text-white"
                      autoFocus
                      placeholder="พิมพ์ชื่อฝ่าย..."
                      onKeyDown={(e) => e.key === "Enter" && saveEditDept()}
                    />
                  ) : (
                    <div className="px-2 text-xl font-bold text-black dark:text-white group-hover:text-success transition-colors">
                      {dept}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-stroke pt-4 dark:border-strokedark">
                  {editingDeptIdx === idx ? (
                    <>
                      <button
                        onClick={saveEditDept}
                        className="flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-black text-white shadow-md transition-all hover:bg-success hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEditDept}
                        className="flex h-11 items-center justify-center rounded-xl bg-gray-100 px-5 text-sm font-bold text-black transition-all hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditDept(idx, dept)}
                        className="flex h-11 items-center gap-2 rounded-xl bg-gray-50 px-5 text-sm font-bold text-black transition-all hover:bg-success/10 hover:text-success dark:bg-meta-4 dark:text-white dark:hover:bg-success"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleRemoveDept(idx)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger/5 text-danger transition-all hover:bg-danger hover:text-white hover:scale-105 active:scale-95"
                        title="ลบฝ่าย"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default FormEditorPage;
