"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { parseFacebookVideoInput } from "@/lib/facebook";
import { parseYouTubeVideoInput } from "@/lib/youtube";
import { uploadFile } from "@/lib/upload";
import imageCompression from "browser-image-compression";
import "suneditor/dist/css/suneditor.min.css";
import { motion, AnimatePresence } from "framer-motion";
// --- DND Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FiArrowLeft,
  FiCalendar,
  FiFacebook,
  FiImage,
  FiFileText,
  FiLink,
  FiYoutube,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiMaximize2,
  FiSearch,
  FiX,
} from "react-icons/fi";

// --- Config ---
const CATEGORIES = [
  { value: "PR", label: "ข่าวประชาสัมพันธ์", color: "bg-blue-500" },
  { value: "Newsletter", label: "จดหมายข่าว", color: "bg-purple-500" },
  { value: "Internship", label: "ฝึกงาน/ประสบการณ์", color: "bg-emerald-500" },
  { value: "Announcement", label: "ข่าวประกาศ", color: "bg-orange-500" },
  { value: "Bidding", label: "ประกวดราคา", color: "bg-pink-500" },
  { value: "Order", label: "คำสั่งวิทยาลัย", color: "bg-indigo-500" },
];

const fontList = ["Sarabun", "Kanit", "Prompt", "Mitr", "Roboto", "Arial", "Tahoma"];

