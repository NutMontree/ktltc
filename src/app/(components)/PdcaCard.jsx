"use client";

import DeletePdca from "./DeletePdca";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const PdcaCard = ({ pdca, activeItems = [] }) => {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowPinModal(true);
    setPinInput("");
    setPinError("");
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === "admin1234") {
      setShowPinModal(false);
      router.push(pdca.type === "internal" ? `/InternalPdcaPage/${pdca._id}` : `/PdcaPage/${pdca._id}`);
    } else {
      setPinError("รหัส PIN ไม่ถูกต้อง");
    }
  };
  const formatThaiDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createdDateTime = formatThaiDate(pdca.createdAt);
  
  // Calculate completion percentage dynamically based on form configuration
  const totalItems = activeItems.length;
  const completedItems = activeItems.filter(item => pdca[`id${item.id || item.value}`]).length;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-1 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-800">
      {/* Background Accent Gradient */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20"></div>
      
      <div className="relative h-full rounded-[14px] bg-white p-6 dark:bg-gray-900">
        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {pdca.year} Budget Year
            </span>
            {pdca.type === "internal" && (
              <span className="mb-2 ml-2 inline-block rounded-md bg-purple-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                เอกสารภายใน
              </span>
            )}
            <h3 className="line-clamp-2 text-lg font-bold text-black transition-colors duration-300 group-hover:text-primary dark:text-white">
              {pdca.nameproject}
            </h3>
          </div>
          <div 
            className="flex shrink-0 gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 relative z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEditClick}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <DeletePdca id={pdca._id} type={pdca.type} />
          </div>
        </div>

        {/* Info Grid - Changed to vertical for better readability of long names */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v18Z"/><path d="M6 18H2v2c0 1.1.9 2 2 2h2Z"/><path d="M10 22v-4h4v4Z"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ฝ่ายที่รับผิดชอบ</p>
              <p className="truncate text-sm font-bold text-black dark:text-white">{pdca.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">งาน / สายงาน</p>
              <p className="truncate text-sm font-bold text-black dark:text-white">{pdca.namework}</p>
            </div>
          </div>
        </div>


        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500">เอกสารที่ดำเนินการ</span>
            <span className={percentage === 100 ? "text-success" : "text-primary"}>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div 
              className={`h-full transition-all duration-1000 ${percentage === 100 ? "bg-success" : "bg-primary"}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-[10px] text-gray-400">สร้างเมื่อ: {createdDateTime}</span>
          <div className="flex flex-wrap gap-2">
            {(() => {
              // Collect all valid file links
              const allFiles = [];
              
              // From attachments array
              if (pdca.attachments && Array.isArray(pdca.attachments)) {
                pdca.attachments.forEach((att) => {
                  if (att.fileUrl) allFiles.push({ url: att.fileUrl, name: att.originalFileName || "PDF" });
                });
              }
              
              // From fileUrl array (if no attachments)
              if (allFiles.length === 0 && pdca.fileUrl && Array.isArray(pdca.fileUrl)) {
                pdca.fileUrl.forEach((url, i) => {
                  if (url) allFiles.push({ url, name: pdca.originalFileName?.[i] || "PDF" });
                });
              }
              
              // From fileUrl string
              if (allFiles.length === 0 && pdca.fileUrl && typeof pdca.fileUrl === 'string' && pdca.fileUrl) {
                allFiles.push({ url: pdca.fileUrl, name: pdca.originalFileName || "PDF" });
              }
              
              if (allFiles.length > 0) {
                return allFiles.slice(0, 3).map((f, idx) => (
                  <a
                    key={idx}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-danger hover:underline bg-danger/10 px-2 py-1 rounded-md"
                    title={f.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                    {f.name.length > 12 ? f.name.substring(0,12) + '...' : f.name}
                  </a>
                ));
              }
              
              return <span className="text-[10px] italic text-gray-400">ไม่มีไฟล์แนบ</span>;
            })()}
          </div>
        </div>
      </div>

      {/* PIN Verification Modal for Editing */}
      {showPinModal && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-black text-black dark:text-white uppercase tracking-widest">
              🔐 ยืนยันสิทธิ์
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              กรุณากรอกรหัส PIN (8 หลัก) เพื่อแก้ไขข้อมูล
            </p>
            
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                placeholder="รหัส PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="mb-4 w-full rounded-xl border-2 border-stroke bg-gray-50 px-6 py-3 text-center text-xl font-black tracking-[0.5em] outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
              
              {pinError && (
                <p className="mb-4 text-sm font-bold text-red-500 animate-pulse">
                  {pinError}
                </p>
              )}
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-4/80"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-white transition hover:bg-opacity-90 shadow-lg shadow-primary/30"
                >
                  ยืนยัน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdcaCard;
