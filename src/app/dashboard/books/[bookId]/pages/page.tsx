"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon, Layout, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { IPage } from "@/models/Page";
import { IBook } from "@/models/Book";
import { useParams } from "next/navigation";

export default function PagesManager() {
  const params = useParams();
  const bookId = params.bookId as string;
  
  const [book, setBook] = useState<IBook | null>(null);
  const [pages, setPages] = useState<IPage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Partial<IPage> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBookData();
    fetchPages();
  }, [bookId]);

  const fetchBookData = async () => {
    try {
      const res = await fetch(`/api/books`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find((b: any) => b._id.toString() === bookId);
        if (found) setBook(found);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/pages`);
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหน้ากระดาษนี้?")) return;

    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPages();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isEditing = !!currentPage?._id;
      const url = isEditing ? `/api/pages/${currentPage._id}` : `/api/books/${bookId}/pages`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPage),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPages();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setCurrentPage(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setUploadingImage(false);
    }
  };

  const movePage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === pages.length - 1)
    ) return;

    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap pageNumber values conceptually
    const tempNum = newPages[index].pageNumber;
    newPages[index].pageNumber = newPages[targetIndex].pageNumber;
    newPages[targetIndex].pageNumber = tempNum;

    // Swap in array for immediate UI update
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    
    setPages(newPages);

    // Persist to DB
    try {
      await fetch(`/api/pages/${newPages[index]._id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageNumber: newPages[index].pageNumber })
      });
      await fetch(`/api/pages/${newPages[targetIndex]._id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageNumber: newPages[targetIndex].pageNumber })
      });
    } catch (e) {
      console.error("Failed to reorder", e);
      fetchPages(); // revert on fail
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col gap-1">
          <Link href="/dashboard/books" className="text-sm text-zinc-500 hover:text-blue-600 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft size={16} /> กลับสู่ชั้นหนังสือ
          </Link>
          <h1 className="text-2xl font-black text-blue-900 dark:text-blue-400 flex items-center gap-3">
            <Layout className="text-amber-500" />
            จัดการหน้ากระดาษ
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            หนังสือ: <span className="text-blue-600 font-bold">{book?.title || 'กำลังโหลด...'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {book && (
            <Link 
              href={`/book/${book.slug}`}
              target="_blank"
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 px-5 py-3 rounded-xl transition-all font-bold whitespace-nowrap"
            >
              ดู E-Book ปัจจุบัน
            </Link>
          )}
          <button 
            onClick={() => {
              setCurrentPage({ title: "", content: "", imageUrl: "", meta: { creator: "", department: "", year: "2569" } });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-800 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-900/20 transition-all font-bold active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            เพิ่มหน้าใหม่
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            กำลังโหลดข้อมูลหน้ากระดาษ...
          </div>
        ) : pages.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <ImageIcon className="text-zinc-300 w-16 h-16" />
            <p className="font-bold">ยังไม่มีหน้ากระดาษในหนังสือเล่มนี้</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pages.map((page, index) => (
              <div key={page._id!.toString()} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col items-center gap-1 w-12 shrink-0">
                  <button 
                    onClick={() => movePage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-zinc-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp size={20} />
                  </button>
                  <span className="font-black text-xl text-blue-900 dark:text-blue-300">{index + 1}</span>
                  <button 
                    onClick={() => movePage(index, 'down')}
                    disabled={index === pages.length - 1}
                    className="p-1 text-zinc-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>

                <div className="w-full md:w-32 aspect-4/3 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                  {page.imageUrl ? (
                    <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-bold">NO IMAGE</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-blue-950 dark:text-blue-100 text-lg truncate">
                    {page.title || "หน้าไม่มีชื่อ"}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {page.content || "ไม่มีเนื้อหา"}
                  </p>
                  {page.meta?.creator && (
                    <div className="text-xs font-bold text-amber-600 mt-2">
                      โดย {page.meta.creator} {page.meta.department ? `(${page.meta.department})` : ""}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setCurrentPage(page);
                      setIsModalOpen(true);
                    }}
                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-bold flex items-center gap-2"
                  >
                    <Edit2 size={16} /> แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(page._id!.toString())}
                    className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 my-8">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 rounded-t-2xl z-10">
              <h2 className="text-xl font-black text-blue-900 dark:text-blue-400">
                {currentPage?._id ? "แก้ไขหน้ากระดาษ" : "เพิ่มหน้าใหม่"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 bg-zinc-100 p-2 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">หัวข้อหลัก (Title)</label>
                <input 
                  required
                  type="text" 
                  value={currentPage?.title || ""}
                  onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-lg"
                  placeholder="เช่น ขั้นตอนที่ 1 หรือ ชื่อผลงาน"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">รูปภาพประกอบ (ถ้ามี)</label>
                <div className="flex flex-col gap-3">
                  {currentPage?.imageUrl && (
                    <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                      <img src={currentPage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 transition-all"
                  />
                </div>
                {uploadingImage && <p className="text-xs text-blue-500 font-bold mt-1">กำลังอัปโหลดรูปภาพ...</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">เนื้อหา (Content / Description)</label>
                <textarea 
                  rows={6}
                  value={currentPage?.content || ""}
                  onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-y"
                  placeholder="พิมพ์รายละเอียดเนื้อหาของหน้านี้..."
                ></textarea>
              </div>

              {/* Optional Meta fields for backward compatibility with Inventions */}
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-900/50 space-y-4">
                <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  ข้อมูลเสริม (Meta Data)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">ผู้จัดทำ / ผู้แต่ง</label>
                    <input 
                      type="text" 
                      value={currentPage?.meta?.creator || ""}
                      onChange={(e) => setCurrentPage({ ...currentPage, meta: { ...currentPage?.meta, creator: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">แผนก / หน่วยงาน</label>
                    <input 
                      type="text" 
                      value={currentPage?.meta?.department || ""}
                      onChange={(e) => setCurrentPage({ ...currentPage, meta: { ...currentPage?.meta, department: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 rounded-b-2xl border-t border-zinc-100 dark:border-zinc-800 py-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      บันทึก...
                    </>
                  ) : (
                    "บันทึกหน้ากระดาษ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