// ✅ Helper สำหรับบันทึก Log
async function recordActivity(data: {
  userName: string;
  action: string;
  details: string;
  link?: string;
}) {
  try {
    await fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

// --- Sub-Component: Sortable Image Item ---
function SortableImage({ id, src, onRemove, onZoom, isVertical = false, isVideo = false }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group touch-none bg-black ${isVertical ? "aspect-3/4" : "aspect-video"}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="w-full h-full cursor-grab active:cursor-grabbing relative flex items-center justify-center"
      >
        {isVideo ? (
          <video src={src} className="object-contain w-full h-full" controls playsInline />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt="preview"
              fill
              unoptimized
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        {/* Overlay for drag instruction - only visible on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600/90 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              Drag to Reorder
            </span>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="w-8 h-8 bg-white/90 dark:bg-zinc-900/90 text-rose-500 rounded-full flex items-center justify-center shadow-xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-slate-200 dark:border-zinc-700"
          title="ลบออก"
        >
          <FiTrash2 size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onZoom(src);
          }}
          className="w-8 h-8 bg-white/90 dark:bg-zinc-900/90 text-blue-500 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-slate-200 dark:border-zinc-700"
          title="ขยายดู"
        >
          <FiMaximize2 size={14} />
        </button>
      </div>

      {/* Index Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[9px] font-black text-white/80 border border-white/10 pointer-events-none z-10">
        #{id.split("/").pop()?.substring(0, 4) || "IMG"}
      </div>
    </div>
  );
}

export default function AddNewsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(["PR"]);
  const [content, setContent] = useState("");
  const [publishDate, setPublishDate] = useState(() => {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().slice(0, 16);
  });
  const [currentUser, setCurrentUser] = useState<any>({
    name: "งานศูนย์ข้อมูล...",
    image: null,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newsletterFiles, setNewsletterFiles] = useState<File[]>([]);
  const [newsletterPreviews, setNewsletterPreviews] = useState<string[]>([]);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });
  const [videoEmbeds, setVideoEmbeds] = useState<string[]>([]);
  const [currentEmbed, setCurrentEmbed] = useState("");
  const [currentFacebookEmbed, setCurrentFacebookEmbed] = useState("");
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    fileName: string;
    percent: number;
    loaded: number;
    total: number;
    startTime: number;
    currentIndex: number;
    totalCount: number;
  } | null>(null);

  // Client-side limits (can be controlled via NEXT_PUBLIC_* env vars)
  const MAX_IMAGE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE) || 200 * 1024 * 1024;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [SunEditorComponent, setSunEditorComponent] = useState<React.ComponentType<any> | null>(
    null,
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser({
            name: userData.name || userData.user?.name || "งานศูนย์ข้อมูล วิทยาลัยเทคนิคกันทรลักษ์",
            image: userData.image || userData.user?.image || null,
          });
        }
      } catch (err) {
        setCurrentUser({
          name: "งานศูนย์ข้อมูล วิทยาลัยเทคนิคกันทรลักษ์",
          image: null,
        });
      }
    };
    fetchUser();
    import("suneditor-react").then((mod) => setSunEditorComponent(() => mod.default));
  }, []);

  const compressImage = async (file: File) => {
    const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
    const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

    // Don't attempt image compression for GIFs or videos
    if (isGif || isVideo) return file;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      return file;
    }
  };

  const normalizeEmbedHtml = (embedCode: string) =>
    embedCode.replace(/width="\d+"/g, 'width="100%"').replace(/height="\d+"/g, 'height="100%"');

  const addVideoEmbed = () => {
    const result = parseYouTubeVideoInput(currentEmbed);

    if (!result.ok || !result.iframeHtml) {
      alert(result.error || "ไม่สามารถแปลงลิงก์ YouTube ได้");
      return;
    }

    const { iframeHtml } = result;
    setVideoEmbeds((prev) => [...prev, iframeHtml]);
    setCurrentEmbed("");
  };

  const addFacebookEmbed = () => {
    const result = parseFacebookVideoInput(currentFacebookEmbed);

    if (!result.ok || !result.iframeHtml) {
      alert(result.error || "ไม่สามารถแปลงลิงก์ Facebook ได้");
      return;
    }

    const { iframeHtml } = result;
    setVideoEmbeds((prev) => [...prev, iframeHtml]);
    setCurrentFacebookEmbed("");

    if (result.warning) {
      alert(result.warning);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "general" | "newsletter",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const originalFiles = Array.from(e.target.files);

      // Client-side validation: check type and size before compressing/adding
      const acceptedFiles: File[] = [];
      for (const file of originalFiles) {
        const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
        const isImage =
          file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);

        if (!isImage && !isVideo) {
          alert(`ข้ามไฟล์ '${file.name}' — ชนิดไฟล์ไม่รองรับ`);
          continue;
        }

        if (isImage && file.size > MAX_IMAGE_SIZE) {
          alert(`ข้ามไฟล์ '${file.name}' — ขนาดรูปเกิน ${MAX_IMAGE_SIZE} bytes`);
          continue;
        }

        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          alert(`ข้ามไฟล์ '${file.name}' — ขนาดวิดีโอเกิน ${MAX_VIDEO_SIZE} bytes`);
          continue;
        }

        acceptedFiles.push(file);
      }

      const compressedFiles = await Promise.all(acceptedFiles.map((file) => compressImage(file)));
      const newPreviews = compressedFiles.map((f) => URL.createObjectURL(f));

      if (type === "general") {
        setImageFiles((prev) => [...prev, ...compressedFiles]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      } else {
        setNewsletterFiles((prev) => [...prev, ...compressedFiles]);
        setNewsletterPreviews((prev) => [...prev, ...newPreviews]);
      }
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent, type: "general" | "newsletter") => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (type === "general") {
        const oldIndex = imagePreviews.indexOf(active.id as string);
        const newIndex = imagePreviews.indexOf(over.id as string);
        setImagePreviews((items) => arrayMove(items, oldIndex, newIndex));
        setImageFiles((items) => arrayMove(items, oldIndex, newIndex));
      } else {
        const oldIndex = newsletterPreviews.indexOf(active.id as string);
        const newIndex = newsletterPreviews.indexOf(over.id as string);
        setNewsletterPreviews((items) => arrayMove(items, oldIndex, newIndex));
        setNewsletterFiles((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return alert("กรุณาใส่เนื้อหาข่าวด้วยครับ");
    setIsLoading(true);
    try {
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
      const mainCategory = categories[0] || "General";

      // 1. อัปโหลดรูปภาพ (พร้อม Progress Bar)
      const totalToUpload = imageFiles.length + newsletterFiles.length;
      let uploadedCount = 0;

      const generalUploads = await Promise.all(
        imageFiles.map(async (f) => {
          uploadedCount++;
          // ตั้งค่าเริ่มต้นทันทีเพื่อให้ Modal เด้งขึ้นมา
          setUploadStatus({
            fileName: f.name,
            percent: 0,
            loaded: 0,
            total: f.size,
            startTime: Date.now(),
            currentIndex: uploadedCount,
            totalCount: totalToUpload,
          });
          return await uploadFile(
            f,
            `ktltc_news/${mainCategory}/${datePath}`,
            (percent, loaded, total) => {
              setUploadStatus({
                fileName: f.name,
                percent,
                loaded,
                total,
                startTime: Date.now(),
                currentIndex: uploadedCount,
                totalCount: totalToUpload,
              });
            },
          );
        }),
      );

      const newsletterUploads = await Promise.all(
        newsletterFiles.map(async (f) => {
          uploadedCount++;
          // ตั้งค่าเริ่มต้นทันทีเพื่อให้ Modal เด้งขึ้นมา
          setUploadStatus({
            fileName: f.name,
            percent: 0,
            loaded: 0,
            total: f.size,
            startTime: Date.now(),
            currentIndex: uploadedCount,
            totalCount: totalToUpload,
          });
          return await uploadFile(
            f,
            `ktltc_newsletters/${mainCategory}/${datePath}`,
            (percent, loaded, total) => {
              setUploadStatus({
                fileName: f.name,
                percent,
                loaded,
                total,
                startTime: Date.now(),
                currentIndex: uploadedCount,
                totalCount: totalToUpload,
              });
            },
          );
        }),
      );

      setUploadStatus(null); // เมื่อเสร็จแล้วให้ปิด Modal

      // DOM-based safe auto-linking for HTML content
      const autoLinkHtml = (htmlString: string) => {
        if (typeof window === "undefined") return htmlString;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");

        const processNode = (node: Node) => {
          // If node is a text node and not inside an <a> tag
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
            let parent = node.parentNode;
            while (parent && parent.nodeName.toLowerCase() !== "body") {
              if (parent.nodeName.toLowerCase() === "a") return;
              parent = parent.parentNode;
            }

            const text = node.nodeValue;
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            if (urlRegex.test(text)) {
              const span = document.createElement("span");
              span.innerHTML = text.replace(
                urlRegex,
                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 hover:underline break-all">$1</a>',
              );
              // Replace the original text node with the processed span's contents
              const parentDiv = node.parentNode;
              if (parentDiv) {
                Array.from(span.childNodes).forEach((child) => {
                  parentDiv.insertBefore(child, node);
                });
                parentDiv.removeChild(node);
              }
            }
          } else {
            // Need to convert to array because childNodes is live and might be mutated
            Array.from(node.childNodes).forEach(processNode);
          }
        };

        Array.from(doc.body.childNodes).forEach(processNode);
        return doc.body.innerHTML;
      };

      const formattedContent = autoLinkHtml(content);

      const newsTitle =
        content
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\n/g, " ")
          .substring(0, 100)
          .trim() + (content.length > 100 ? "..." : "");

      const payload = {
        title: newsTitle,
        categories,
        content: formattedContent,
        images: generalUploads.map((u) => u.secure_url).filter((u) => u !== null),
        thumbnails: generalUploads.map((u) => u.thumbnail_url).filter((u) => u !== null),
        announcementImages: newsletterUploads.map((u) => u.secure_url).filter((u) => u !== null),
        links,
        videoEmbeds,
        createdAt: new Date(publishDate).toISOString(),
        userName: currentUser.name,
        userImage: currentUser.image || null,
      };

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        const newsId = result.insertedId || result.id || result._id;

        await recordActivity({
          userName: currentUser.name,
          action: "CREATE_POST",
          details: `เพิ่มข่าวประชาสัมพันธ์หัวข้อ: "${newsTitle}"`,
          link: newsId ? `/news/${newsId}` : undefined,
        });

        router.push("/dashboard/news");
        router.refresh();
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20 font-['Sarabun']">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap");
        .sun-editor-editable {
          font-family: "Sarabun", sans-serif !important;
          border-radius: 1.5rem !important;
        }
        /* Force components (like pasted Facebook/LINE emoji images) to be inline and lack borders */
        .sun-editor-editable figure.se-component,
        .sun-editor-editable span.se-component,
        .sun-editor-editable div.se-component {
          display: inline-block !important;
          margin: 0 2px !important;
          border: none !important;
          outline: none !important;
          vertical-align: middle !important;
          float: none !important;
          background: transparent !important;
        }
        /* Make sure their inner images don't block out */
        .sun-editor-editable figure.se-component img {
          display: inline-block !important;
          vertical-align: middle !important;
        }
        /* Force links to be blue inside the editor */
        .sun-editor-editable a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-20 z-40 w-full border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-2 py-2">
          {/* ฝั่งซ้าย: ปุ่มย้อนกลับและข้อมูลผู้เขียน */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/news"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-zinc-800"
            >
              <FiArrowLeft />
            </Link>
            <div>
              <h1 className="mb-1 text-xl font-bold leading-none dark:text-white">ย้อนกลับ</h1>
              <p className="text-[10px] uppercase tracking-tighter text-slate-500">
                ผู้เขียน:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentUser.name}
                </span>
              </p>
            </div>
          </div>

          {/* ฝั่งขวา: ปุ่มยืนยัน (เผยแพร่ข่าว) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || isCompressing}
              className={`hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all sm:flex ${
                isLoading || isCompressing
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95"
              }`}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <FiCheckCircle /> เผยแพร่ข่าว
                </>
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || isCompressing}
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-white shadow-lg transition-all sm:hidden ${
                isLoading || isCompressing
                  ? "bg-slate-200 text-slate-400"
                  : "bg-indigo-600 active:scale-95"
              }`}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <FiCheckCircle size={18} />
                  <span className="text-xs font-bold">เผยแพร่</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-2 py-10 space-y-12">
        {/* Date & Categories */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <FiCalendar className="text-indigo-500" /> วันที่และเวลาลงข่าว (24 ชม.)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="date"
                value={publishDate ? publishDate.split("T")[0] : ""}
                onChange={(e) =>
                  setPublishDate(`${e.target.value}T${publishDate.split("T")[1] || "00:00"}`)
                }
                className="w-full sm:flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 font-bold text-sm outline-none"
              />
              <div className="w-full sm:w-auto flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 px-2">
                <select
                  value={publishDate ? publishDate.split("T")[1]?.split(":")[0] || "00" : "00"}
                  onChange={(e) =>
                    setPublishDate(
                      `${publishDate.split("T")[0]}T${e.target.value}:${publishDate.split("T")[1]?.split(":")[1] || "00"}`,
                    )
                  }
                  className="bg-transparent p-4 font-bold text-lg outline-none cursor-pointer text-center hover:text-indigo-600 transition-colors scrollbar-hide"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option
                      key={i}
                      value={String(i).padStart(2, "0")}
                      className="text-slate-800 dark:text-white"
                    >
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="font-black text-slate-400 text-lg">:</span>
                <select
                  value={publishDate ? publishDate.split("T")[1]?.split(":")[1] || "00" : "00"}
                  onChange={(e) =>
                    setPublishDate(
                      `${publishDate.split("T")[0]}T${publishDate.split("T")[1]?.split(":")[0] || "00"}:${e.target.value}`,
                    )
                  }
                  className="bg-transparent p-4 font-bold text-lg outline-none cursor-pointer text-center hover:text-indigo-600 transition-colors scrollbar-hide"
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option
                      key={i}
                      value={String(i).padStart(2, "0")}
                      className="text-slate-800 dark:text-white"
                    >
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="font-bold text-slate-400 pr-4 text-xs">น.</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
              เลือกหมวดหมู่
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setCategories((prev) =>
                      prev.includes(cat.value)
                        ? prev.length > 1
                          ? prev.filter((c) => c !== cat.value)
                          : prev
                        : [...prev, cat.value],
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-[10px] font-extrabold border transition-all ${categories.includes(cat.value) ? `${cat.color} text-white border-transparent` : "text-slate-400 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Editor */}
        <section className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 italic text-indigo-600">
            <FiFileText /> เนื้อหาข่าวสาร
          </label>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {SunEditorComponent ? (
              <SunEditorComponent
                setContents={content}
                onChange={setContent}
                height="450px"
                setOptions={{
                  font: fontList,
                  buttonList: [
                    ["undo", "redo"],
                    ["font", "fontSize", "formatBlock"],
                    ["bold", "underline", "italic", "strike", "fontColor", "hiliteColor"],
                    ["align", "list", "table", "link", "image", "video"],
                    ["fullScreen", "codeView"],
                  ],
                }}
              />
            ) : (
              <div className="h-[450px] flex items-center justify-center text-slate-400 italic">
                กำลังโหลด...
              </div>
            )}
          </div>
        </section>

        {/* Image Album */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <FiImage className="text-indigo-500" /> อัลบั้มรูปภาพ
            </h2>
            <span className="text-[10px] font-bold text-slate-400">
              {imagePreviews.length} รูปภาพ
            </span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "general")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              <SortableContext items={imagePreviews} strategy={rectSortingStrategy}>
                {imagePreviews.map((src, i) => (
                  <SortableImage
                    key={src}
                    id={src}
                    src={src}
                    isVideo={imageFiles[i]?.type?.startsWith("video/")}
                    onZoom={setSelectedZoomImage}
                    onRemove={() => {
                      URL.revokeObjectURL(src);
                      setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
                      setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                  />
                ))}
              </SortableContext>
              <label className="aspect-video border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/30 transition-all bg-white dark:bg-zinc-900 group">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "general")}
                />
                <FiPlus size={24} className="text-slate-300 group-hover:text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 mt-2">เพิ่มรูปภาพ</span>
              </label>
            </div>
          </DndContext>
        </section>

        {/* Newsletter Album */}
        <section className="space-y-6">
          <h2 className="font-extrabold flex items-center gap-2 text-lg">
            <FiFileText className="text-purple-500" /> จดหมายข่าว (A4)
          </h2>
          <DndContext sensors={sensors} onDragEnd={(e) => handleDragEnd(e, "newsletter")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SortableContext items={newsletterPreviews} strategy={rectSortingStrategy}>
                {newsletterPreviews.map((src, i) => (
                  <SortableImage
                    key={src}
                    id={src}
                    src={src}
                    isVertical
                    isVideo={newsletterFiles[i]?.type?.startsWith("video/")}
                    onZoom={setSelectedZoomImage}
                    onRemove={() => {
                      URL.revokeObjectURL(src);
                      setNewsletterFiles((prev) => prev.filter((_, idx) => idx !== i));
                      setNewsletterPreviews((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                  />
                ))}
              </SortableContext>
              <label className="aspect-3/4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-all bg-white dark:bg-zinc-900 group">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "newsletter")}
                />
                <FiPlus className="text-slate-300 group-hover:text-purple-500" />
                <span className="text-[10px] font-bold text-slate-400 mt-2">เพิ่มแผ่นจดหมาย</span>
              </label>
            </div>
          </DndContext>
        </section>

        {/* Links Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiLink className="text-blue-500" /> ลิงก์ที่เกี่ยวข้อง
            </div>
          </h3>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              {links.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm"
                >
                  <span className="text-xs font-bold text-blue-600">{l.label}</span>
                  <button
                    onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:scale-110 transition-transform"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="ชื่อปุ่ม"
              value={currentLink.label}
              onChange={(e) => setCurrentLink({ ...currentLink, label: e.target.value })}
              className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs outline-none"
            />
            <input
              placeholder="URL ลิงก์"
              value={currentLink.url}
              onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
              className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs outline-none text-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (currentLink.label && currentLink.url) {
                setLinks([...links, currentLink]);
                setCurrentLink({ label: "", url: "" });
              }
            }}
            className="w-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 py-4 rounded-2xl text-[11px] font-black hover:bg-blue-100 transition-all"
          >
            เพิ่มลิงก์
          </button>
        </section>

        {/* Video Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <FiYoutube className="text-red-500" /> วิดีโอ YouTube / Facebook
          </h3>
          {videoEmbeds.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              {videoEmbeds.map((v, i) => (
                <div
                  key={i}
                  className="relative aspect-video bg-black rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setVideoEmbeds(videoEmbeds.filter((_, idx) => idx !== i))}
                      className="bg-red-600 text-white p-2 rounded-full"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: normalizeEmbedHtml(v),
                    }}
                    className="w-full h-full pointer-events-none"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                <FiYoutube /> YouTube Embed
              </label>
              <textarea
                placeholder="วาง <iframe> code จาก YouTube"
                value={currentEmbed}
                onChange={(e) => setCurrentEmbed(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 p-4 rounded-2xl text-xs border border-slate-200 dark:border-zinc-800 h-28 outline-none"
              />
              <button
                type="button"
                onClick={addVideoEmbed}
                className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 py-4 rounded-2xl text-[11px] font-black hover:bg-red-100 transition-all"
              >
                เพิ่มวิดีโอ YouTube
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <FiFacebook /> Facebook Embed
              </label>
              <textarea
                placeholder="วาง <iframe> code จาก Facebook Video"
                value={currentFacebookEmbed}
                onChange={(e) => setCurrentFacebookEmbed(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 p-4 rounded-2xl text-xs border border-slate-200 dark:border-zinc-800 h-28 outline-none"
              />
              <button
                type="button"
                onClick={addFacebookEmbed}
                className="w-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 py-4 rounded-2xl text-[11px] font-black hover:bg-blue-100 transition-all"
              >
                เพิ่มวิดีโอ Facebook
              </button>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <section className="pt-10 border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={handleSubmit}
            disabled={isLoading || isCompressing}
            className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center justify-center gap-4 ${isLoading || isCompressing ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl active:scale-[0.98]"}`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiCheckCircle size={28} /> ยืนยันและเผยแพร่ข่าวสาร
              </>
            )}
          </button>
        </section>
      </main>

      {/* Zoom Modal (Lightbox) */}
      <AnimatePresence>
        {selectedZoomImage && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedZoomImage(null)}
              className="absolute inset-0 cursor-zoom-out"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
                <Image
                  src={selectedZoomImage}
                  alt="Full Zoom"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              <button
                onClick={() => setSelectedZoomImage(null)}
                className="absolute top-[-20px] right-[-20px] md:top-0 md:right-0 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all pointer-events-auto border border-white/20 shadow-2xl"
              >
                <FiX size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Progress Modal */}
      {uploadStatus && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Progress Circle */}
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * uploadStatus.percent) / 100}
                    className="text-indigo-600 transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-indigo-600">
                    {uploadStatus.percent}%
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-black mb-2 dark:text-white">
                กำลังอัปโหลดไฟล์ที่ {uploadStatus.currentIndex}/{uploadStatus.totalCount}
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium truncate w-full px-4">
                {uploadStatus.fileName}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">
                    ขนาดไฟล์
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                    {(uploadStatus.loaded / (1024 * 1024)).toFixed(1)} /{" "}
                    {(uploadStatus.total / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">
                    ความคืบหน้า
                  </p>
                  <p className="text-sm font-bold text-indigo-600">{uploadStatus.percent}%</p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4 shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                  style={{ width: `${uploadStatus.percent}%` }}
                />
              </div>

              <p className="text-[11px] font-bold text-slate-400 animate-pulse italic">
                กรุณาอย่าปิดหน้านี้จนกว่าการอัปโหลดจะเสร็จสิ้น...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
