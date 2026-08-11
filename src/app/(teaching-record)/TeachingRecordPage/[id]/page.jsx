"use client";

import React, { useEffect, useState } from "react";
import TeachingRecordForm from "@/app/(components)/TeachingRecordForm";

export default function EditTeachingRecordPage({ params }) {
  const [recordId, setRecordId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // resolve params if it's a promise
    const fetchParams = async () => {
      const resolvedParams = await params;
      setRecordId(resolvedParams.id);
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (!recordId) return;

    if (recordId === "new") {
      setInitialData({});
      setLoading(false);
    } else {
      fetch(`/api/TeachingRecords/${recordId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          setInitialData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching record:", error);
          setInitialData({});
          setLoading(false);
        });
    }
  }, [recordId]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="">
      <TeachingRecordForm recordId={recordId} initialData={initialData} />
    </div>
  );
}
