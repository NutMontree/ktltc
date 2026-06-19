"use client";

import { useEffect, useState, useMemo } from "react";
import PdcaCard from "@/app/(components)/PdcaCard";
import Link from "next/link";
import { internalPdcaItems } from "@/app/(components)/EditInternalPdcaForm";
import { useSession } from "next-auth/react";

const PdcaDashboard = () => {
  const [pdcas, setPdcas] = useState([]);
  const [filterYear, setFilterYear] = useState(null);
  const [filterWork, setFilterWork] = useState(null);
  const [filterDept, setFilterDept] = useState(null);
  const [selectedPdca, setSelectedPdca] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdcaItems, setPdcaItems] = useState([]);
  
  const { data: session } = useSession();
  const currentUser = session?.user || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [resPdcas, resInternalPdcas, resConfig] = await Promise.all([
          fetch(`/api/Pdcas?t=${timestamp}`, { cache: "no-store" }),
          fetch(`/api/InternalPdcas?t=${timestamp}`, { cache: "no-store" }),
          fetch(`/api/FormConfig?t=${timestamp}`, { cache: "no-store" })
        ]);
        const dataPdcas = await resPdcas.json();
        const dataInternalPdcas = await resInternalPdcas.json();
        const dataConfig = await resConfig.json();
        
        const externalPdcas = (dataPdcas.pdcas || []).map(p => {
          const attachments = [];
          if (p.fileUrl && Array.isArray(p.fileUrl)) {
            p.fileUrl.forEach((url, i) => {
              if (url) {
                attachments.push({ fileUrl: url, originalFileName: p.originalFileName?.[i] || "เอกสารแนบ" });
              }
            });
          } else if (p.fileUrl && typeof p.fileUrl === 'string') {
            attachments.push({ fileUrl: p.fileUrl, originalFileName: p.originalFileName || "เอกสารแนบ" });
          }
          return { ...p, type: 'external', attachments };
        });
        const internalPdcas = (dataInternalPdcas.pdcas || []).map(p => {
          const attachments = [];
          // Collect global file attachments
          if (p.fileUrl && Array.isArray(p.fileUrl)) {
            p.fileUrl.forEach((url, i) => {
              if (url) {
                attachments.push({ fileUrl: url, originalFileName: p.originalFileName?.[i] || "เอกสารแนบ" });
              }
            });
          }
          // Collect per-item PDF attachments
          for (let i = 1; i <= 30; i++) {
            if (p[`pdf${i}`]) {
              attachments.push({ fileUrl: p[`pdf${i}`], originalFileName: p[`pdfName${i}`] || `PDF หัวข้อ ${i}` });
            }
          }
          return { ...p, type: 'internal', attachments };
        });
        const combinedPdcas = [...externalPdcas, ...internalPdcas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setPdcas(combinedPdcas);
        setPdcaItems(dataConfig.pdcaItems || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPdcas = useMemo(
    () =>
      pdcas.filter(
        (p) =>
          (!filterYear || p.year === filterYear) &&
          (!filterWork || p.namework === filterWork) &&
          (!filterDept || p.department === filterDept)
      ),
    [pdcas, filterYear, filterWork, filterDept]
  );

  const stats = useMemo(() => {
    return {
      total: pdcas.length,
      completed: pdcas.filter(p => {
         const items = p.type === 'internal' ? internalPdcaItems : pdcaItems;
         const total = items.length;
         if (total === 0) return false;
         const done = items.filter(item => p[`id${item.id || item.value}`]).length;
         return done === total;
      }).length,
      pending: pdcas.filter(p => {
         const items = p.type === 'internal' ? internalPdcaItems : pdcaItems;
         const total = items.length;
         if (total === 0) return false;
         const done = items.filter(item => p[`id${item.id || item.value}`]).length;
         return done > 0 && done < total;
      }).length,
      departments: new Set(pdcas.map(p => p.department)).size
    };
  }, [pdcas, pdcaItems]);

  const years = Array.from(new Set(pdcas.map((p) => p.year))).sort().reverse();
  const works = Array.from(new Set(pdcas.map((p) => p.namework))).sort();
  const depts = Array.from(new Set(pdcas.map((p) => p.department))).sort();

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="bg-linear-to-r from-primary to-blue-400 bg-clip-text text-4xl font-black text-transparent dark:from-white dark:to-gray-400">
              PDCA Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              ติดตามและจัดการโครงการพัฒนาคุณภาพการศึกษาแบบครบวงจร
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/InternalPdcaPage/new"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-purple-600 px-6 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <span className="mr-2 text-xl">+</span>
              เพิ่มเอกสารภายใน
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "โครงการทั้งหมด", value: stats.total, icon: "📊", color: "bg-blue-500" },
            { label: "ดำเนินการครบ 100%", value: stats.completed, icon: "✅", color: "bg-success" },
            { label: "อยู่ระหว่างดำเนินการ", value: stats.pending, icon: "⏳", color: "bg-warning" },
            { label: "ฝ่ายที่เข้าร่วม", value: stats.departments, icon: "🏢", color: "bg-purple-500" }
          ].map((stat, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-boxdark border border-stroke dark:border-strokedark">
              <div className={`absolute -right-2 -top-2 h-16 w-16 rounded-full opacity-10 ${stat.color}`}></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">{stat.label}</p>
                  <p className="mt-1 text-3xl font-black text-black dark:text-white">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="rounded-2xl border border-stroke bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-strokedark dark:bg-boxdark/80">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Year Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-black text-black dark:text-white uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                ปีงบประมาณ
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterYear(null)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    !filterYear ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300"
                  }`}
                >
                  ทุกปี
                </button>
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setFilterYear(y)}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      filterYear === y ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Selector */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-black text-black dark:text-white uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                ฝ่ายรับผิดชอบ
              </label>
              <div className="relative">
                <select
                  value={filterDept || ""}
                  onChange={(e) => setFilterDept(e.target.value || null)}
                  className="w-full appearance-none rounded-xl border border-stroke bg-gray-50 px-5 py-3 font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">ทั้งหมดทุกฝ่าย</option>
                  {depts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                   ▼
                </div>
              </div>
            </div>

            {/* Work Selector */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-black text-black dark:text-white uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-warning"></span>
                ชื่องาน / สายงาน
              </label>
              <div className="relative">
                <select
                  value={filterWork || ""}
                  onChange={(e) => setFilterWork(e.target.value || null)}
                  className="w-full appearance-none rounded-xl border border-stroke bg-gray-50 px-5 py-3 font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">ทั้งหมดทุกงาน</option>
                  {works.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                   ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex h-80 flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="font-bold text-primary animate-pulse">กำลังดึงข้อมูล...</p>
          </div>
        ) : filteredPdcas.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-stroke bg-white py-32 text-center dark:border-strokedark dark:bg-boxdark">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-6xl">📭</div>
            <h3 className="text-2xl font-black text-black dark:text-white">ไม่พบข้อมูลที่ค้นหา</h3>
            <p className="mt-2 text-gray-500">ลองเปลี่ยนเงื่อนไขการค้นหาใหม่</p>
            <button
              onClick={() => { setFilterYear(null); setFilterDept(null); setFilterWork(null); }}
              className="mt-8 font-bold text-primary hover:underline"
            >
              รีเซ็ตตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPdcas.map((pdca) => (
              <div
                key={pdca._id}
                onClick={() => {
                  setSelectedPdca(pdca);
                  setSelectedFileUrl(pdca.attachments?.length > 0 ? pdca.attachments[0].fileUrl : (Array.isArray(pdca.fileUrl) ? null : pdca.fileUrl));
                }}
                className="cursor-pointer"
              >
                <PdcaCard pdca={pdca} activeItems={pdca.type === 'internal' ? internalPdcaItems : pdcaItems} currentUser={currentUser} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {selectedPdca && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 p-4"
          onClick={() => setSelectedPdca(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all duration-500 dark:bg-boxdark"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stroke bg-gray-50/50 px-8 py-6 backdrop-blur-md dark:border-strokedark dark:bg-gray-800/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary uppercase">{selectedPdca.year}</span>
                  <span className="text-xs font-bold text-gray-400">ID: {selectedPdca._id.slice(-6).toUpperCase()}</span>
                </div>
                <h3 className="mt-1 text-2xl font-black text-black dark:text-white truncate max-w-2xl">
                  {selectedPdca.nameproject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPdca(null)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-all hover:rotate-90 hover:bg-danger hover:text-white dark:bg-meta-4 dark:text-gray-300"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Details Section */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Info Card */}
                  <div className="rounded-2xl bg-gray-50 p-6 dark:bg-meta-4 border border-stroke dark:border-strokedark shadow-sm">
                    <h4 className="mb-4 text-sm font-black text-black dark:text-white uppercase tracking-widest border-b border-stroke dark:border-strokedark pb-2">รายละเอียดโครงการ</h4>
                    <ul className="space-y-4">
                      <li className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">ฝ่ายรับผิดชอบ</span>
                         <span className="font-bold text-black dark:text-white">{selectedPdca.department}</span>
                      </li>
                      <li className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">ชื่องาน</span>
                         <span className="font-bold text-black dark:text-white">{selectedPdca.namework}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Checklist Card */}
                  <div className="rounded-2xl bg-success/5 p-6 border border-success/10 shadow-sm">
                    {(() => {
                      const activeItems = selectedPdca.type === 'internal' ? internalPdcaItems : pdcaItems;
                      return (
                        <>
                          <h4 className="mb-4 text-sm font-black text-success uppercase tracking-widest border-b border-success/10 pb-2">รายการตรวจสอบ ({activeItems.filter((i, idx) => selectedPdca[`id${i.id || (idx + 1)}`]).length}/{activeItems.length})</h4>
                          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {activeItems.map((item, idx) => {
                              const itemId = item.id || (idx + 1);
                              const isChecked = !!selectedPdca[`id${itemId}`];
                              const hasPdf = !!selectedPdca[`pdf${itemId}`];
                              return (
                                <li key={itemId} className="flex items-start gap-3">
                                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isChecked ? 'bg-success border-success text-white' : 'border-stroke bg-white dark:border-strokedark dark:bg-boxdark'}`}>
                                    {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-success dark:text-success' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</span>
                                    {hasPdf && (
                                      <a
                                        href={selectedPdca[`pdf${itemId}`]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedFileUrl(selectedPdca[`pdf${itemId}`]);
                                        }}
                                        className="mt-1 flex items-center gap-1 text-[10px] font-bold text-danger hover:underline"
                                      >
                                        📄 {selectedPdca[`pdfName${itemId}`] || "PDF แนบ"}
                                      </a>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      );
                    })()}
                  </div>

                  {/* Attachments Card */}
                  <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10 shadow-sm">
                    <h4 className="mb-4 text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">เอกสารแนบ</h4>
                    
                    {/* External Link */}
                    {selectedPdca.pdcaLink && (
                      <div className="mb-4">
                        <a 
                          href={selectedPdca.pdcaLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 rounded-xl bg-white p-3 border border-stroke shadow-sm hover:border-primary/50 dark:bg-boxdark dark:border-strokedark transition-all group"
                        >
                          <div className="text-xl group-hover:scale-110 transition-transform">🔗</div>
                          <div className="flex-1 overflow-hidden">
                             <p className="truncate text-xs font-bold text-black dark:text-white group-hover:text-primary">ลิงก์เอกสารอ้างอิงภายนอก</p>
                             <p className="truncate text-[10px] text-gray-500">{selectedPdca.pdcaLink}</p>
                          </div>
                          <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-[10px] font-black text-primary uppercase">Open</span>
                        </a>
                      </div>
                    )}
                    {selectedPdca.attachments && selectedPdca.attachments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPdca.attachments.map((file, idx) => (
                           <div 
                              key={idx} 
                              onClick={() => setSelectedFileUrl(file.fileUrl)}
                              className={`group flex items-center justify-between rounded-xl p-3 transition-all duration-300 cursor-pointer border shadow-sm ${selectedFileUrl === file.fileUrl ? 'bg-primary border-primary text-white scale-[1.02]' : 'bg-white border-stroke hover:border-primary/50 dark:bg-boxdark dark:border-strokedark'}`}
                           >
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <div className="text-xl group-hover:scale-110 transition-transform">📄</div>
                                 <p className={`truncate text-xs font-bold ${selectedFileUrl === file.fileUrl ? 'text-white' : 'text-black dark:text-white group-hover:text-primary'}`}>{file.originalFileName}</p>
                              </div>
                              <a 
                                href={file.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`shrink-0 rounded px-2 py-1 text-[10px] font-black uppercase transition-colors ${selectedFileUrl === file.fileUrl ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary dark:bg-meta-4 dark:text-gray-300'}`} 
                                onClick={e => e.stopPropagation()}
                              >
                                ↓
                              </a>
                           </div>
                        ))}
                      </div>
                    ) : !selectedPdca.pdcaLink ? (
                      <div className="py-6 text-center">
                        <span className="text-3xl opacity-50">📁</span>
                        <p className="mt-2 text-sm italic text-gray-400">ยังไม่มีการอัปโหลดไฟล์เอกสาร</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* PDF Viewer Section */}
                <div className="lg:col-span-8">
                  <div className="h-[800px] w-full relative overflow-hidden rounded-4xl border-4 border-gray-100 bg-gray-200 dark:border-strokedark dark:bg-gray-800 shadow-inner">
                    {selectedFileUrl ? (
                      <iframe
                        src={`${selectedFileUrl}#toolbar=0`}
                        width="100%"
                        height="100%"
                        className="bg-white"
                        title="PDF Preview"
                      ></iframe>
                    ) : selectedPdca.pdcaLink ? (
                      <div className="flex h-full flex-col items-center justify-center space-y-6 text-center p-8">
                        <span className="text-8xl">🔗</span>
                        <div>
                          <h3 className="text-2xl font-black text-black dark:text-white mb-2">แนบเป็นลิงก์เอกสารภายนอก</h3>
                          <p className="text-gray-500 mb-6">ผู้ใช้งานได้แนบลิงก์สำหรับดูเอกสารแทนการอัปโหลดไฟล์</p>
                          <a 
                            href={selectedPdca.pdcaLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-opacity-90 hover:-translate-y-1"
                          >
                            เปิดลิงก์เอกสาร
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center space-y-4">
                        <span className="text-7xl opacity-20">🚫</span>
                        <p className="font-black text-gray-400 uppercase tracking-widest">No Document Found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PdcaDashboard;
