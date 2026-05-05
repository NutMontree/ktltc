"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiYoutube,
  FiFacebook,
  FiLink,
  FiLoader,
  FiExternalLink,
  FiVideo,
} from "react-icons/fi";

// ✅ 1. กำหนด Interface เพื่อแก้ปัญหา TypeScript (any/never)
interface SocialFeed {
  _id: string;
  platform: "facebook" | "youtube";
  title: string;
  url: string;
  embedId?: string;
  isActive: boolean;
  order: number;
}

export default function FeedManagementPage() {
  // ✅ 2. State Management
  const [feeds, setFeeds] = useState<SocialFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [platform, setPlatform] = useState<"facebook" | "youtube">("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  // ✅ 3. Fetch Data จาก API
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/feeds");
      const data = await res.json();
      if (res.ok) {
        setFeeds(Array.isArray(data) ? data : []);
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  // ✅ 4. ฟังก์ชันแกะ YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // ✅ 5. เพิ่ม Feed ใหม่
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let embedId = "";
    if (platform === "youtube") {
      const id = getYoutubeId(url);
      if (!id) {
        toast.error("รูปแบบ URL YouTube ไม่ถูกต้อง");
        setIsSubmitting(false);
        return;
      }
      embedId = id;
    }

    try {
      const res = await fetch("/api/admin/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          title,
          url,
          embedId,
          order: 0,
          label: platform === "youtube" ? "YouTube Video" : "Facebook Post",
        }),
      });

      if (res.ok) {
        toast.success(`เพิ่ม ${platform} สำเร็จและบันทึก Log แล้ว`);
        setUrl("");
        setTitle("");
        fetchFeeds();
      } else {
        toast.error("บันทึกข้อมูลล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดทางเทคนิค");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 6. ลบ Feed
  const handleDelete = async (id: string, feedTitle: string) => {
    if (
      !confirm(
        `คุณต้องการลบ "${feedTitle}" ใช่หรือไม่?\nการกระทำนี้จะถูกบันทึกใน Audit Log`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/feeds/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        setFeeds(feeds.filter((f) => f._id !== id));
      } else {
        toast.error("ไม่สามารถลบได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (loading)
    return (
      <div className="max-w-[1600px] mx-auto flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-slate-50 max-w-[1600px] mx-auto">
      {/* <Toaster position="bottom-right" /> */}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <FiVideo className="text-blue-600 not-italic" />
              Social <span className="text-blue-600">Feeds</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              จัดการวิดีโอและโพสต์ที่จะแสดงในหน้าแรกของเว็บไซต์
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* --- Form Section --- */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-4xl shadow-xl border border-slate-100 sticky top-10"
            >
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <FiPlus className="text-blue-600" strokeWidth={3} /> Add Content
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
                    Select Platform
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlatform("youtube")}
                      className={`py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${
                        platform === "youtube"
                          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <FiYoutube size={16} /> YOUTUBE
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("facebook")}
                      className={`py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${
                        platform === "facebook"
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <FiFacebook size={16} /> FACEBOOK
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
                    Title / Caption
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ระบุหัวข้อวิดีโอหรือโพสต์..."
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
                    Source URL
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="วางลิงก์จากหน้าเว็บ..."
                      className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin mx-auto" />
                  ) : (
                    "Publish to Web"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* --- List Section --- */}
          <div className="lg:col-span-2 space-y-4">
            {feeds.length === 0 ? (
              <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] py-32 text-center">
                <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">
                  Empty Feed Gallery
                </p>
              </div>
            ) : (
              feeds.map((feed) => (
                <div
                  key={feed._id}
                  className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-xl hover:border-blue-100 transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-5 w-full">
                    <div
                      className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                        feed.platform === "youtube"
                          ? "bg-red-50 text-red-500"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {feed.platform === "youtube" ? (
                        <FiYoutube />
                      ) : (
                        <FiFacebook />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors">
                        {feed.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={feed.url}
                          target="_blank"
                          className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1 font-bold underline underline-offset-4"
                        >
                          View Original <FiExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                    <button
                      onClick={() => handleDelete(feed._id, feed.title)}
                      className="w-full md:w-auto px-6 py-3 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
