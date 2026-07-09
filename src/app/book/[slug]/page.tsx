"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Printer, LayoutGrid, FileText } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Dynamic import for Flipbook
const FlipbookViewer = dynamic(() => import("@/components/book/FlipbookViewer"), {
  ssr: false,
  loading: () => <div className="h-96 flex flex-col items-center justify-center gap-4 text-amber-500 font-bold"><BookOpen className="animate-bounce" />กำลังเตรียมหน้ากระดาษ E-Book...</div>
});

import { PrintDocument } from "@/components/book/PrintDocument";
import { IBook } from "@/models/Book";
import { IPage } from "@/models/Page";

export default function BookViewerPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [viewMode, setViewMode] = useState<"grid" | "flipbook">("grid");
  const [book, setBook] = useState<IBook | null>(null);
  const [pages, setPages] = useState<IPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printComponentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBookAndPages();
  }, [slug]);

  const fetchBookAndPages = async () => {
    setLoading(true);
    try {
      // Fetch books and find by slug (could be optimized with a specific endpoint, but this works)
      const res = await fetch("/api/books");
      const data = await res.json();
      const foundBook = data.data.find((b: IBook) => b.slug === slug);
      
      if (!foundBook) {
        setError("ไม่พบหนังสือที่คุณกำลังค้นหา");
        setLoading(false);
        return;
      }
      setBook(foundBook);

      // Fetch pages for this book
      const pagesRes = await fetch(`/api/books/${foundBook._id}/pages`);
      const pagesData = await pagesRes.json();
      if (pagesData.success) {
        setPages(pagesData.data);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: book?.title || "E-Book",
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">กำลังโหลดหนังสือ...</div>;
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-zinc-50">
        <BookOpen size={64} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-black text-zinc-700">{error}</h1>
        <Link href="/dashboard/books" className="mt-6 text-blue-500 font-bold hover:underline">กลับไปชั้นหนังสือ</Link>
      </div>
    );
  }

  const themeColor = book.themeColor || "blue";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintDocument ref={printComponentRef} book={book} pages={pages} />
      </div>

      {/* Hero Header */}
      <div className={`w-full bg-${themeColor}-950 text-white relative overflow-hidden border-b-4 border-${themeColor}-500`}>
        {/* Blurred Background */}
        {book.coverImageUrl && (
          <div 
            className="absolute inset-0 z-0 opacity-40 blur-3xl scale-125 bg-cover bg-center"
            style={{ backgroundImage: `url('${book.coverImageUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 z-0"></div>
        
        <div className="max-w-[1600px] w-full mx-auto px-6 py-12 md:py-20 relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm mb-8">
            <ArrowLeft size={16} /> กลับหน้าหลัก
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start md:items-center">
            {/* Book Cover Poster (Netflix style) */}
            {book.coverImageUrl && (
              <div className="w-48 sm:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/10 hidden md:block">
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-auto object-cover" />
              </div>
            )}
            
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${themeColor}-500/20 text-${themeColor}-300 border border-${themeColor}-500/30 text-[10px] font-black uppercase tracking-widest mb-4`}>
                <BookOpen size={12} /> E-BOOK LIBRARY
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                {book.title}
              </h1>
              {book.description && (
                <p className={`text-${themeColor}-200 font-medium text-lg max-w-2xl mb-8`}>
                  {book.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setViewMode(viewMode === "grid" ? "flipbook" : "grid")}
                  className={`px-8 py-4 bg-white text-${themeColor}-900 hover:bg-${themeColor}-100 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1`}
                >
                  {viewMode === "grid" ? (
                    <><BookOpen size={20} /> เปิดอ่านแบบ E-Book</>
                  ) : (
                    <><LayoutGrid size={20} /> ดูเนื้อหาแบบแกลเลอรี</>
                  )}
                </button>
                <button 
                  onClick={() => handlePrint()}
                  className={`px-8 py-4 bg-${themeColor}-500 text-white hover:bg-${themeColor}-400 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1`}
                >
                  <Printer size={20} /> เซฟเป็น PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] w-full mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {viewMode === "flipbook" && (
            <motion.div
              key="flipbook"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex justify-center"
            >
              <FlipbookViewer book={book} pages={pages} />
            </motion.div>
          )}

          {viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {pages.length === 0 ? (
                <div className="col-span-full text-center py-20 text-zinc-500 font-bold">
                  ยังไม่มีเนื้อหาในหนังสือเล่มนี้
                </div>
              ) : (
                pages.map((page, index) => (
                  <div key={page._id?.toString() || index} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 transition-transform group flex flex-col">
                    <div className="w-full aspect-video bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center border border-zinc-100 dark:border-zinc-700/50 overflow-hidden relative shrink-0">
                      {page.imageUrl ? (
                        <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={32} className="text-zinc-300 dark:text-zinc-700" />
                      )}
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                        PAGE {index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2 leading-snug truncate">
                      {page.title || "ไม่มีชื่อหน้า"}
                    </h3>
                    
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 flex-1 mb-4">
                      {page.content || "ไม่มีเนื้อหา"}
                    </p>
                    
                    {page.meta?.creator && (
                      <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                        <div className={`w-8 h-8 rounded-full bg-${themeColor}-50 flex items-center justify-center text-${themeColor}-600 font-bold text-xs`}>
                          {page.meta.creator.charAt(0)}
                        </div>
                        <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                          {page.meta.creator}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
