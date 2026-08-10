"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function TeachingRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeacher, setSelectedTeacher] = useState(null);

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
    if (e) e.stopPropagation();
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

  const teachers = Array.from(new Set(records.map((r) => r.signerName || "ไม่ระบุชื่อครูผู้สอน")));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">บันทึกการสอน</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลบันทึกหลังการสอน (แยกตามครูผู้สอน)</p>
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
              <div className="mb-6 flex justify-end">
                <Link
                  href={`/TeachingRecordPage/new?teacher=${encodeURIComponent(selectedTeacher === "ไม่ระบุชื่อครูผู้สอน" ? "" : selectedTeacher)}`}
                  className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 flex items-center gap-2"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  เพิ่มข้อมูล (สำหรับครูท่านนี้)
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {records
                  .filter(r => (r.signerName || "ไม่ระบุชื่อครูผู้สอน") === selectedTeacher)
                  .map((record) => (
                  <div key={record._id} className="flex flex-col rounded-2xl border border-stroke bg-gray-50 p-6 shadow-sm transition hover:border-primary/50 dark:border-strokedark dark:bg-meta-4">
                     <div className="flex justify-between items-start mb-3">
                       <h3 className="text-lg font-bold text-black dark:text-white line-clamp-1 pr-4">{record.courseName}</h3>
                       <span className="shrink-0 text-xs font-bold bg-white dark:bg-boxdark text-primary px-3 py-1.5 rounded-lg shadow-sm border border-stroke dark:border-strokedark">สอนครั้งที่ {record.teachingNo}</span>
                     </div>
                     <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">เรื่อง: {record.topic}</p>
                     <p className="text-sm text-gray-500 mb-5 mt-1">วันที่สอน: {record.date}</p>
                     
                     <div className="mt-auto flex gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                        <Link
                          href={`/TeachingRecordPage/${record._id}`}
                          className="flex-1 rounded-xl bg-primary/10 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                        >
                          ดูข้อมูล / แก้ไข
                        </Link>
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
