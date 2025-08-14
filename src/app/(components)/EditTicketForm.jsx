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

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setFormData((preState) => ({
      ...preState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (EDITMODE) {
      const res = await fetch(`/api/Tickets/${ticket._id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ formData }),
      });
      if (!res.ok) {
        throw new Error("Failed to update ticket");
      }
    } else {
      const res = await fetch("/api/Tickets", {
        method: "POST",
        body: JSON.stringify({ formData }),
        "Content-Type": "application/json",
      });
      if (!res.ok) {
        throw new Error("Failed to create ticket");
      }
    }

    router.refresh();
    router.push("/");
  };

  return (
    <>
      <div className="container">
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            method="post"
            className="flex w-full flex-col gap-3 py-24"
          >
            <h3 className="text-xl">
              {EDITMODE ? "อัพเดทข้อความใหม่" : "เพิ่มข้อความใหม่"}
            </h3>
            <label>หัวเรื่อง</label>
            <input
              id="title"
              name="title"
              type="text"
              onChange={handleChange}
              required={true}
              value={formData.title}
              // className="rounded-2xl bg-gray-100 px-4 py-2"
              className="rounded-xl border px-4 py-2"
            />
            <label>คำอธิบาย</label>
            <textarea
              id="description"
              name="description"
              onChange={handleChange}
              required={true}
              value={formData.description}
              rows="5"
              className="rounded-xl border px-4 py-2"
            />
            <label>ชื่อผู้โพส</label>
            <input
              id="category"
              name="category"
              onChange={handleChange}
              required={true}
              value={formData.category}
              rows="5"
              className="rounded-xl border px-4 py-2"
            ></input>
            <input
              type="submit"
              className="rounded-2xl bg-sky-500 px-2 py-2"
              value={EDITMODE ? "อัพเดทข้อมูล" : "ส่งข้อมูล"}
            />
            <Link
              href={"/ITA/08/qa"}
              className="px-2 py-2 text-center text-lg text-sky-800 dark:text-sky-200"
              
            >
              ย้อนกลับ
            </Link>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditTicketForm;
