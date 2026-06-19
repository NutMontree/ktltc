"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const InternalStep17Form = ({ projectId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    content: initialData.content || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/InternalPdcas/" + projectId + "/step17", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึก" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:bg-boxdark">
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <h2 className="text-2xl font-black text-primary">เอกสารชุดเบิกโครงการ</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl bg-primary px-8 py-2 font-bold text-white"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block font-bold">ข้อมูลเพิ่มเติม / แนบลิงก์</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-2xl border bg-gray-50 p-4"
            placeholder="กรอกรายละเอียด หรือวางลิงก์ไฟล์งาน..."
          />
        </div>
      </div>
      {message && (
        <div
          className={
            "fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl " +
            (message.type === "success" ? "bg-success text-white" : "bg-danger text-white")
          }
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default InternalStep17Form;
