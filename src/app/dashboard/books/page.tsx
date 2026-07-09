"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, ArrowLeft, BookOpen, AlertCircle, Layout } from "lucide-react";
import Link from "next/link";
import { IBook } from "@/models/Book";

export default function BooksShelfManager() {
  const [books, setBooks] = useState<IBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<IBook> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเล่มนี้? ข้อมูลหน้าทั้งหมดจะถูกลบด้วย!")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchBooks();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isEditing = !!currentBook?._id;
      const url = isEditing ? `/api/books/${currentBook._id}` : "/api/books";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentBook),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchBooks();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Save error:", error);
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setCurrentBook(prev => ({ ...prev, coverImageUrl: data.url }));
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-blue-600 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft size={16} /> กลับสู่หน้าแดชบอร์ด
          </Link>
          <h1 className="text-2xl font-black text-blue-900 dark:text-blue-400 flex items-center gap-3">
            <BookOpen className="text-blue-600" />
            ระบบจัดการหนังสือ (Books Library)
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            สร้างและบริหารจัดการเล่มหนังสือ E-Book ทั้งหมดในระบบ
          </p>
        </div>
        <button 
          onClick={() => {
            setCurrentBook({ title: "", slug: "", description: "", coverImageUrl: "", themeColor: "blue" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-800 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-900/20 transition-all font-bold active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          สร้างหนังสือใหม่
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="ค้นหาชื่อหนังสือ หรือ URL Slug..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 text-sm font-medium transition-all"
        />
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-bold uppercase tracking-widest text-sm">กำลังโหลดข้อมูลชั้นหนังสือ...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <AlertCircle className="text-zinc-300 w-16 h-16" />
          <p className="text-zinc-500 font-bold">ไม่พบข้อมูลหนังสือ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book._id!.toString()} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div 
                className={`w-full aspect-4/3 bg-zinc-100 relative ${!book.coverImageUrl && `bg-${book.themeColor || 'blue'}-900`}`}
                style={book.coverImageUrl ? { backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!book.coverImageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white/50">
                    <BookOpen size={48} className="mb-4 opacity-50" />
                    <span className="font-bold">{book.title}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-zinc-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border border-zinc-200">
                  /{book.slug}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-blue-950 dark:text-blue-100 text-lg mb-1 leading-tight line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
                  {book.description || "ไม่มีคำอธิบาย"}
                </p>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/book/${book.slug}`}
                    target="_blank"
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <BookOpen size={16} /> ดูหน้าหนังสือจริง (หน้าสำหรับอ่าน)
                  </Link>
                  <Link 
                    href={`/dashboard/books/${book._id}/pages`}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Layout size={16} /> จัดการเนื้อหาหน้ากระดาษ
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentBook(book);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Edit2 size={14} /> แก้ไขเล่ม
                    </button>
                    <button
                      onClick={() => handleDelete(book._id!.toString())}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 my-8">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 rounded-t-2xl z-10">
              <h2 className="text-xl font-black text-blue-900 dark:text-blue-400">
                {currentBook?._id ? "แก้ไขหนังสือ" : "สร้างหนังสือใหม่"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 bg-zinc-100 p-2 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">ชื่อหนังสือ</label>
                <input 
                  required
                  type="text" 
                  value={currentBook?.title || ""}
                  onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="เช่น หนังสือคู่มือ WFH"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">URL Slug (ต้องเป็นภาษาอังกฤษ / ตัวเลข / ขีด)</label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-zinc-500 text-sm">/book/</span>
                  <input 
                    required
                    type="text" 
                    value={currentBook?.slug || ""}
                    onChange={(e) => setCurrentBook({ ...currentBook, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, "") })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-r-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium font-mono"
                    placeholder="wfh-manual"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">รายละเอียดคำอธิบายสั้นๆ (ถ้ามี)</label>
                <textarea 
                  rows={2}
                  value={currentBook?.description || ""}
                  onChange={(e) => setCurrentBook({ ...currentBook, description: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                  placeholder="คู่มืออธิบายการใช้งานระบบ WFH สำหรับเจ้าหน้าที่"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">ภาพหน้าปก</label>
                <div className="flex flex-col gap-3">
                  {currentBook?.coverImageUrl && (
                    <div className="w-full aspect-4/3 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                      <img src={currentBook.coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">สีธีมหลัก (เผื่อไม่มีภาพปก)</label>
                <select 
                  value={currentBook?.themeColor || "blue"}
                  onChange={(e) => setCurrentBook({ ...currentBook, themeColor: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                >
                  <option value="blue">Blue (น้ำเงิน)</option>
                  <option value="amber">Amber (ส้มทอง)</option>
                  <option value="emerald">Emerald (เขียว)</option>
                  <option value="rose">Rose (แดง)</option>
                  <option value="purple">Purple (ม่วง)</option>
                </select>
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
                    "บันทึกหนังสือ"
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
