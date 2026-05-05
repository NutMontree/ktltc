/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

const fontList = [
  "Sarabun",
  "Kanit",
  "Prompt",
  "Mitr",
  "Roboto",
  "Arial",
  "Tahoma",
];

// --- Sub-Component: Sortable Image Item ---
function SortableImage({
  id,
  src,
  onRemove,
  isVertical = false,
  isNew = false,
  onZoom,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group touch-none bg-black ${
        isVertical ? "aspect-3/4" : "aspect-video"
      } ${isNew ? "border-blue-400 dark:border-blue-600" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="w-full h-full cursor-grab active:cursor-grabbing relative flex items-center justify-center"
      >
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt="preview"
            fill
            unoptimized
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        {isNew && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase z-20 shadow-lg border border-white/20">
            New
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

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-30">
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

      {/* Info Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[9px] font-black text-white/80 border border-white/10 pointer-events-none z-10">
        #{id.split('/').pop()?.substring(0, 4) || 'IMG'}
      </div>
    </div>
  );
}

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [SunEditorComponent, setSunEditorComponent] =
    useState<React.ComponentType<any> | null>(null);
  
  const [uploadStatus, setUploadStatus] = useState<{
    fileName: string;
    percent: number;
    loaded: number;
    total: number;
    startTime: number;
    currentIndex: number;
    totalCount: number;
  } | null>(null);

  
  // Client-side limits
  const MAX_IMAGE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE) || 200 * 1024 * 1024;


  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [publishDate, setPublishDate] = useState("");
  const [currentUser, setCurrentUser] = useState<any>({
    name: "กำลังโหลด...",
    image: null,
  });

  // --- Images State ---
  const [allImages, setAllImages] = useState<
    { id: string; src: string; file?: File; isNew: boolean }[]
  >([]);
  const [allNewsletters, setAllNewsletters] = useState<
    { id: string; src: string; file?: File; isNew: boolean }[]
  >([]);

  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });
  const [videoEmbeds, setVideoEmbeds] = useState<string[]>([]);
  const [currentEmbed, setCurrentEmbed] = useState("");
  const [currentFacebookEmbed, setCurrentFacebookEmbed] = useState("");
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    import("suneditor-react").then((mod) =>
      setSunEditorComponent(() => mod.default),
    );

    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content || "");
        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : [data.category || "PR"],
        );
        setCurrentUser({
          name: data.userName || data.author?.name || "งานศูนย์ข้อมูล วิทยาลัยเทคนิคกันทรลักษ์",
          image: data.userImage || data.author?.image || null,
        });

        // Date initialization
        if (data.createdAt) {
          const d = new Date(data.createdAt);
          const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setPublishDate(localISO);
        }

        setAllImages(
          (data.images || []).map((url: string) => ({
            id: url,
            src: url,
            isNew: false,
          })),
        );
        setAllNewsletters(
          (data.announcementImages || []).map((url: string) => ({
            id: url,
            src: url,
            isNew: false,
          })),
        );

        setLinks(data.links || []);
        setVideoEmbeds(data.videoEmbeds || []);
        setLoading(false);
      });
  }, [id]);

  const compressImage = async (file: File) => {
    const isGif =
      file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
    if (isGif) return file;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const normalizeEmbedHtml = (embedCode: string) =>
    embedCode
      .replace(/width="\d+"/g, 'width="100%"')
      .replace(/height="\d+"/g, 'height="100%"');

  const generateTitleFromContent = (htmlContent: string) => {
    if (typeof window === "undefined") return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const text = doc.body.textContent || "";
    const cleanText = text.replace(/\s+/g, " ").trim();
    if (!cleanText) return "";
    return cleanText.length > 100
      ? cleanText.substring(0, 100) + "..."
      : cleanText;
  };

  const handleDragEnd = (
    event: DragEndEvent,
    type: "general" | "newsletter",
  ) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (type === "general") {
        setAllImages((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        setAllNewsletters((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "general" | "newsletter",
  ) => {
    if (e.target.files) {
      setIsCompressing(true);
      const originalFiles = Array.from(e.target.files);

      // Client-side validation: check type and size before compressing/adding
      const acceptedFiles: File[] = [];
      for (const file of originalFiles) {
        const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
        const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);

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

      const compressed = await Promise.all(acceptedFiles.map((f) => compressImage(f)));


      const newItems = compressed.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        return { id: previewUrl, src: previewUrl, file, isNew: true };
      });

      if (type === "general") {
        setAllImages((prev) => [...prev, ...newItems]);
      } else {
        setAllNewsletters((prev) => [...prev, ...newItems]);
      }
      setIsCompressing(false);
    }
  };

  const addVideoEmbed = () => {
    const result = parseYouTubeVideoInput(currentEmbed);
    if (!result.ok || !result.iframeHtml) {
      alert(result.error || "ไม่สามารถแปลงลิงก์ YouTube ได้");
      return;
    }
    setVideoEmbeds((prev) => [...prev, result.iframeHtml as string]);
    setCurrentEmbed("");
  };

  const addFacebookEmbed = () => {
    const result = parseFacebookVideoInput(currentFacebookEmbed);
    if (!result.ok || !result.iframeHtml) {
      alert(result.error || "ไม่สามารถแปลงลิงก์ Facebook ได้");
      return;
    }
    setVideoEmbeds((prev) => [...prev, result.iframeHtml as string]);
    setCurrentFacebookEmbed("");
  };

  const handleUpdate = async () => {
    if (!content.trim() || submitting || isCompressing) {
      return alert("กรุณากรอกเนื้อหาข่าวสาร");
    }
    setSubmitting(true);

    try {
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
      const mainCategory = categories[0] || "General";

      // 1. อัปโหลดรูปใหม่ (พร้อมคำนวณ Progress)
      const totalToUpload =
        allImages.filter((i) => i.isNew).length +
        allNewsletters.filter((i) => i.isNew).length;
      let uploadedCount = 0;

      const finalImages = await Promise.all(
        allImages.map(async (item) => {
          if (item.isNew && item.file) {
            uploadedCount++;
            const result = await uploadFile(item.file, `ktltc_news/${mainCategory}/${datePath}`, (percent, loaded, total) => {
              setUploadStatus({
                fileName: item.file!.name,
                percent,
                loaded,
                total,
                startTime: Date.now(),
                currentIndex: uploadedCount,
                totalCount: totalToUpload,
              });
            });
            return result;
          }
          return { secure_url: item.src, thumbnail_url: null };
        }),
      );

      const finalNewsletters = await Promise.all(
        allNewsletters.map(async (item) => {
          if (item.isNew && item.file) {
            uploadedCount++;
            const result = await uploadFile(item.file, `ktltc_newsletters/${mainCategory}/${datePath}`, (percent, loaded, total) => {
              setUploadStatus({
                fileName: item.file!.name,
                percent,
                loaded,
                total,
                startTime: Date.now(),
                currentIndex: uploadedCount,
                totalCount: totalToUpload,
              });
            });
            return result;
          }
          return { secure_url: item.src, thumbnail_url: null };
        }),
      );

      setUploadStatus(null);

      // DOM-based safe auto-linking for HTML content
      const autoLinkHtml = (htmlString: string) => {
        if (typeof window === "undefined") return htmlString;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");

        const processNode = (node: Node) => {
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
                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 hover:underline break-all">$1</a>'
              );
              const parentDiv = node.parentNode;
              if (parentDiv) {
                Array.from(span.childNodes).forEach(child => {
                  parentDiv.insertBefore(child, node);
                });
                parentDiv.removeChild(node);
              }
            }
          } else {
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

      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle,
          content: formattedContent,
          categories,
          images: finalImages.map((u) => u.secure_url).filter((url) => url !== null),
          thumbnails: finalImages.map((u) => u.thumbnail_url).filter((url) => url !== null),
          announcementImages: finalNewsletters.map((u) => u.secure_url).filter((url) => url !== null),
          links,
          videoEmbeds,
          createdAt: publishDate ? new Date(publishDate).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        alert("✅ บันทึกการแก้ไขเรียบร้อย");
        router.push("/dashboard/news");
        router.refresh();
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-[1600px] mx-auto min-h-screen flex items-center justify-center text-slate-400 font-bold dark:bg-zinc-950">
        กำลังโหลดข้อมูล...
      </div>
    );

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
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/news"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-zinc-800"
            >
              <FiArrowLeft />
            </Link>
            <div>
              <h1 className="mb-1 text-xl font-bold leading-none dark:text-white">
                ย้อนกลับ
              </h1>
              <p className="text-[10px] uppercase tracking-tighter text-slate-500">
                ผู้เขียน:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentUser.name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              disabled={submitting || isCompressing}
              className={`hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all sm:flex ${
                submitting || isCompressing
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95"
              }`}
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <FiCheckCircle /> บันทึกการแก้ไข
                </>
              )}
            </button>

            <button
              onClick={handleUpdate}
              disabled={submitting || isCompressing}
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-white shadow-lg transition-all sm:hidden ${
                submitting || isCompressing
                  ? "bg-slate-200 text-slate-400"
                  : "bg-indigo-600 active:scale-95"
              }`}
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <FiCheckCircle size={18} />
                  <span className="text-xs font-bold">บันทึก</span>
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
                onChange={(e) => setPublishDate(`${e.target.value}T${publishDate.split("T")[1] || "00:00"}`)}
                className="w-full sm:flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 font-bold text-sm outline-none"
              />
              <div className="w-full sm:w-auto flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 px-2">
                <select
                  value={publishDate ? (publishDate.split("T")[1]?.split(":")[0] || "00") : "00"}
                  onChange={(e) => setPublishDate(`${publishDate.split("T")[0]}T${e.target.value}:${publishDate.split("T")[1]?.split(":")[1] || "00"}`)}
                  className="bg-transparent p-4 font-bold text-lg outline-none cursor-pointer text-center hover:text-indigo-600 transition-colors scrollbar-hide"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={String(i).padStart(2, "0")} className="text-slate-800 dark:text-white">
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="font-black text-slate-400 text-lg">:</span>
                <select
                  value={publishDate ? (publishDate.split("T")[1]?.split(":")[1] || "00") : "00"}
                  onChange={(e) => setPublishDate(`${publishDate.split("T")[0]}T${publishDate.split("T")[1]?.split(":")[0] || "00"}:${e.target.value}`)}
                  className="bg-transparent p-4 font-bold text-lg outline-none cursor-pointer text-center hover:text-indigo-600 transition-colors scrollbar-hide"
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={String(i).padStart(2, "0")} className="text-slate-800 dark:text-white">
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
          <div className="overflow-hidden rounded-4xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                    [
                      "bold",
                      "underline",
                      "italic",
                      "strike",
                      "fontColor",
                      "hiliteColor",
                    ],
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
              {allImages.length} รูปภาพ
            </span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "general")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SortableContext
                items={allImages.map((i) => i.id)}
                strategy={rectSortingStrategy}
              >
                {allImages.map((item) => (
                  <SortableImage
                    key={item.id}
                    id={item.id}
                    src={item.src}
                    isNew={item.isNew}
                    onZoom={setSelectedZoomImage}
                    onRemove={() =>
                      setAllImages(allImages.filter((i) => i.id !== item.id))
                    }
                  />
                ))}
              </SortableContext>
              <label className="aspect-video border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/30 transition-all bg-white dark:bg-zinc-900 group">
                <input
                  type="file"
                  multiple
                  accept="image/*,.gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "general")}
                />
                <FiPlus
                  size={24}
                  className="text-slate-300 group-hover:text-indigo-500"
                />
                <span className="text-[10px] font-bold text-slate-400 mt-2">
                  เพิ่มรูปภาพ
                </span>
              </label>
            </div>
          </DndContext>
        </section>

        {/* Newsletter Album */}
        <section className="space-y-6">
          <h2 className="font-extrabold flex items-center gap-2 text-lg">
            <FiFileText className="text-purple-500" /> จดหมายข่าว (A4)
          </h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "newsletter")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SortableContext
                items={allNewsletters.map((i) => i.id)}
                strategy={rectSortingStrategy}
              >
                {allNewsletters.map((item) => (
                  <SortableImage
                    key={item.id}
                    id={item.id}
                    src={item.src}
                    isVertical
                    isNew={item.isNew}
                    onZoom={setSelectedZoomImage}
                    onRemove={() =>
                      setAllNewsletters(
                        allNewsletters.filter((i) => i.id !== item.id),
                      )
                    }
                  />
                ))}
              </SortableContext>
              <label className="aspect-3/4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-all bg-white dark:bg-zinc-900 group">
                <input
                  type="file"
                  multiple
                  accept="image/*,.gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "newsletter")}
                />
                <FiPlus className="text-slate-300 group-hover:text-purple-500" />
                <span className="text-[10px] font-bold text-slate-400 mt-2">
                  เพิ่มแผ่นจดหมาย
                </span>
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
                  <span className="text-xs font-bold text-blue-600">
                    {l.label}
                  </span>
                  <button
                    onClick={() =>
                      setLinks(links.filter((_, idx) => idx !== i))
                    }
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
              onChange={(e) =>
                setCurrentLink({ ...currentLink, label: e.target.value })
              }
              className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs outline-none"
            />
            <input
              placeholder="URL ลิงก์"
              value={currentLink.url}
              onChange={(e) =>
                setCurrentLink({ ...currentLink, url: e.target.value })
              }
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
                      onClick={() =>
                        setVideoEmbeds(
                          videoEmbeds.filter((_, idx) => idx !== i),
                        )
                      }
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
            onClick={handleUpdate}
            disabled={submitting || isCompressing}
            className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center justify-center gap-4 ${submitting || isCompressing ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl active:scale-[0.98]"}`}
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiCheckCircle size={28} /> ยืนยันการแก้ไขข่าวสาร
              </>
            )}
          </button>
        </section>

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
      </main>

      {/* Floating Status */}
      {isCompressing && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-60 bg-indigo-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-bounce">
          <span className="text-sm font-black italic">
            กำลังเตรียมรูปภาพ...
          </span>
        </div>
      )}
    </div>
  );
}
