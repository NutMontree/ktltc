"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function TeachingRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div key={record._id} className="relative flex flex-col rounded-2xl border border-stroke bg-white p-6 shadow-sm transition hover:shadow-md dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-xl font-bold text-black dark:text-white">{record.courseName}</h3>
              <p className="mt-1 text-sm text-gray-500">เรื่อง: {record.topic}</p>
              <p className="text-sm text-gray-500">วันที่: {record.date}</p>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/TeachingRecordPage/${record._id}`}
                  className="flex-1 rounded-lg bg-gray-100 py-2 text-center font-bold text-primary transition hover:bg-gray-200 dark:bg-meta-4 dark:hover:bg-meta-4/80"
                >
                  แก้ไข
                </Link>
                <button
                  onClick={() => handleDelete(record._id)}
                  className="rounded-lg bg-danger/10 px-4 py-2 font-bold text-danger transition hover:bg-danger/20"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
