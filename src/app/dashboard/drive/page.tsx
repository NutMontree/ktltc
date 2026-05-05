"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Folder, 
  File, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  Download, 
  Trash2, 
  Edit3, 
  Upload,
  ArrowLeft,
  Search,
  HardDrive,
  User,
  Clock,
  Info,
  X,
  Loader2
} from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { motion, AnimatePresence } from "framer-motion";

interface DriveItem {
  _id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
  size?: number;
  url?: string;
}

export default function DrivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "คลังไฟล์งาน" }
  ]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ fileName: string; percent: number } | null>(null);

  const userRole = (session?.user as any)?.role?.toLowerCase();
  const userId = (session?.user as any)?.id;
  const isSuperAdmin = userRole === "super_admin";

  const fetchItems = useCallback(async (folderId: string | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/folders?parentId=${folderId || 'null'}`);
      const data = await res.json();
      if (data.folders) setFolders(data.folders);
      if (data.files) setFiles(data.files);
    } catch (error) {
      console.error("Failed to fetch drive items", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (["user", "student"].includes(userRole)) {
        router.push("/dashboard");
      } else {
        fetchItems(currentFolderId);
      }
    }
  }, [status, userRole, router, currentFolderId, fetchItems]);

  const handleFolderClick = (folder: DriveItem) => {
    setCurrentFolderId(folder._id);
    setBreadcrumbs([...breadcrumbs, { id: folder._id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    setCurrentFolderId(newCrumbs[index].id);
  };

  const createFolder = async () => {
    if (!newItemName) return;
    try {
      const res = await fetch("/api/drive/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName, parentId: currentFolderId })
      });
      if (res.ok) {
        setNewItemName("");
        setIsCreateModalOpen(false);
        fetchItems(currentFolderId);
      }
    } catch (error) {
      alert("ไม่สามารถสร้างโฟลเดอร์ได้");
    }
  };

  const renameItem = async () => {
    if (!newItemName || !selectedItem) return;
    try {
      const res = await fetch(`/api/drive/item/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName, type: selectedItem.type })
      });
      if (res.ok) {
        setNewItemName("");
        setIsRenameModalOpen(false);
        setSelectedItem(null);
        fetchItems(currentFolderId);
      }
    } catch (error) {
      alert("ไม่สามารถเปลี่ยนชื่อได้");
    }
  };

  const deleteItem = async (id: string, type: 'file' | 'folder') => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/drive/item/${id}?type=${type}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchItems(currentFolderId);
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถลบได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ fileName: file.name, percent: 0 });

    try {
      const { secure_url } = await uploadFile(file, "ktltc_drive", (percent) => {
        setUploadStatus({ fileName: file.name, percent });
      });

      if (secure_url) {
        await fetch("/api/drive/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            url: secure_url,
            folderId: currentFolderId,
            size: file.size,
            type: file.type
          })
        });
        fetchItems(currentFolderId);
      }
    } catch (error) {
      alert("อัปโหลดไม่สำเร็จ");
    } finally {
      setUploadStatus(null);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 font-['Sarabun']">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <HardDrive className="text-blue-600" size={32} /> คลังไฟล์งาน
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">จัดการไฟล์และเอกสารของวิทยาลัย</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95">
            <Upload size={18} /> อัปโหลดไฟล์
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-md border border-slate-200 transition-all hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 active:scale-95"
          >
            <Plus size={18} /> โฟลเดอร์ใหม่
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar-thin">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            {i > 0 && <ChevronRight size={16} className="text-slate-400" />}
            <button
              onClick={() => handleBreadcrumbClick(i)}
              className={`text-sm font-bold transition-colors ${
                i === breadcrumbs.length - 1 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Upload Progress */}
      {uploadStatus && (
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl border border-blue-100 dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 truncate max-w-[80%]">
              กำลังอัปโหลด: {uploadStatus.fileName}
            </span>
            <span className="text-xs font-black text-blue-600">{uploadStatus.percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <motion.div 
              className="h-full bg-blue-600" 
              initial={{ width: 0 }}
              animate={{ width: `${uploadStatus.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Folders */}
        {folders.map((folder) => (
          <div 
            key={folder._id}
            className="group relative flex flex-col rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div 
              className="mb-4 flex cursor-pointer items-center gap-3"
              onClick={() => handleFolderClick(folder)}
            >
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Folder size={24} fill="currentColor" fillOpacity={0.3} />
              </div>
              <span className="flex-1 truncate text-sm font-black text-slate-800 dark:text-zinc-200">{folder.name}</span>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><User size={12} /> {folder.ownerName}</span>
              <div className="flex gap-2">
                {(isSuperAdmin || folder.ownerId === userId) && (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedItem({ id: folder._id, name: folder.name, type: 'folder' });
                        setNewItemName(folder.name);
                        setIsRenameModalOpen(true);
                      }}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteItem(folder._id, 'folder')}
                      className="p-1 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Files */}
        {files.map((file) => (
          <div 
            key={file._id}
            className="group relative flex flex-col rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <File size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block truncate text-sm font-black text-slate-800 dark:text-zinc-200">{file.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatSize(file.size)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><User size={12} /> {file.ownerName}</span>
              <div className="flex items-center gap-2">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1 hover:text-blue-600 transition-colors"
                  title="เปิดดู / ดาวน์โหลด"
                >
                  <Download size={14} />
                </a>
                {(isSuperAdmin || file.ownerId === userId) && (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedItem({ id: file._id, name: file.name, type: 'file' });
                        setNewItemName(file.name);
                        setIsRenameModalOpen(true);
                      }}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteItem(file._id, 'file')}
                      className="p-1 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {folders.length === 0 && files.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="mb-4 rounded-full bg-slate-100 p-10 dark:bg-zinc-800">
              <HardDrive size={64} className="opacity-20" />
            </div>
            <p className="text-lg font-black uppercase tracking-widest">ยังไม่มีข้อมูลในโฟลเดอร์นี้</p>
            <p className="text-sm font-bold opacity-60">เริ่มสร้างโฟลเดอร์หรืออัปโหลดไฟล์งานได้เลย</p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            >
              <h3 className="mb-6 text-xl font-black text-slate-900 dark:text-white">สร้างโฟลเดอร์ใหม่</h3>
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="ชื่อโฟลเดอร์"
                autoFocus
                className="mb-8 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-500 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={createFolder}
                  className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
                >
                  สร้าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            >
              <h3 className="mb-6 text-xl font-black text-slate-900 dark:text-white">เปลี่ยนชื่อ</h3>
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="ชื่อใหม่"
                autoFocus
                className="mb-8 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-500 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={renameItem}
                  className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
                >
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
