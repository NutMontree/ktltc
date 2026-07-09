"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, ArrowRight, Library } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IBook } from "@/models/Book";

export default function PublicBooksLibrary() {
  const [books, setBooks] = useState<IBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

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
      } else {
        setError(data.error || "Failed to load books");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/20 opacity-60"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] dark:opacity-10 z-0"></div>
        
        <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 border border-blue-200 dark:border-blue-800/50 shadow-sm"
          >
            <Library size={16} /> KTLTC Digital Library
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-6"
          >
            คลังหนังสืออิเล็กทรอนิกส์
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              วิทยาลัยเทคนิคกันทรลักษ์
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10"
          >
            ค้นหาและเปิดอ่านหนังสือคู่มือ เอกสารประกอบการสอน และผลงานวิชาการทั้งหมดได้ที่นี่
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-linear-to-rrom-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="pl-6 text-zinc-400">
                <Search size={24} />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหาชื่อหนังสือ หรือคำสำคัญ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-5 px-4 bg-transparent border-none outline-none text-zinc-900 dark:text-white text-lg font-medium placeholder:text-zinc-400"
              />
              <div className="pr-2">
                <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold px-3 py-2 rounded-xl">
                  {filteredBooks.length} เล่ม
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] w-full mx-auto px-6 py-20">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold tracking-widest uppercase text-sm animate-pulse">กำลังโหลดชั้นหนังสือ...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900">
            <p className="text-rose-500 font-bold text-lg">{error}</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
            <h3 className="text-2xl font-black text-zinc-700 dark:text-zinc-300 mb-2">ไม่พบหนังสือที่คุณค้นหา</h3>
            <p className="text-zinc-500">ลองใช้คำค้นหาอื่น หรือตรวจดูตัวสะกดอีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book._id?.toString() || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/book/${book.slug}`} className="block h-full group">
                    <div className="bg-white dark:bg-zinc-900 rounded-4xl p-4 h-full flex flex-col shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-100 dark:border-zinc-800 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
                      
                      {/* Book Cover */}
                      <div 
                        className={`w-full aspect-3/4 rounded-2xl mb-6 relative overflow-hidden bg-${book.themeColor || 'blue'}-950 shadow-inner`}
                      >
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-linear-to-br from-zinc-800 to-zinc-950">
                            <BookOpen size={48} className="text-white/20 mb-4" />
                            <span className="font-black text-white/50 text-xl leading-snug">{book.title}</span>
                          </div>
                        )}
                        
                        {/* Overlay Gradient for readability if needed */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Read Button Overlay */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="bg-white text-zinc-900 font-bold text-sm px-5 py-2 rounded-full shadow-lg flex items-center gap-2">
                            เปิดอ่าน <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 flex flex-col px-2">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2 h-2 rounded-full bg-${book.themeColor || 'blue'}-500`}></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-Book</span>
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4 flex-1">
                          {book.description || "หนังสืออิเล็กทรอนิกส์ (E-Book) เพื่อการศึกษาและการใช้งานภายในองค์กร"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
