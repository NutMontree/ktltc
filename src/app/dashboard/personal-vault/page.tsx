"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Plus, Copy, Eye, EyeOff, Trash2, KeyRound, Loader2, Folder, X, FolderPlus, Pencil, ShieldCheck
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface VaultCredential {
  id: string;
  title: string;
  username: string;
  password?: string;
  createdAt: string;
}

interface VaultFolder {
  _id: string;
  folderName: string;
  credentials: VaultCredential[];
  createdAt: string;
  ownerName?: string;
}

export default function PersonalVaultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isSuperAdmin = session?.user?.role?.toLowerCase() === "super_admin";

  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewAllMode, setIsViewAllMode] = useState(false);

  // Modals state
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [isAddCredModalOpen, setIsAddCredModalOpen] = useState(false);
  const [isFolderViewModalOpen, setIsFolderViewModalOpen] = useState(false);
  const [isEditCredModalOpen, setIsEditCredModalOpen] = useState(false);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [editCredId, setEditCredId] = useState<string | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      fetchFolders(isViewAllMode);
    }
  }, [status, router, isViewAllMode]);

  const fetchFolders = async (viewAll = isViewAllMode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/personal-vault${viewAll ? "?viewAll=true" : ""}`);
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders);
      } else {
        toast.error("ดึงข้อมูลล้มเหลว");
      }
    } catch (error) {
      toast.error("เครือข่ายขัดข้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return toast.error("กรุณาระบุชื่อโฟลเดอร์");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personal-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: newFolderName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("สร้างโฟลเดอร์เรียบร้อย");
        setIsAddFolderModalOpen(false);
        setNewFolderName("");
        fetchFolders();
      } else {
        toast.error(data.error || "สร้างโฟลเดอร์ล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolderId || !newTitle || !newUsername || !newPassword) {
      return toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personal-vault", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: activeFolderId,
          title: newTitle,
          username: newUsername,
          password: newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("บันทึกข้อมูลเรียบร้อย");
        setIsAddCredModalOpen(false);
        setNewTitle("");
        setNewUsername("");
        setNewPassword("");
        fetchFolders();
      } else {
        toast.error(data.error || "บันทึกล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFolderName || !activeFolderId) return toast.error("กรุณาระบุชื่อโฟลเดอร์");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personal-vault", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: activeFolderId, folderName: editFolderName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("แก้ไขชื่อโฟลเดอร์เรียบร้อย");
        setIsEditFolderModalOpen(false);
        setEditFolderName("");
        fetchFolders();
      } else {
        toast.error(data.error || "แก้ไขโฟลเดอร์ล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolderId || !editCredId || !newTitle || !newUsername || !newPassword) {
      return toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personal-vault", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: activeFolderId,
          credId: editCredId,
          title: newTitle,
          username: newUsername,
          password: newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("แก้ไขข้อมูลเรียบร้อย");
        setIsEditCredModalOpen(false);
        setNewTitle("");
        setNewUsername("");
        setNewPassword("");
        fetchFolders();
      } else {
        toast.error(data.error || "แก้ไขล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบโฟลเดอร์และรหัสผ่านทั้งหมดในนี้?")) return;

    try {
      const res = await fetch(`/api/personal-vault?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("ลบโฟลเดอร์สำเร็จ");
        setFolders(folders.filter(f => f._id !== id));
      } else {
        toast.error("ลบล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteCredential = async (folderId: string, credId: string) => {
    if (!confirm("ลบรหัสผ่านนี้?")) return;

    try {
      const res = await fetch(`/api/personal-vault?id=${folderId}&credId=${credId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchFolders();
      } else {
        toast.error("ลบล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกลงคลิปบอร์ดแล้ว");
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  const activeFolder = folders.find(f => f._id === activeFolderId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-2 md:p-4 pb-32">
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
      />

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-2xl shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-purple-400 flex items-center gap-3 tracking-tight">
                <Lock className="text-cyan-600 dark:text-cyan-400" size={32} />
                Personal Vault
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">จัดการและเก็บรหัสผ่านของคุณแบ่งตามโฟลเดอร์ ปลอดภัยด้วยการเข้ารหัสขั้นสูง</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {isSuperAdmin && (
                <button
                  onClick={() => setIsViewAllMode(!isViewAllMode)}
                  className={`flex items-center gap-2 px-6 py-3 border rounded-2xl font-bold transition-all shadow-md active:scale-95 ${
                    isViewAllMode 
                      ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                      : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  <Eye size={20} />
                  {isViewAllMode ? "กลับโหมดปกติ" : "ดูข้อมูลทั้งหมด"}
                </button>
              )}

              <button
                onClick={() => setIsAddFolderModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-2xl font-bold transition-all shadow-md active:scale-95"
              >
                <FolderPlus size={20} className="text-cyan-600 dark:text-cyan-400" />
                สร้างโฟลเดอร์ใหม่
              </button>
            </div>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 flex items-start sm:items-center gap-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base mb-1">
              ข้อมูลของคุณถูกเข้ารหัสและเป็นความลับขั้นสูงสุด
            </h4>
            <p className="text-emerald-600 dark:text-emerald-500/80 text-xs sm:text-sm font-medium">
              ระบบ Personal Vault ออกแบบมาเพื่อความเป็นส่วนตัวของคุณโดยเฉพาะ รหัสผ่านทั้งหมดจะถูกเข้ารหัส (Encryption) และมีเพียง <strong>"คุณ"</strong> เท่านั้นที่สามารถมองเห็นข้อมูลของตนเองได้ บุคคลอื่นจะไม่สามารถเข้าถึงข้อมูลของคุณได้อย่างเด็ดขาด
            </p>
          </div>
        </div>

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-3xl backdrop-blur-md">
            <Folder className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={64} />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">ยังไม่มีโฟลเดอร์ กด "สร้างโฟลเดอร์ใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {folders.map(folder => (
                <motion.div
                  key={folder._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    setActiveFolderId(folder._id);
                    setIsFolderViewModalOpen(true);
                  }}
                  className="group cursor-pointer relative p-4 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 rounded-3xl backdrop-blur-xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-100 to-indigo-100 dark:from-cyan-900/40 dark:to-indigo-900/40 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-black text-2xl shadow-inner">
                        <Folder size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white tracking-wide truncate max-w-[120px]">{folder.folderName}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                          {folder.credentials.length} รายการ
                        </p>
                        {isViewAllMode && folder.ownerName && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-md truncate max-w-[120px]">
                            {folder.ownerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFolderId(folder._id);
                          setEditFolderName(folder.folderName);
                          setIsEditFolderModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-zinc-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all"
                        title="แก้ไขโฟลเดอร์"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFolder(folder._id, e)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                        title="ลบโฟลเดอร์"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFolderId(folder._id);
                        setIsAddCredModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold transition-colors"
                    >
                      <Plus size={18} />
                      เพิ่มรหัสผ่าน
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* 1. Add Folder Modal */}
      <AnimatePresence>
        {isAddFolderModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddFolderModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setIsAddFolderModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-6">สร้างโฟลเดอร์ใหม่</h2>
              <form onSubmit={handleAddFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">ชื่อโฟลเดอร์</label>
                  <input
                    type="text" required value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold"
                    placeholder="เช่น KTLTC, Social Media"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderPlus size={18} />} บันทึก
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1.5 Edit Folder Modal */}
      <AnimatePresence>
        {isEditFolderModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditFolderModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setIsEditFolderModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-6">แก้ไขชื่อโฟลเดอร์</h2>
              <form onSubmit={handleEditFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">ชื่อโฟลเดอร์ใหม่</label>
                  <input
                    type="text" required value={editFolderName} onChange={e => setEditFolderName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pencil size={18} />} บันทึกการแก้ไข
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Credential Modal */}
      <AnimatePresence>
        {isAddCredModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddCredModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setIsAddCredModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-2">เพิ่มรหัสผ่านใหม่</h2>
              <p className="text-sm text-zinc-500 mb-6 font-medium">บันทึกลงในแฟ้ม: <span className="font-bold text-cyan-600 dark:text-cyan-400">{folders.find(f => f._id === activeFolderId)?.folderName}</span></p>

              <form onSubmit={handleAddCredential} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">ชื่อบริการ</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium" placeholder="เช่น Facebook" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">Username / Email</label>
                  <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">รหัสผ่าน</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium font-mono tracking-widest" placeholder="••••••••" />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock size={18} />} บันทึกรหัสผ่าน
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Folder View Modal */}
      <AnimatePresence>
        {isFolderViewModalOpen && activeFolder && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setIsFolderViewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-800 dark:text-white">{activeFolder.folderName}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">{activeFolder.credentials.length} รายการรหัสผ่าน</p>
                  </div>
                </div>
                <button onClick={() => setIsFolderViewModalOpen(false)} className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto grow">
                {activeFolder.credentials.length === 0 ? (
                  <div className="text-center py-20">
                    <KeyRound className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">แฟ้มนี้ยังว่างเปล่า</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeFolder.credentials.map(cred => {
                      const isVisible = visiblePasswords[cred.id] || false;
                      return (
                        <div key={cred.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 truncate">{cred.title}</h3>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditCredId(cred.id);
                                  setNewTitle(cred.title);
                                  setNewUsername(cred.username);
                                  setNewPassword(cred.password || "");
                                  setIsEditCredModalOpen(true);
                                }} 
                                className="text-zinc-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 p-1.5 rounded-lg transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteCredential(activeFolder._id, cred.id)} className="text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Username / Email</p>
                              <div className="flex items-center justify-between bg-zinc-50 dark:bg-black/30 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono truncate">{cred.username}</p>
                                <button onClick={() => copyToClipboard(cred.username)} className="text-zinc-400 hover:text-cyan-500 p-1"><Copy size={14} /></button>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Password</p>
                              <div className="flex items-center justify-between bg-zinc-50 dark:bg-black/30 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                                <p className={`text-sm font-mono truncate text-zinc-700 dark:text-zinc-300 ${!isVisible && 'tracking-[4px] mt-1'}`}>
                                  {isVisible ? (cred.password || 'N/A') : '••••••••••••'}
                                </p>
                                <div className="flex gap-1">
                                  <button onClick={() => toggleVisibility(cred.id)} className="text-zinc-400 hover:text-cyan-500 p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <button onClick={() => copyToClipboard(cred.password || '')} className="text-zinc-400 hover:text-cyan-500 p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                    <Copy size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Edit Credential Modal */}
      <AnimatePresence>
        {isEditCredModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditCredModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setIsEditCredModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-6">แก้ไขรหัสผ่าน</h2>

              <form onSubmit={handleEditCredential} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">ชื่อบริการ</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">Username / Email</label>
                  <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">รหัสผ่านใหม่ (ใส่รหัสเดิมถ้าไม่แก้)</label>
                  <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium font-mono tracking-widest" />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pencil size={18} />} บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
