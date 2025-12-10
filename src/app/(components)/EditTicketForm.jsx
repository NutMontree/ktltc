"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EditTicketForm = ({ ticket }) => {
  const EDITMODE = ticket._id === "new" ? false : true;
  const router = useRouter();

  const startingTicketData = {
    title: "",
    description: "",
    category: "",
  };

  if (EDITMODE) {
    startingTicketData["title"] = ticket.title;
    startingTicketData["description"] = ticket.description;
    startingTicketData["category"] = ticket.category;
  }

  const [formData, setFormData] = useState(startingTicketData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((preState) => ({
      ...preState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (EDITMODE) {
        const res = await fetch(`/api/Tickets/${ticket._id}`, {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ formData }),
        });
        if (!res.ok) throw new Error("Failed to update ticket");
      } else {
        const res = await fetch("/api/Tickets", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ formData }),
        });
        if (!res.ok) throw new Error("Failed to create ticket");
      }

      router.refresh();
      router.push("/ITA/08/qa");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-gray-50 to-blue-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {EDITMODE ? "🛠️ แก้ไขความคิดเห็น" : "💬 เพิ่มความคิดเห็นใหม่"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            กรุณากรอกข้อมูลให้ครบถ้วนก่อนกดส่ง
          </p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-500"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-gray-5000 mb-1 block font-medium"
            >
              หัวเรื่อง
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="กรอกหัวข้อที่ต้องการโพสต์..."
              onChange={handleChange}
              value={formData.title}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-gray-5000 mb-1 block font-medium"
            >
              คำอธิบาย
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="อธิบายรายละเอียดเพิ่มเติม..."
              onChange={handleChange}
              value={formData.description}
              required
              rows="5"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="text-gray-5000 mb-1 block font-medium"
            >
              ชื่อผู้โพสต์
            </label>
            <input
              id="category"
              name="category"
              placeholder="ระบุชื่อของคุณ..."
              onChange={handleChange}
              value={formData.category}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/ITA/08/qa"
              className="rounded-full border border-blue-300 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-50"
            >
              ⬅️ ย้อนกลับ
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-full px-6 py-2 font-semibold text-white shadow-md transition-transform duration-200 ${
                isSubmitting
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-blue-500 hover:scale-105 hover:bg-blue-600"
              }`}
            >
              {isSubmitting
                ? "⏳ กำลังส่ง..."
                : EDITMODE
                  ? "💾 อัพเดตข้อมูล"
                  : "🚀 ส่งความคิดเห็น"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketForm;
