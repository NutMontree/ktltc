"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const DeleteInternalPdca = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/InternalPdcas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline text-sm font-bold"
    >
      {loading ? "กำลังลบ..." : "ลบ"}
    </button>
  );
};

export default DeleteInternalPdca;
