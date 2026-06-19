"use client";

import React, { useState } from "react";

const DeletePdca = ({ id, type = "external" }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null); // ✅ เก็บข้อความ toast

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500); // ✅ แสดง 2.5 วิ
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      let endpoint = `/api/Pdcas/${id}`;
      if (type === "internal") endpoint = `/api/InternalPdcas/${id}`;
      if (type === "general") endpoint = `/api/GeneralMemos/${id}`;
      
      const res = await fetch(endpoint, { method: "DELETE" });

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      showToast("✅ ลบข้อมูลสำเร็จ!", "success");
      setTimeout(() => window.location.reload(), 1500); // ✅ รีโหลดหลัง Toast
    } catch (err) {
      console.error(err);
      showToast("❌ เกิดข้อผิดพลาดในการลบ", "error");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* ปุ่มลบ */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`font-semibold text-red-500 transition hover:text-red-700 ${
          loading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        ❌ ลบ
      </button>

      {/* Modal ยืนยัน */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-fadeIn w-[90%] max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              ⚠️ ยืนยันการลบข้อมูล
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
              <span className="mt-2 block text-sm text-red-500">
                การลบนี้ไม่สามารถกู้คืนได้
              </span>
            </p>



            <div className="flex justify-center gap-6">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-xl bg-red-600 px-6 py-2 text-lg text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "กำลังลบ..." : "ยืนยัน"}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                }}
                className="rounded-xl bg-gray-200 px-6 py-2 text-lg text-gray-800 shadow-md transition hover:bg-gray-300"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast แจ้งเตือน */}
      {toast && (
        <div
          className={`animate-fadeIn fixed right-5 top-5 z-60 rounded-xl px-6 py-3 text-white shadow-lg transition-all duration-500 ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
                ? "bg-red-500"
                : "bg-gray-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Animation CSS */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default DeletePdca;
