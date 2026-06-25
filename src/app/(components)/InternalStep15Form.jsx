"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const InternalStep15Form = ({ projectId, initialData = {}, projectData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    content: initialData.content || "",
  });

  const [fileUrls, setFileUrls] = useState(initialData.fileUrl || []);
  const [originalFileNames, setOriginalFileNames] = useState(initialData.originalFileName || []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setLoading(true);
    setMessage({ type: "success", text: "กำลังอัปโหลดรูปภาพ..." });

    try {
      const newUrls = [...fileUrls];
      const newNames = [...originalFileNames];

      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
          newNames.push(file.name);
        } else {
          console.error("Failed to upload file");
        }
      }

      setFileUrls(newUrls);
      setOriginalFileNames(newNames);
      setMessage({ type: "success", text: "อัปโหลดรูปภาพสำเร็จ!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
    } finally {
      setLoading(false);
      e.target.value = null; // Clear input
    }
  };

  const removeImage = (indexToRemove) => {
    if (!confirm("คุณต้องการลบรูปภาพนี้ใช่หรือไม่?")) return;
    setFileUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
    setOriginalFileNames((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/InternalPdcas/" + projectId + "/step15", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileUrl: fileUrls,
          originalFileName: originalFileNames
        }),
      });
      if (!res.ok) {
         const errData = await res.json();
         throw new Error(errData.message || "Failed to save");
      }
      setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึก: " + error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    const imagesHtml = fileUrls.map(url => `
      <div class="image-container">
        <img src="${url}" alt="Project Image" />
      </div>
    `).join("");

    const projectName = projectData?.nameproject ? `โครงการ ${projectData.nameproject}` : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>รูปภาพการดำเนินงานโครงการ</title>
          <style>
            :root { color-scheme: light !important; }
            @font-face {
              font-family: 'TH SarabunIT๙';
              src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew.ttf') format('truetype');
              font-weight: normal; font-style: normal;
            }
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: 'TH SarabunIT๙', sans-serif;
              font-size: 16px;
              margin: 0;
              padding: 0;
              color: black !important;
              background: white !important;
            }
            .text-center { text-align: center; }
            h1, h2 { color: black !important; }
            h1 { font-size: 20px; margin: 0 0 5px 0; font-weight: normal; }
            h2 { font-size: 20px; margin: 0 0 15px 0; font-weight: normal; }
            
            .image-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              justify-content: center;
              margin-bottom: 20px;
            }
            .image-container {
              width: 45%;
              display: flex;
              justify-content: center;
              margin-bottom: 10px;
            }
            .image-container img {
              max-width: 100%;
              max-height: 350px;
              object-fit: contain;
              border: 1px solid #ccc;
            }
            .content-box {
              margin-top: 20px;
              font-size: 16px;
              white-space: pre-wrap;
              text-align: left;
              color: black !important;
            }
          </style>
        </head>
        <body style="background: white; color: black;">
          <div class="text-center">
            <h1><b>รูปภาพการดำเนินงานโครงการ</b></h1>
            ${projectName ? `<h2><b>${projectName}</b></h2>` : ""}
          </div>
          
          <div class="image-grid">
            ${imagesHtml}
          </div>
          
          ${formData.content ? `
          <div class="content-box">
            <b>ข้อมูลเพิ่มเติม / แนบลิงก์:</b><br/>
            ${formData.content}
          </div>
          ` : ""}
          
          <script>
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-black dark:text-white">
          14. รูปภาพการดำเนินงานโครงการ
        </h1>
      </div>

      <div className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:bg-boxdark mb-10">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between border-b pb-6 gap-4">
          <h2 className="text-2xl font-black text-primary">รูปภาพการดำเนินงานโครงการ</h2>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="rounded-xl bg-[#ff9800] px-8 py-2 font-bold text-white hover:bg-opacity-90 shadow-md transition-all active:scale-95"
            >
              🖨️ Export PDF
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-primary px-8 py-2 font-bold text-white hover:bg-opacity-90 shadow-md transition-all active:scale-95"
            >
              {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* อัปโหลดรูปภาพ */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 py-3 px-4 border border-gray-100 dark:bg-meta-4 dark:border-strokedark">
              <div className="w-1.5 h-6 rounded-full bg-primary"></div>
              <h3 className="text-lg font-black text-black dark:text-white">แนบรูปภาพกิจกรรม</h3>
            </div>
            
            <div className="mt-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 py-10 transition hover:bg-primary/10">
                <span className="mb-2 text-primary">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16V8M12 8L9 11M12 8L15 11M3 16V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="font-bold text-primary">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span className="text-sm text-gray-500 mt-1">รองรับหลายไฟล์ (JPG, PNG)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* แสดงรูปภาพที่อัปโหลดแล้ว */}
            {fileUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {fileUrls.map((url, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                    <img src={url} alt={originalFileNames[index] || "Uploaded image"} className="object-cover w-full h-full" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                      title="ลบรูปภาพ"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs truncate px-2 py-1">
                      {originalFileNames[index]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ข้อมูลเพิ่มเติม / แนบลิงก์ */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 py-3 px-4 border border-gray-100 dark:bg-meta-4 dark:border-strokedark">
              <div className="w-1.5 h-6 rounded-full bg-primary"></div>
              <h3 className="text-lg font-black text-black dark:text-white">ข้อมูลเพิ่มเติม / แนบลิงก์</h3>
            </div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-stroke bg-white p-4 text-gray-700 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-strokedark dark:bg-boxdark dark:text-white"
              placeholder="กรอกรายละเอียด เพิ่มเติม หรือวางลิงก์ Google Drive ของไฟล์งาน..."
            />
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-2xl bg-primary px-20 py-4 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-opacity-90 active:scale-95 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>

        {message && (
          <div
            className={
              "fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl " +
              (message.type === "success" ? "bg-success text-white" : "bg-danger text-white")
            }
          >
            {message.text}
          </div>
        )}
      </div>
    </>
  );
};

export default InternalStep15Form;
