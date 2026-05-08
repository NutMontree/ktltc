"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { AppSearch } from "./conson/AppSearch";
import { ImgItem } from "./conson/ImgItem";
import { ImgPost } from "./conson/ImgPost";

// --- Types ---
interface ImgData {
  title: string;
  [key: string]: any;
}

export const Personnel1 = () => {
  const [dbUsers, setDbUsers] = useState<ImgData[]>([]);
  const [selectedImg, setSelectedImg] = useState<ImgData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const mappedUsers = (data.users || []).map((u: any) => ({
            title: u.name,
            secondary: u.role === "director" || String(u.role).startsWith("deputy") ? "ผู้บริหาร" : "",
            position: u.position || "",
            department: u.department || "",
            faction: u.faction || "",
            description: u.description || "",
            img: u.image || "",
            fullUrl: u.coverImage || u.image || "" 
          }));
          setDbUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch all users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const onImgOpenClick = (img: any) => setSelectedImg(img);
  const onImgCloseClick = () => setSelectedImg(null);

  const filteredImgs = dbUsers.filter((img) =>
    img.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลบุคลากรทั้งหมด...</p>
      </div>
    );
  }

  return (
    <section className="max:w-7xl mx-auto ">
      <div className="">
        {/* --- 1. Search Section --- */}
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ค้นหารายชื่อ<span className="text-[#DAA520]">บุคลากร</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Personnel Information Directory
          </p>

          <div className="max-w relative w-full">
            <div className="">
              {/* ส่ง props ให้ AppSearch ตามเดิม แต่จัด CSS wrapper */}
              <div className="pl-10">
                <AppSearch value={searchText} onValueChange={setSearchText} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            พบข้อมูลทั้งหมด {filteredImgs.length} รายการ
          </p>
        </div>

        {/* --- 2. Gallery Grid with Animation --- */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredImgs.length > 0 ? (
              filteredImgs.map((img, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  key={index} // ถ้ามี unique id ใช้ id จะดีกว่า index
                  className="group"
                >
                  <div className="h-full transform transition-all duration-300 hover:-translate-y-1">
                    <ImgItem img={img} onImgClick={onImgOpenClick} />
                  </div>
                </motion.div>
              ))
            ) : (
              /* --- 3. Empty State (ไม่พบข้อมูล) --- */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-20 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800">
                  <UserOutlined style={{ fontSize: "32px" }} />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                  ไม่พบรายชื่อที่ค้นหา
                </h3>
                <p className="text-slate-400">
                  ลองตรวจสอบคำสะกด หรือค้นหาด้วยคีย์เวิร์ดอื่น
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* --- 4. Modal (Popup) --- */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onImgCloseClick} // คลิกพื้นหลังเพื่อปิด
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // คลิกเนื้อหาไม่ปิด
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
            >
              <ImgPost img={selectedImg} onBgClick={onImgCloseClick} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default function PersonnelInformation() {
  return (
    <>
      <div className="w-full">
        <Personnel1 />
      </div>
    </>
  );
}
