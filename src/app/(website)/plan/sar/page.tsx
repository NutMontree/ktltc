"use client";

import React, { useState, useEffect } from "react";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  Accordion,
  AccordionItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FilePdfOutlined,
  DownloadOutlined,
  ReadOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ISarDocument {
  _id: string;
  year: string;
  title: string;
  file: string;
}

interface ISarLog {
  _id: string;
  userName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  details: string;
  timestamp: string;
}

export default function SarPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toLowerCase() || "";
  const isTeacher = ["teacher", "admin", "super_admin"].includes(userRole || "");
  const isSuperAdmin = userRole === "super_admin";

  const [documents, setDocuments] = useState<ISarDocument[]>([]);
  const [logs, setLogs] = useState<ISarLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Documents
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({ year: "", title: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Logs (Super Admin only)
  const { isOpen: isLogOpen, onOpen: onLogOpen, onClose: onLogClose } = useDisclosure();
  const [editLogData, setEditLogData] = useState<{ id: string; details: string } | null>(null);
  const [isLogSubmitting, setIsLogSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/plan/sar/logs");
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/plan/sar");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        toast.error("Failed to load documents");
      }
      await fetchLogs();
    } catch (error) {
      console.error(error);
      toast.error("Error loading documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setFormData({ year: "", title: "" });
    setSelectedFile(null);
    onOpen();
  };

  const handleEdit = (doc: ISarDocument) => {
    setIsEditMode(true);
    setCurrentId(doc._id);
    setFormData({ year: doc.year, title: doc.title });
    setSelectedFile(null);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?")) return;
    try {
      const res = await fetch(`/api/plan/sar/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบเอกสารสำเร็จ");
        fetchDocuments();
      } else {
        toast.error("ไม่สามารถลบเอกสารได้");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการลบเอกสาร");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.title) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!isEditMode && !selectedFile) {
      toast.error("กรุณาเลือกไฟล์ PDF");
      return;
    }

    setIsSubmitting(true);
    let fileUrl = "";

    try {
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.secure_url || uploadData.url;
      }

      const payload = {
        year: formData.year,
        title: formData.title,
        ...(fileUrl && { file: fileUrl }),
      };

      const url = isEditMode ? `/api/plan/sar/${currentId}` : "/api/plan/sar";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditMode && !fileUrl ? { ...payload, file: documents.find(d => d._id === currentId)?.file } : payload),
      });

      if (res.ok) {
        toast.success(isEditMode ? "แก้ไขเอกสารสำเร็จ" : "เพิ่มเอกสารสำเร็จ");
        onClose();
        fetchDocuments();
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Log Handlers ---
  const handleEditLog = (log: ISarLog) => {
    setEditLogData({ id: log._id, details: log.details });
    onLogOpen();
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLogData) return;
    setIsLogSubmitting(true);
    try {
      const res = await fetch(`/api/plan/sar/logs/${editLogData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: editLogData.details }),
      });
      if (res.ok) {
        toast.success("อัพเดทประวัติสำเร็จ");
        onLogClose();
        fetchLogs();
      } else {
        toast.error("ไม่สามารถอัพเดทประวัติได้");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsLogSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("ยืนยันการลบประวัตินี้?")) return;
    try {
      const res = await fetch(`/api/plan/sar/logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบประวัติสำเร็จ");
        fetchLogs();
      } else {
        toast.error("ลบประวัติไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  // Animation Styles
  const containerVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemClasses = {
    base: "py-0 w-full mb-4",
    title: "font-semibold text-base text-slate-800 dark:text-slate-100",
    subtitle: "text-xs text-slate-400",
    trigger:
      "px-6 py-4 bg-white dark:bg-neutral-900 data-[hover=true]:bg-slate-50 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm transition-all",
    indicator: "text-medium text-slate-400",
    content:
      "text-small px-4 pb-6 bg-white dark:bg-neutral-900 rounded-b-2xl border-x border-b border-slate-100 dark:border-neutral-800 -mt-2 pt-6",
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      case "UPDATE": return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
      case "DELETE": return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default: return "text-slate-600 bg-slate-50 dark:bg-slate-800";
    }
  };

  return (
    <section className="max-w-[1600px] mx-auto py-12 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className=""
      >
        {/* --- Header Section --- */}
        <div className="mb-12 text-center relative">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ReadOutlined className="mr-2" /> งานประกันคุณภาพ
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            รายงาน<span className="text-[#DAA520]">การประเมินตนเอง</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Self Assessment Report (SAR)
          </p>

          {isTeacher && (
            <div className="absolute top-0 right-0 max-md:relative max-md:mt-4 max-md:right-auto">
              <Button
                color="primary"
                startContent={<PlusOutlined />}
                onPress={handleAdd}
              >
                เพิ่มเอกสาร
              </Button>
            </div>
          )}
        </div>

        {/* --- Accordion Content --- */}
        {isLoading ? (
          <div className="text-center py-10">กำลังโหลดข้อมูล...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-slate-500">ไม่พบเอกสาร</div>
        ) : (
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className="px-0"
          >
            {documents.map((item) => (
              <AccordionItem
                key={item._id}
                aria-label={item.title}
                title={item.title}
                startContent={
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                    <FilePdfOutlined className="text-xl" />
                  </div>
                }
                subtitle={`ปีการศึกษา ${item.year}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <FileTextOutlined />
                      <span className="text-sm">ตัวอย่างเอกสาร</span>
                    </div>
                    <div className="flex gap-2">
                      {isTeacher && (
                        <>
                          <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            onPress={() => handleEdit(item)}
                            startContent={<EditOutlined />}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleDelete(item._id)}
                            startContent={<DeleteOutlined />}
                          >
                            ลบ
                          </Button>
                        </>
                      )}
                      <LinkPreview url={item.file} className="inline-block">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          endContent={<DownloadOutlined />}
                          className="font-medium"
                          as="span"
                        >
                          ดาวน์โหลด PDF
                        </Button>
                      </LinkPreview>
                    </div>
                  </div>

                  {/* PDF Preview (Iframe) */}
                  <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner dark:border-neutral-700 dark:bg-neutral-800">
                    <iframe
                      className="h-[500px] w-full md:h-[600px] lg:h-[700px]"
                      src={item.file}
                      title={`PDF Viewer ${item.year}`}
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* --- Activity Logs Section --- */}
        {logs.length > 0 && (
          <div className="mt-20 border-t border-slate-200 dark:border-zinc-800 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <HistoryOutlined className="text-2xl text-slate-600 dark:text-slate-400" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">ประวัติการทำงาน (Activity Logs)</h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">วันเวลา</th>
                      <th className="px-6 py-4 font-semibold">ผู้ใช้งาน</th>
                      <th className="px-6 py-4 font-semibold">การกระทำ</th>
                      <th className="px-6 py-4 font-semibold">รายละเอียด</th>
                      {isSuperAdmin && <th className="px-6 py-4 font-semibold text-right">จัดการ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {new Date(log.timestamp).toLocaleString("th-TH")}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                          {log.userName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {log.details}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditLog(log)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 bg-white hover:bg-amber-50 dark:bg-transparent dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                title="แก้ไข"
                              >
                                <EditOutlined />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                title="ลบ"
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal เพิ่ม/แก้ไข เอกสาร (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden z-10"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/50">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {isEditMode ? "แก้ไขเอกสาร SAR" : "เพิ่มเอกสาร SAR"}
                  </h3>
                  <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ปีการศึกษา <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 2566"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ชื่อเอกสาร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น รายงานการประเมินตนเอง (SAR) ปี 2566"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ไฟล์ PDF {isEditMode && <span className="text-gray-400 text-xs font-normal">(เลือกไฟล์ใหม่หากต้องการเปลี่ยน)</span>}
                      {!isEditMode && <span className="text-red-500"> *</span>}
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50 transition-colors cursor-pointer"
                      required={!isEditMode}
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-zinc-900/50">
                  <Button color="danger" variant="flat" onPress={onClose} type="button">
                    ยกเลิก
                  </Button>
                  <Button color="primary" type="submit" isLoading={isSubmitting}>
                    บันทึก
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal แก้ไข Log (Super Admin) */}
      <AnimatePresence>
        {isLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onLogClose}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden z-10"
            >
              <form onSubmit={handleLogSubmit}>
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/50">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    แก้ไขประวัติการทำงาน (Log)
                  </h3>
                  <button type="button" onClick={onLogClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      รายละเอียด <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editLogData?.details || ""}
                      onChange={(e) => setEditLogData((prev) => prev ? { ...prev, details: e.target.value } : null)}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white outline-none transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-zinc-900/50">
                  <Button color="danger" variant="flat" onPress={onLogClose} type="button">
                    ยกเลิก
                  </Button>
                  <Button color="warning" type="submit" isLoading={isLogSubmitting} className="text-white">
                    บันทึกการแก้ไข
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
