"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  Loader2,
  Video,
  Music,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  Share2,
  ExternalLink,
  Move,
  Check,
  CheckSquare,
  ChevronLeft,
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
  parentId?: string;
  type?: string;
  size?: number;
  url?: string;
  thumbnailUrl?: string;
  isCollaborative?: boolean;
}

export default function DrivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <DriveContent />
    </Suspense>
  );
}

function DriveContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFolderId = searchParams.get("folderId");

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(urlFolderId);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "คลังไฟล์งาน" },
  ]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [allFoldersList, setAllFoldersList] = useState<DriveItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
    isCollaborative?: boolean;
  } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    fileName: string;
    percent: number;
    currentIndex: number;
    totalCount: number;
  } | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "image" | "video" | "document" | "archive" | "audio" | "other"
  >("all");
  const [previewFile, setPreviewFile] = useState<DriveItem | null>(null);

  const userRole = (session?.user as any)?.role?.toLowerCase();
  const userId = (session?.user as any)?.id;
  const isSuperAdmin = userRole === "super_admin";

  const currentFolder = allFoldersList.find((f) => f._id === currentFolderId);
  const canUploadInCurrentFolder =
    !currentFolderId ||
    isSuperAdmin ||
    currentFolder?.ownerId === userId ||
    currentFolder?.isCollaborative;

  const fetchItems = useCallback(async (folderId: string | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/folders?parentId=${folderId || "null"}`);
      const data = await res.json();
      if (data.folders) setFolders(data.folders);
      if (data.files) setFiles(data.files);
      if (data.allFolders) setAllFoldersList(data.allFolders);
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
      // Block student role from accessing drive
      if (userRole === "student") {
        router.push("/dashboard");
        return;
      }
      // เมื่อ URL เปลี่ยน ให้เปลี่ยน folder ใน state ด้วย
      setCurrentFolderId(urlFolderId);
      fetchItems(urlFolderId);
    }
  }, [status, router, urlFolderId, fetchItems]);

  // Reconstruct breadcrumbs when folders list or current ID changes
  useEffect(() => {
    if (allFoldersList.length > 0) {
      if (!urlFolderId) {
        setBreadcrumbs([{ id: null, name: "คลังไฟล์งาน" }]);
      } else {
        const path: { id: string | null; name: string }[] = [{ id: null, name: "คลังไฟล์งาน" }];
        const buildPath = (targetId: string) => {
          const folder = allFoldersList.find((f) => f._id === targetId);
          if (folder) {
            if (folder.parentId) {
              buildPath(folder.parentId);
            }
            path.push({ id: folder._id, name: folder.name });
          }
        };
        buildPath(urlFolderId);
        setBreadcrumbs(path);
      }
    }
  }, [allFoldersList, urlFolderId]);

  const handleFolderClick = (folder: DriveItem) => {
    router.push(`?folderId=${folder._id}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      router.push("/dashboard/drive");
      return;
    }
    const targetId = breadcrumbs[index].id;
    if (targetId) {
      router.push(`?folderId=${targetId}`);
    } else {
      router.push("/dashboard/drive");
    }
  };

  const createFolder = async () => {
    if (!newItemName) return;
    try {
      const res = await fetch("/api/drive/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          parentId: currentFolderId,
          isCollaborative: isCollaborative,
        }),
      });
      if (res.ok) {
        setNewItemName("");
        setIsCollaborative(false);
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
        body: JSON.stringify({
          name: newItemName,
          type: selectedItem.type,
          isCollaborative: isCollaborative,
        }),
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

  const moveItem = async (newParentId: string | null) => {
    if (selectedIds.size > 0) {
      // Bulk Move
      setLoading(true);
      try {
        for (const id of Array.from(selectedIds)) {
          const item = [...folders, ...files].find((i) => i._id === id);
          if (!item) continue;
          const type = (item as any).url ? "file" : "folder";
          await fetch(`/api/drive/item/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              newParentId: newParentId === "root" ? "null" : newParentId,
            }),
          });
        }
        setIsMoveModalOpen(false);
        setSelectedIds(new Set());
        setIsSelectionMode(false);
        setSelectedItem(null);
        fetchItems(currentFolderId);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการย้ายบางรายการ");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/drive/item/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedItem.type,
          newParentId: newParentId === "root" ? "null" : newParentId,
        }),
      });
      if (res.ok) {
        setIsMoveModalOpen(false);
        setSelectedItem(null);
        fetchItems(currentFolderId);
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถย้ายได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการย้าย");
    }
  };

  const deleteItem = async (id: string, type: "file" | "folder") => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/drive/item/${id}?type=${type}`, {
        method: "DELETE",
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

  const bulkDownload = () => {
    const selectedFiles = files.filter((f) => selectedIds.has(f._id));
    if (selectedFiles.length === 0) {
      alert("ไม่พบไฟล์ที่รองรับการดาวน์โหลด (โฟลเดอร์ไม่สามารถดาวน์โหลดได้)");
      return;
    }

    if (
      !confirm(
        `คุณต้องการดาวน์โหลดไฟล์จำนวน ${selectedFiles.length} ไฟล์ใช่หรือไม่?\nเบราว์เซอร์อาจขออนุญาตในการดาวน์โหลดหลายไฟล์พร้อมกัน`
      )
    )
      return;

    selectedFiles.forEach((file, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = file.url || "";
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 500); // Delay 500ms between each download to prevent browser blocking
    });

    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const bulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${count} รายการที่เลือก?`)) return;

    setLoading(true);
    try {
      for (const id of Array.from(selectedIds)) {
        const item = [...folders, ...files].find((i) => i._id === id);
        if (!item) continue;
        const type = (item as any).url ? "file" : "folder";
        await fetch(`/api/drive/item/${id}?type=${type}`, { method: "DELETE" });
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      fetchItems(currentFolderId);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบบางรายการ");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    const currentItems = [...folders, ...filteredFiles];
    const currentItemIds = currentItems.map((item) => item._id);

    // Check if all current items are already selected
    const isAllSelected = currentItemIds.every((id) => selectedIds.has(id));

    if (isAllSelected) {
      // Unselect only the items currently shown
      const newSelected = new Set(selectedIds);
      currentItemIds.forEach((id) => newSelected.delete(id));
      setSelectedIds(newSelected);
      if (newSelected.size === 0) setIsSelectionMode(false);
    } else {
      // Select all items currently shown
      setIsSelectionMode(true);
      const newSelected = new Set(selectedIds);
      currentItemIds.forEach((id) => newSelected.add(id));
      setSelectedIds(newSelected);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesToUpload = Array.from(selectedFiles);
    const totalCount = filesToUpload.length;

    try {
      for (let i = 0; i < totalCount; i++) {
        const file = filesToUpload[i];
        setUploadStatus({
          fileName: file.name,
          percent: 0,
          currentIndex: i + 1,
          totalCount: totalCount,
        });

        const { secure_url, thumbnail_url } = await uploadFile(file, "ktltc_drive", (percent) => {
          setUploadStatus({
            fileName: file.name,
            percent,
            currentIndex: i + 1,
            totalCount: totalCount,
          });
        });

        if (secure_url) {
          await fetch("/api/drive/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              url: secure_url,
              thumbnailUrl: thumbnail_url,
              folderId: currentFolderId,
              size: file.size,
              type: file.type,
            }),
          });
        }
      }
      fetchItems(currentFolderId);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดบางไฟล์");
    } finally {
      setUploadStatus(null);
      if (e.target) e.target.value = ""; // Clear input
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderFilePreview = (file: DriveItem) => {
    const type = file.type?.toLowerCase() || "";

    if (type.startsWith("image/")) {
      return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <img
            src={file.thumbnailUrl || file.url}
            alt={file.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>
      );
    }

    if (type.startsWith("video/")) {
      return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 text-white">
          {file.thumbnailUrl ? (
            <>
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="h-full w-full object-cover opacity-60 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video
                  size={32}
                  className="text-white drop-shadow-lg"
                  fill="currentColor"
                  fillOpacity={0.5}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video size={32} fill="currentColor" fillOpacity={0.2} />
            </div>
          )}
        </div>
      );
    }

    if (type.includes("pdf")) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
          <FileText size={40} strokeWidth={2.5} />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded uppercase">
            PDF
          </div>
        </div>
      );
    }

    if (type.includes("word") || file.name.match(/\.(docx?)$/i)) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <FileText size={40} strokeWidth={2.5} />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded uppercase">
            WORD
          </div>
        </div>
      );
    }

    if (type.includes("excel") || type.includes("sheet") || file.name.match(/\.(xlsx?|csv)$/i)) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
          <FileText size={40} strokeWidth={2.5} />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded uppercase">
            EXCEL
          </div>
        </div>
      );
    }

    if (
      type.includes("presentation") ||
      type.includes("powerpoint") ||
      file.name.match(/\.(pptx?)$/i)
    ) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
          <FileText size={40} strokeWidth={2.5} />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded uppercase">
            PPT
          </div>
        </div>
      );
    }

    if (type.includes("zip") || type.includes("rar") || file.name.match(/\.(zip|rar|7z)$/i)) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <Folder size={40} strokeWidth={2.5} />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-amber-600 text-white text-[8px] font-black rounded uppercase">
            ZIP
          </div>
        </div>
      );
    }

    if (type.startsWith("audio/")) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Music size={32} />
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
        <File size={32} />
      </div>
    );
  };

  const getFilteredFiles = () => {
    if (filterType === "all") return files;
    return files.filter((file) => {
      const type = file.type?.toLowerCase() || "";
      const name = file.name.toLowerCase();

      if (filterType === "image") return type.startsWith("image/");
      if (filterType === "video") return type.startsWith("video/");
      if (filterType === "audio") return type.startsWith("audio/");
      if (filterType === "document") {
        return (
          type.includes("pdf") ||
          type.includes("word") ||
          type.includes("excel") ||
          type.includes("sheet") ||
          type.includes("presentation") ||
          /\.(docx?|xlsx?|pptx?|pdf|txt)$/i.test(name)
        );
      }
      if (filterType === "archive") {
        return type.includes("zip") || type.includes("rar") || /\.(zip|rar|7z)$/i.test(name);
      }
      return false;
    });
  };

  const filteredFiles = getFilteredFiles();

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-2 pt-28 pb-10 lg:pt-32 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <HardDrive size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              คลังไฟล์งาน
            </h1>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 font-medium ml-1">
            จัดการและจัดระเบียบเอกสารดิจิทัลของวิทยาลัย
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Bar - Premium Look */}
          <div className="relative group min-w-[300px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาไฟล์หรือโฟลเดอร์..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm shadow-sm"
            />
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-zinc-800 hidden md:block mx-1"></div>

          {/* View Toggle */}
          <div className="flex items-center rounded-2xl bg-slate-100 p-1.5 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-md dark:bg-zinc-800" : "text-slate-400 hover:text-slate-600"}`}
              title="มุมมองตาราง"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === "list" ? "bg-white text-blue-600 shadow-md dark:bg-zinc-800" : "text-slate-400 hover:text-slate-600"}`}
              title="มุมมองรายการ"
            >
              <ListIcon size={20} />
            </button>
          </div>

          {(isSuperAdmin || canUploadInCurrentFolder) && (
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95">
              <Upload size={20} strokeWidth={2.5} /> อัปโหลด
              <input type="file" className="hidden" multiple onChange={handleFileUpload} />
            </label>
          )}

          {(isSuperAdmin || canUploadInCurrentFolder) && (
            <button
              onClick={() => {
                setNewItemName("");
                setIsCollaborative(false);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg border border-slate-200 transition-all hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} /> โฟลเดอร์
            </button>
          )}

          <button
            onClick={() => {
              if (isSelectionMode) {
                setSelectedIds(new Set());
                setIsSelectionMode(false);
              } else {
                setIsSelectionMode(true);
              }
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg border hover:-translate-y-0.5 active:scale-95 ${
              isSelectionMode
                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30"
                : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30 hover:bg-indigo-100"
            }`}
          >
            {isSelectionMode ? <X size={20} /> : <CheckSquare size={20} />}
            <span className="hidden sm:inline">
              {isSelectionMode ? "ยกเลิก" : "เลือกหลายรายการ"}
            </span>
          </button>
        </div>
      </div>

      {/* File Type Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: "all", label: "ทั้งหมด", icon: <LayoutGrid size={14} /> },
          { id: "image", label: "รูปภาพ", icon: <ImageIcon size={14} /> },
          { id: "video", label: "วิดีโอ", icon: <Video size={14} /> },
          { id: "document", label: "เอกสาร", icon: <FileText size={14} /> },
          { id: "archive", label: "ไฟล์บีบอัด", icon: <Folder size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all shrink-0 ${
              filterType === tab.id
                ? "bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tab.icon}
            {tab.label}
            {filterType === tab.id && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                {tab.id === "all" ? files.length : filteredFiles.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Navigation & Breadcrumbs - Compact & Responsive */}
      <div className="mb-6 flex items-center justify-between bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {isSelectionMode && (
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-black bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all shrink-0"
            >
              <CheckSquare size={14} />{" "}
              <span>
                {[...folders, ...filteredFiles].every((item) => selectedIds.has(item._id))
                  ? "ไม่เลือกทั้งหมด"
                  : "เลือกทั้งหมดในกลุ่มนี้"}
              </span>
            </button>
          )}
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-black transition-all shrink-0 ${breadcrumbs.length === 0 ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
          >
            <HardDrive size={14} /> <span className="hidden xs:inline">หน้าแรก</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || idx}>
              <span className="text-slate-300 dark:text-zinc-700 text-xs">/</span>
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-black transition-all whitespace-nowrap shrink-0 ${idx === breadcrumbs.length - 1 ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {breadcrumbs.length > 0 && (
          <button
            onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
          >
            <ArrowLeft size={14} /> <span className="hidden sm:inline">ย้อนกลับ</span>
          </button>
        )}
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadStatus && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="rounded-[28px] bg-blue-600 p-6 shadow-2xl shadow-blue-500/40 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-1">
                    กำลังดำเนินการอัปโหลด ({uploadStatus.currentIndex}/{uploadStatus.totalCount})
                  </span>
                  <span className="text-lg font-black truncate max-w-[400px]">
                    {uploadStatus.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">{uploadStatus.percent}%</span>
                  <Loader2 className="animate-spin" size={24} />
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadStatus.percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explorer Container */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "flex flex-col gap-3"
        }
      >
        {/* Folders */}
        {folders.map((folder) => (
          <motion.div
            layout
            key={folder._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={!isSelectionMode ? { y: -8 } : {}}
            onClick={() => isSelectionMode && toggleSelection(folder._id)}
            className={`group relative flex bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm border transition-all ${
              selectedIds.has(folder._id)
                ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-slate-100 dark:border-zinc-800 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30"
            } ${
              viewMode === "grid"
                ? "flex-col rounded-[24px] p-5"
                : "flex-row items-center rounded-2xl p-3"
            } ${isSelectionMode ? "cursor-pointer" : ""}`}
          >
            {isSelectionMode && (
              <div className="absolute top-4 left-4 z-10">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(folder._id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-300 dark:bg-zinc-800 dark:border-zinc-700"
                  }`}
                >
                  {selectedIds.has(folder._id) && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            )}
            <div
              className={`flex cursor-pointer items-center gap-5 ${viewMode === "grid" ? "mb-6 flex-1 flex-col text-center" : "flex-1"}`}
              onClick={() => !isSelectionMode && handleFolderClick(folder)}
            >
              <div
                className={`relative rounded-[24px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                  folder.isCollaborative
                    ? "bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                } ${viewMode === "grid" ? "h-24 w-24" : "h-12 w-12"}`}
              >
                <Folder
                  size={viewMode === "grid" ? 44 : 24}
                  fill="currentColor"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {folder.isCollaborative && (
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-lg border border-slate-100 dark:border-zinc-700">
                    <Share2 size={12} className="text-indigo-600" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden w-full">
                <span
                  className="truncate text-base font-black text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 transition-colors"
                  title={folder.name}
                >
                  {folder.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {folder.isCollaborative ? "คลังทำงานร่วมกัน" : "แฟ้มส่วนตัว"}
                </span>
              </div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 ${viewMode === "grid" ? "justify-between w-full pt-4 border-t border-slate-50 dark:border-zinc-800/50 mt-auto" : ""}`}
            >
              <div className="flex items-center gap-2 shrink-0 max-w-[50%]">
                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-white dark:border-zinc-700 shrink-0">
                  <User size={12} className="text-slate-400" />
                </div>
                <span className="truncate">{folder.ownerName}</span>
              </div>

              <div className="flex items-center gap-1 ml-auto shrink-0 bg-slate-50 dark:bg-zinc-800/50 p-1 rounded-xl">
                {(isSuperAdmin ||
                  folder.ownerId === userId ||
                  (folder.isCollaborative && userRole !== "student")) && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedItem({
                          id: folder._id,
                          name: folder.name,
                          type: "folder",
                          isCollaborative: !!folder.isCollaborative,
                        });
                        setNewItemName(folder.name);
                        setIsCollaborative(!!folder.isCollaborative);
                        setIsRenameModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:text-blue-600 dark:hover:bg-zinc-700 shadow-sm transition-all"
                      title="การตั้งค่า"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem({ id: folder._id, name: folder.name, type: "folder" });
                        setIsMoveModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 dark:hover:bg-zinc-700 shadow-sm transition-all"
                      title="ย้าย"
                    >
                      <Move size={14} />
                    </button>
                    <button
                      onClick={() => deleteItem(folder._id, "folder")}
                      className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-zinc-700 shadow-sm transition-all"
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Files */}
        {filteredFiles.map((file) => (
          <motion.div
            layout
            key={file._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={!isSelectionMode ? { scale: 1.02 } : {}}
            onClick={() => {
              if (isSelectionMode) toggleSelection(file._id);
            }}
            className={`group relative flex bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm border transition-all ${
              selectedIds.has(file._id)
                ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-slate-100 dark:border-zinc-800 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30"
            } ${
              viewMode === "grid"
                ? "flex-col rounded-[24px] p-3"
                : "flex-row items-center rounded-xl p-3"
            } ${isSelectionMode ? "cursor-pointer" : ""}`}
          >
            {isSelectionMode && (
              <div className="absolute top-4 left-4 z-10">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(file._id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-300 dark:bg-zinc-800 dark:border-zinc-700"
                  }`}
                >
                  {selectedIds.has(file._id) && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            )}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectionMode) toggleSelection(file._id);
                else if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) setPreviewFile(file);
                else window.open(file.url, "_blank");
              }}
              className={`relative overflow-hidden shrink-0 shadow-inner bg-slate-100 dark:bg-zinc-800 cursor-pointer ${viewMode === "grid" ? "mb-3 aspect-4/3 w-full rounded-xl" : "h-12 w-12 rounded-lg mr-4"}`}
            >
              {renderFilePreview(file)}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="p-2 sm:p-3 bg-white text-blue-600 rounded-full shadow-xl transition-transform scale-90 group-hover:scale-100">
                  <ExternalLink size={16} strokeWidth={3} className="sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 px-2 overflow-hidden">
              <div className={`flex flex-col ${viewMode === "grid" ? "mb-4" : ""}`}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectionMode) toggleSelection(file._id);
                    else if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) setPreviewFile(file);
                    else window.open(file.url, "_blank");
                  }}
                  className="truncate text-xs sm:text-sm font-black text-slate-800 dark:text-zinc-100 hover:text-blue-600 transition-colors cursor-pointer"
                  title={file.name}
                >
                  {file.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-md">
                    {formatSize(file.size)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 dark:text-zinc-600">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {file.type?.split("/")[1] || "file"}
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center justify-between text-[10px] font-bold text-slate-400 ${viewMode === "grid" ? "pt-4 border-t border-slate-50 dark:border-zinc-800/50" : "hidden sm:flex"}`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <User size={10} />
                  </div>
                  <span className="truncate max-w-[70px]">{file.ownerName}</span>
                </div>

                <div 
                  className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-zinc-800/50 rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-2 rounded-lg hover:bg-white hover:text-blue-600 dark:hover:bg-zinc-700 shadow-sm transition-all"
                    title="ดาวน์โหลด"
                  >
                    <Download size={14} />
                  </a>
                  {(isSuperAdmin ||
                    file.ownerId === userId ||
                    (currentFolder?.isCollaborative && userRole !== "student")) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedItem({ id: file._id, name: file.name, type: "file" });
                          setNewItemName(file.name);
                          setIsRenameModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white hover:text-blue-600 dark:hover:bg-zinc-700 shadow-sm transition-all"
                        title="เปลี่ยนชื่อ"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem({ id: file._id, name: file.name, type: "file" });
                          setIsMoveModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 dark:hover:bg-zinc-700 shadow-sm transition-all"
                        title="ย้าย"
                      >
                        <Move size={14} />
                      </button>
                      <button
                        onClick={() => deleteItem(file._id, "file")}
                        className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-zinc-700 shadow-sm transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 z-90 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 bg-slate-900/95 backdrop-blur-xl p-4 sm:px-8 sm:py-5 rounded-3xl sm:rounded-[32px] shadow-2xl border border-white/10 text-white w-[92%] sm:w-auto sm:min-w-max"
          >
            <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 mb-2 sm:mb-0 sm:pr-6 sm:mr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 sm:mb-0.5">
                เลือกแล้ว
              </span>
              <span className="text-sm sm:text-xl font-black">{selectedIds.size} รายการ</span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={bulkDownload}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-blue-600 transition-all text-xs sm:text-sm font-black"
                title="ดาวน์โหลดที่เลือก"
              >
                <Download size={16} /> 
                <span className="whitespace-nowrap hidden sm:inline">โหลดที่เลือก</span>
                <span className="whitespace-nowrap sm:hidden">โหลด</span>
              </button>
              <button
                onClick={() => setIsMoveModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 transition-all text-xs sm:text-sm font-black"
                title="ย้ายที่เลือก"
              >
                <Move size={16} /> 
                <span className="whitespace-nowrap hidden sm:inline">ย้ายที่เลือก</span>
                <span className="whitespace-nowrap sm:hidden">ย้าย</span>
              </button>
              <button
                onClick={bulkDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 transition-all text-xs sm:text-sm font-black"
                title="ลบที่เลือก"
              >
                <Trash2 size={16} /> 
                <span className="whitespace-nowrap hidden sm:inline">ลบที่เลือก</span>
                <span className="whitespace-nowrap sm:hidden">ลบ</span>
              </button>
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setIsSelectionMode(false);
                }}
                className="flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all text-xs sm:text-sm font-black text-slate-400 hover:text-white"
                title="ยกเลิก"
              >
                <X size={16} /> <span className="whitespace-nowrap hidden sm:inline">ยกเลิก</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {folders.length === 0 && files.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 rounded-full animate-pulse"></div>
            <div className="relative p-10 bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-zinc-800 text-slate-200 dark:text-zinc-800">
              <HardDrive size={80} strokeWidth={1} />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-zinc-200 mb-2">
            ยังไม่มีไฟล์ในที่นี่
          </h3>
          <p className="text-sm font-bold text-slate-400 max-w-[300px]">
            เริ่มสร้างโฟลเดอร์หรืออัปโหลดไฟล์งานของคุณได้ทันที
          </p>
        </motion.div>
      )}

      {/* Create Modal - Modern Glass */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            >
              <div className="mb-8 text-center">
                <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl mb-4">
                  <Folder size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  สร้างโฟลเดอร์ใหม่
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  กำหนดชื่อและสิทธิ์การเข้าถึงโฟลเดอร์
                </p>
              </div>

              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="ชื่อโฟลเดอร์ (เช่น เอกสารการสอน)"
                autoFocus
                className="mb-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white transition-all shadow-inner"
              />

              <label className="mb-8 flex cursor-pointer items-center gap-4 rounded-2xl bg-indigo-50/50 p-5 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30 transition-all hover:bg-indigo-50">
                <input
                  type="checkbox"
                  checked={isCollaborative}
                  onChange={(e) => setIsCollaborative(e.target.checked)}
                  className="h-6 w-6 rounded-lg accent-indigo-600"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">
                    โหมดแฟ้มแชร์ (Shared Folder)
                  </span>
                  <span className="text-[10px] font-bold text-indigo-500/80">
                    อนุญาตให้ทุกคนช่วยลงข้อมูลและจัดการไฟล์ในนี้ได้
                  </span>
                </div>
              </label>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-500 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={createFolder}
                  className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95"
                >
                  สร้างทันที
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename/Edit Modal */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            >
              <div className="mb-8 text-center">
                <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl mb-4">
                  <Edit3 size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">จัดการรายการ</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  เปลี่ยนชื่อหรือตั้งค่าสิทธิ์การใช้งาน
                </p>
              </div>

              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="ระบุชื่อใหม่"
                autoFocus
                className="mb-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white shadow-inner"
              />

              {selectedItem?.type === "folder" && (
                <label className="mb-8 flex cursor-pointer items-center gap-4 rounded-2xl bg-indigo-50/50 p-5 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30 transition-all hover:bg-indigo-50">
                  <input
                    type="checkbox"
                    checked={isCollaborative}
                    onChange={(e) => setIsCollaborative(e.target.checked)}
                    className="h-6 w-6 rounded-lg accent-indigo-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">
                      โหมดแฟ้มแชร์ (Shared Folder)
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500/80">
                      อนุญาตให้ทุกคนช่วยลงข้อมูลได้
                    </span>
                  </div>
                </label>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-500 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={renameItem}
                  className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95"
                >
                  บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move Modal - Premium Picker */}
      <AnimatePresence>
        {isMoveModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl rounded-[40px] bg-white p-10 shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white">
                    <Move size={24} />
                  </div>
                  ย้ายรายการไปที่...
                </h3>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  เลือกโฟลเดอร์ปลายทางสำหรับ "{selectedItem?.name}"
                </p>
              </div>

              <div className="mb-8 max-h-[350px] overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50/50 p-3 dark:bg-zinc-900 dark:border-zinc-800 custom-scrollbar space-y-1.5">
                <button
                  onClick={() => moveItem("root")}
                  className="flex w-full items-center gap-4 rounded-[20px] p-4 text-sm font-black text-slate-700 transition-all hover:bg-white hover:text-blue-600 hover:shadow-lg dark:text-zinc-300 dark:hover:bg-zinc-800 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                    <HardDrive size={20} />
                  </div>
                  หน้าแรก (Root)
                </button>

                {allFoldersList
                  .filter((f) => f._id !== selectedItem?.id) // Prevent self-move
                  .map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => moveItem(folder._id)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Folder size={18} className="text-amber-500" /> {folder.name}
                    </button>
                  ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-500 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl px-4 pt-16 sm:pt-0"
            onClick={() => setPreviewFile(null)}
          >
            {/* Previous Button */}
            {filteredFiles.findIndex((f) => f._id === previewFile._id) > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = filteredFiles.findIndex((f) => f._id === previewFile._id);
                  setPreviewFile(filteredFiles[currentIndex - 1]);
                }}
                className="absolute left-2 sm:left-6 z-50 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all shadow-xl hover:scale-110"
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-6xl h-[85vh] sm:h-[90vh] bg-black/80 rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="p-3 bg-white/10 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-all shadow-lg"
                  title="ดาวน์โหลดไฟล์นี้"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-3 bg-white/10 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-all shadow-lg"
                  title="ปิด"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative">
                {previewFile.type?.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-full object-contain rounded-2xl select-none shadow-2xl"
                  />
                ) : previewFile.type?.startsWith("video/") ? (
                  <video
                    src={previewFile.url}
                    controls
                    playsInline
                    className="max-w-full max-h-full rounded-2xl shadow-2xl w-full"
                  />
                ) : previewFile.type?.includes("pdf") ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full rounded-2xl bg-white shadow-2xl"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center text-white bg-white/5 p-12 rounded-3xl backdrop-blur-sm border border-white/10">
                    <FileText size={80} className="mx-auto mb-6 opacity-50" />
                    <h3 className="text-2xl font-black mb-2">{previewFile.name}</h3>
                    <p className="text-slate-400 mb-8 font-medium">
                      ระบบไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้โดยตรง
                    </p>
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50 inline-flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      ดาวน์โหลดหรือเปิดในแท็บใหม่
                    </a>
                  </div>
                )}
              </div>

              <div className="p-5 bg-slate-900 border-t border-slate-800 text-white flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <div className="truncate font-black text-base max-w-xl">{previewFile.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                    {previewFile.type?.split("/")[1] || "FILE"}
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300 font-bold font-mono">
                  {formatSize(previewFile.size)}
                </div>
              </div>
            </motion.div>

            {/* Next Button */}
            {filteredFiles.findIndex((f) => f._id === previewFile._id) <
              filteredFiles.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = filteredFiles.findIndex((f) => f._id === previewFile._id);
                  setPreviewFile(filteredFiles[currentIndex + 1]);
                }}
                className="absolute right-2 sm:right-6 z-50 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all shadow-xl hover:scale-110"
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
