"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Search, History, Clock, Users, UserCircle, Trash2, Edit, AlertTriangle, Save, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function TrackingHistoryPage() {
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role || "").toLowerCase();
  const isSuperAdmin = userRole === "super_admin";

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tracking/history?limit=1000");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory(data.data || []);
        } else {
          setError("Failed to fetch data");
        }
      } else {
        setError("API error");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/tracking/history/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory(prev => prev.filter(h => h._id !== deleteId));
          setDeleteModalOpen(false);
          setDeleteId(null);
        } else {
          alert(data.message || "Failed to delete");
        }
      }
    } catch (err) {
      alert("Error deleting record");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/tracking/history/clear`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory([]);
          setClearAllModalOpen(false);
        } else {
          alert(data.message || "Failed to clear history");
        }
      }
    } catch (err) {
      alert("Error clearing history");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editData) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/tracking/history/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scannedOutAt: editData.scannedOutAt,
          scannedInAt: editData.scannedInAt || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchHistory(); // Refresh to get updated duration
          setEditModalOpen(false);
          setEditData(null);
        } else {
          alert(data.message || "Failed to update");
        }
      }
    } catch (err) {
      alert("Error updating record");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString("th-TH", {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
    const timeStr = date.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  const filteredHistory = history.filter(session => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const student = session.student;
    if (!student) return false;
    return (
      (student.name && student.name.toLowerCase().includes(q)) ||
      (student.username && student.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 md:py-6 relative min-h-screen ">
      <Link href="/teacher/tracking" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 font-bold text-sm">
        <ArrowLeft size={16} /> กลับไปยังแผนที่
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <History size={20} />
            </div>
            ประวัติการเข้า-ออก
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">ดูประวัติการสแกนออกนอกวิทยาลัยย้อนหลัง และความถี่ของนักศึกษา</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 shadow-sm"
            />
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setClearAllModalOpen(true)}
              className="px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-2 transition-colors border border-rose-200 shrink-0 text-sm"
            >
              <Trash2 size={16} /> ล้างประวัติทั้งหมด
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">กำลังโหลดข้อมูลประวัติ...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl text-center border border-rose-100 font-bold">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                  <th className="px-6 py-4 rounded-tl-4xl">นักศึกษา</th>
                  <th className="px-6 py-4">ข้อมูลพื้นฐาน</th>
                  <th className="px-6 py-4">เวลาออก</th>
                  <th className="px-6 py-4">เวลากลับ</th>
                  <th className="px-6 py-4">สถานะ</th>
                  {isSuperAdmin && <th className="px-6 py-4 rounded-tr-4xl text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((session) => (
                    <tr key={session._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {session.student?.image ? (
                              <Image src={session.student.image} alt={session.student.name || "Student"} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <UserCircle size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                              {session.student?.name || "ไม่ทราบชื่อ"}
                            </h4>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">
                              {session.student?.username || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(session.student?.department || session.student?.academicLevel || session.student?.classroomName) ? (
                          <div className="flex flex-col gap-1">
                            {session.student?.department && (
                              <span className="text-[10px] text-zinc-500">
                                {session.student.department}
                              </span>
                            )}
                            {(session.student?.academicLevel || session.student?.classroomName) && (
                              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                                {session.student.academicLevel} {session.student.classroomName || session.student.groupCode}
                              </span>
                            )}
                          </div>
                        ) : <span className="text-zinc-400 text-xs">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                          <Clock size={14} />
                          <span className="text-xs font-bold">{mounted ? formatDateTime(session.scannedOutAt) : "--"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.scannedInAt ? (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Clock size={14} />
                            <span className="text-xs font-bold">{mounted ? formatDateTime(session.scannedInAt) : "--"}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ยังไม่กลับ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            อยู่ข้างนอก
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            เสร็จสิ้น
                          </span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditData(session);
                                setEditModalOpen(true);
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="แก้ไขเวลา"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(session._id);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              title="ลบรายการนี้"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-zinc-400">
                      <History size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold mb-1">ไม่พบประวัติการเข้า-ออก</p>
                      <p className="text-xs">ค้นหาด้วยชื่อหรือรหัสนักศึกษาไม่พบ หรือยังไม่มีประวัติในระบบ</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Single Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-center mb-2">ลบประวัติ?</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">
                การลบประวัตินี้จะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors"
                  disabled={actionLoading}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors flex justify-center items-center"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "ยืนยันการลบ"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Modal */}
      <AnimatePresence>
        {clearAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-rose-200 dark:border-rose-900/50"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-center text-rose-600 mb-2">ล้างประวัติทั้งหมด!</h3>
              <p className="text-zinc-500 text-sm text-center mb-6 font-medium">
                ข้อมูลประวัติการเข้า-ออก <span className="font-bold text-rose-500 text-base">ทั้งหมด</span> ในระบบจะถูกลบอย่างถาวร<br />คุณแน่ใจแล้วใช่ไหม?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClearAllModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors"
                  disabled={actionLoading}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors flex justify-center items-center"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "ล้างทั้งหมด"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Edit size={20} className="text-blue-500" /> แก้ไขเวลาเข้า-ออก
                </h3>
                <button onClick={() => setEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-bold text-zinc-500 mb-2">เวลาที่ออกนอกวิทยาลัย</p>
                <input
                  type="datetime-local"
                  lang="en-GB"
                  value={formatDateTimeLocal(editData.scannedOutAt)}
                  onChange={(e) => setEditData({ ...editData, scannedOutAt: e.target.value ? new Date(e.target.value).toISOString() : editData.scannedOutAt })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold text-zinc-500 mb-2">เวลาที่สแกนกลับ (เว้นว่างไว้ถ้ายังไม่กลับ)</p>
                <input
                  type="datetime-local"
                  lang="en-GB"
                  value={editData.scannedInAt ? formatDateTimeLocal(editData.scannedInAt) : ""}
                  onChange={(e) => setEditData({ ...editData, scannedInAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors"
                  disabled={actionLoading}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> บันทึกการแก้ไข</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
