"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "suneditor/dist/css/suneditor.min.css"; // Import CSS ของ Editor

interface PageItem {
  _id: string;
  slug: string;
  title: string;
  content: string;
}

export default function ManagePages() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // ✅ State เก็บตัว Editor (โหลดแบบ Dynamic)
  const [SunEditorComponent, setSunEditorComponent] =
    useState<React.ComponentType<any> | null>(null);

  // ✅ โหลด Editor เฉพาะฝั่ง Client เพื่อแก้ปัญหา window is not defined
  useEffect(() => {
    import("suneditor-react").then((mod) => {
      setSunEditorComponent(() => mod.default);
    });
  }, []);

  // ฟังก์ชันดึงข้อมูลหน้าเว็บทั้งหมด
  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // ฟังก์ชันรีเซ็ตฟอร์ม
  const resetForm = () => {
    setSlug("");
    setTitle("");
    setContent("");
    setEditId(null);
  };

  // ฟังก์ชันบันทึกข้อมูล (เพิ่ม/แก้ไข)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cleanSlug = slug.replace(/^\//, ""); // ลบ / ตัวหน้าออกถ้ามี

    const method = editId ? "PUT" : "POST";
    const bodyData = { _id: editId, slug: cleanSlug, title, content };

    try {
      const res = await fetch("/api/pages", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        alert("บันทึกหน้าเว็บสำเร็จ!");
        fetchPages();
        resetForm();
      } else {
        alert("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันเริ่มแก้ไข
  const handleEdit = (p: PageItem) => {
    setEditId(p._id);
    setSlug(p.slug);
    setTitle(p.title);
    setContent(p.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ฟังก์ชันลบหน้าเว็บ
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "คุณต้องการลบหน้านี้ใช่หรือไม่? \nการกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/pages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("ลบหน้าเว็บสำเร็จ!");
        fetchPages();
        if (editId === id) {
          resetForm();
        }
      } else {
        const errorText = await res.text();
        try {
          const data = JSON.parse(errorText);
          alert(data.error || "เกิดข้อผิดพลาดในการลบ");
        } catch {
          console.warn("API Error (Non-JSON):", errorText);
          alert(`เกิดข้อผิดพลาด (${res.status}: ${res.statusText})`);
        }
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] py-12 mx-auto p-4 text-zinc-800 dark:text-zinc-200">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight dark:text-white">
              จัดการจัดการเนื้อหาหน้าเว็บ (Pages) (Pages)
            </h1>
            <p className="text-zinc-500 mt-1 dark:text-zinc-400">
              สร้างหน้าเว็บใหม่ด้วย Rich Text Editor
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
          >
            ← กลับ Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-800 dark:text-white">
                {editId ? (
                  <>
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm dark:bg-yellow-900/30 dark:text-yellow-400">
                      ✏️
                    </span>
                    แก้ไขเนื้อหา
                  </>
                ) : (
                  <>
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm dark:bg-blue-900/30 dark:text-blue-400">
                      ➕
                    </span>
                    เพิ่มหน้าใหม่
                  </>
                )}
              </h2>
              {editId && (
                <button
                  onClick={resetForm}
                  className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300"
                >
                  ยกเลิกแก้ไข
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-600 mb-2 dark:text-zinc-400">
                    ลิงก์ (Slug)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-zinc-400 font-mono dark:text-zinc-500">
                      /
                    </span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="about"
                      className="w-full border border-zinc-200 p-3 pl-6 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-600 mb-2 dark:text-zinc-400">
                    หัวข้อหน้า (Title)
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น เกี่ยวกับเรา"
                    className="w-full border border-zinc-200 p-3 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    required
                  />
                </div>
              </div>

              {/* --- ส่วน Editor --- */}
              <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2 dark:text-zinc-400">
                  เนื้อหา (Content)
                </label>
                <div
                  className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{ minHeight: "400px" }}
                >
                  {SunEditorComponent ? (
                    <div className="sun-editor-dark-mode-override">
                      <SunEditorComponent
                        setContents={content}
                        onChange={setContent}
                        height="400px"
                        setOptions={{
                          buttonList: [
                            ["undo", "redo"],
                            ["font", "fontSize", "formatBlock"],
                            ["bold", "underline", "italic", "strike"],
                            ["fontColor", "hiliteColor"],
                            ["table", "link", "image", "video"],
                            ["fullScreen", "codeView"],
                          ],
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[400px] items-center justify-center bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                      กำลังโหลด Editor...
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 ${editId
                    ? "bg-yellow-500 hover:bg-yellow-400 text-white shadow-yellow-200 dark:shadow-none dark:bg-yellow-600 dark:hover:bg-yellow-500"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200 dark:shadow-none dark:bg-blue-600 dark:hover:bg-blue-500"
                  }`}
              >
                {isLoading
                  ? "กำลังบันทึก..."
                  : editId
                    ? "บันทึกการแก้ไข"
                    : "บันทึกข้อมูล"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2 dark:text-white">
              <span className="text-2xl">📑</span> รายชื่อหน้าทั้งหมด
            </h2>

            {pages.length > 0 ? (
              <div className="grid gap-4">
                {pages.map((p) => (
                  <div
                    key={p._id}
                    className={`p-5 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${editId === p._id
                        ? "bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200 shadow-md dark:bg-yellow-900/20 dark:border-yellow-700 dark:ring-yellow-900"
                        : "border-zinc-200 hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                      }`}
                  >
                    <div>
                      <div className="font-bold text-blue-600 text-lg flex items-center gap-1 dark:text-blue-400">
                        <span className="text-zinc-400 font-normal text-sm dark:text-zinc-500">
                          /
                        </span>
                        {p.slug}
                      </div>
                      <div className="text-zinc-500 font-medium mt-1 dark:text-zinc-400">
                        {p.title}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {/* ปุ่มแก้ไข */}
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 hover:border-blue-200 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-400"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        แก้ไข
                      </button>

                      {/* ✅ ปุ่มลบ */}
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-800"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        ลบ
                      </button>

                      {/* ปุ่มดูหน้าเว็บ */}
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        ดู
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-4xl mb-4 opacity-50">📄</div>
                <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
                  ยังไม่มีข้อมูลหน้าเว็บ
                </h3>
                <p className="text-zinc-400 text-sm dark:text-zinc-500">
                  เริ่มสร้างหน้าแรกของคุณได้เลย
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
