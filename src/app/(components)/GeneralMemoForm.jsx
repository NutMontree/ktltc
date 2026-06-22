"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GeneralMemoForm = ({ memoId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const EDITMODE = memoId !== "new";

  const [formData, setFormData] = useState({
    docNumber: initialData.docNumber || "",
    date: initialData.date || "",
    department: initialData.department || "วิทยาลัยเทคนิคกันทรลักษ์",
    subject: initialData.subject || "",
    salutation: initialData.salutation || "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์",
    paragraphs:
      initialData.paragraphs && initialData.paragraphs.length > 0 
        ? initialData.paragraphs 
        : [
            "ด้วยแผนกวิชา... มีความประสงค์ที่จะ... เพื่อใช้ใน...",
            "ในการนี้ แผนกวิชา...",
            "จึงเรียนมาเพื่อโปรดพิจารณา...",
          ],
    signerName: initialData.signerName || "",
    signerPosition: initialData.signerPosition || "หัวหน้างาน/หัวหน้าแผนก",
    deputyName: initialData.deputyName || "นายสมศักดิ์ จันทนิตย์",
    deputyPosition: initialData.deputyPosition || "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน",
    directorName: initialData.directorName || "นางสาวทักษิณา ชมจันทร์",
    footerText: initialData.footerText || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParagraphChange = (index, value) => {
    const newParagraphs = [...formData.paragraphs];
    newParagraphs[index] = value;
    setFormData((prev) => ({ ...prev, paragraphs: newParagraphs }));
  };

  const addParagraph = () => {
    setFormData((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ""] }));
  };

  const removeParagraph = (index) => {
    if (formData.paragraphs.length > 3) {
      const newParagraphs = formData.paragraphs.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, paragraphs: newParagraphs }));
    } else {
      handleParagraphChange(index, "");
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const method = EDITMODE ? "PUT" : "POST";
      const endpoint = EDITMODE ? `/api/GeneralMemos/${memoId}` : `/api/GeneralMemos`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "บันทึกไม่สำเร็จ");
      }

      setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
      setTimeout(() => {
        setMessage(null);
        if (!EDITMODE) {
          router.push("/GeneralMemoPage");
          router.refresh();
        }
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาดในการบันทึก" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    const validParagraphs = formData.paragraphs.filter((p) => p.trim() !== "");

    // Helper function to convert numbers to Thai digits
    const toThaiDigits = (str) => {
      if (!str) return "";
      return str.toString().replace(/[0-9]/g, (digit) => "๐๑๒๓๔๕๖๗๘๙"[digit]);
    };

    const paragraphsHtml = validParagraphs
      .map((p) => `<div class="para">${toThaiDigits(p.trim())}</div>`)
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>บันทึกข้อความ - ${formData.subject}</title>
          <style>
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew.ttf') format('truetype');
              font-weight: normal; font-style: normal;
            }
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew-Bold.ttf') format('truetype');
              font-weight: bold; font-style: normal;
            }
            @page { size: A4; margin: 0; }
            body { 
              font-family: 'TH Sarabun New', sans-serif; 
              font-size: 16pt; 
              line-height: 1.1; 
              margin: 0;
              padding-top: 2.5cm; padding-bottom: 2.5cm;
              padding-left: 3cm; padding-right: 2cm;
              color: black;
              position: relative;
              box-sizing: border-box;
            }
            .garuda { width: 1.5cm; height: auto; position: absolute; left: 3cm; top: 1.5cm; }
            .header-title { font-size: 29pt; font-weight: bold; text-align: center; margin-bottom: 10px; }
            
            .flex-row { display: flex; align-items: baseline; margin-bottom: 5px; }
            .label { font-weight: bold; font-size: 16pt; white-space: nowrap; }
            
            .value, .comment-dots {
              position: relative;
              white-space: nowrap;
            }
            .comment-dots { flex: 1; color: transparent; }
            
            .value::after, .comment-dots::after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              bottom: 6px;
              border-bottom: 1.5px dotted #000;
            }
            
            .para { text-indent: 2.5cm; margin-top: 8px; text-align: justify; }
            
            .signature-block { width: 50%; margin-left: 50%; margin-top: 15px; text-align: center; }
            .sig-line { text-align: left; padding-left: 20px; margin-bottom: 5px; }
            
            .comment-section { margin-top: 20px; }
            .comment-line { display: flex; align-items: baseline; margin-bottom: 5px; min-height: 25px; }
            .comment-dots { flex: 1; color: transparent; }
            .comment-label { white-space: nowrap; margin-right: 2px; }
            
            .footer {
              position: fixed;
              bottom: 1.5cm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 18pt;
              font-weight: bold;
              color: #000;
            }
            .approval-flow { width: 50%; margin-left: 50%; margin-top: 15px; }
          </style>
        </head>
        <body>
          <img src="/pdf/pdca/ตราครุฑ.webp" class="garuda" onerror="this.style.display='none'">
          <div class="header-title">บันทึกข้อความ</div>
          
          <div class="flex-row">
            <span class="label">ส่วนราชการ</span>
            <span class="value" style="flex: 1; padding-left: 10px;">${toThaiDigits(formData.department) || "&nbsp;"}</span>
          </div>

          <div class="flex-row" style="display: flex;">
            <div style="width: 50%; display: flex; align-items: baseline;">
              <span class="label">ที่</span>
              <span class="value" style="flex: 1; padding-left: 10px;">${toThaiDigits(formData.docNumber) || "&nbsp;"}</span>
            </div>
            <div style="width: 50%; display: flex; align-items: baseline;">
              <span class="label">วันที่</span>
              <span class="value" style="flex: 1; padding-left: 55px;">${toThaiDigits(formData.date) || "&nbsp;"}</span>
            </div>
          </div>

          <div class="flex-row">
            <span class="label">เรื่อง</span>
            <span class="value" style="flex: 1; padding-left: 10px;">${toThaiDigits(formData.subject) || "&nbsp;"}</span>
          </div>

          <div style="margin-top: 5px; font-size: 16pt;"><span style="font-weight: bold;">เรียน</span> <span style="margin-left: 10px;">${toThaiDigits(formData.salutation)}</span></div>

          ${paragraphsHtml}

          <!-- ส่วนลงนาม (ผู้เสนอ) -->
          <div class="approval-flow">
            <div style="text-align: center;">
              <div style="text-align: left;">ลงชื่อ</div>
              <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.signerName || "").trim().replace(/\\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
              <div>${toThaiDigits(formData.signerPosition)}</div>
            </div>

            <!-- ผู้อนุมัติ (รองผู้อำนวยการ) -->
            ${
              formData.deputyName
                ? `
            <div style="margin-top: 20px;">
              <div class="comment-line">
                <span class="comment-label">ความคิดเห็นของรองผู้อำนวยการ</span>
                <span class="comment-dots">&nbsp;</span>
              </div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              
              <div style="text-align: center; margin-top: 35px;">
                <div style="text-align: left;">ลงชื่อ</div>
                <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.deputyName || "").trim().replace(/\\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
                <div>${toThaiDigits(formData.deputyPosition)}</div>
              </div>
            </div>
            `
                : ""
            }

            <!-- ผู้อนุมัติ (ผู้อำนวยการ) -->
            ${
              formData.directorName
                ? `
            <div style="margin-top: 20px;">
              <div class="comment-line">
                <span class="comment-label">ความคิดเห็นของผู้อำนวยการ</span>
                <span class="comment-dots">&nbsp;</span>
              </div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              
              <div style="text-align: center; margin-top: 35px;">
                <div style="text-align: left;">ลงชื่อ</div>
                <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.directorName || "").trim().replace(/\\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
                <div>ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์</div>
                <div style="margin-top: 10px;">............ / ............ / ............</div>
              </div>
            </div>
            `
                : ""
            }
          </div>

          <div class="footer">${toThaiDigits(formData.footerText)}</div>

          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:border-strokedark dark:bg-boxdark"
    >
      <div className="mb-8 flex items-center justify-between border-b border-stroke pb-6 dark:border-strokedark">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white">
            สร้างบันทึกข้อความแบบอิสระ
          </h2>
          <p className="text-sm text-gray-500">พิมพ์เรื่องและเนื้อหาได้ตามต้องการ</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/GeneralMemoPage"
            className="rounded-xl bg-gray-100 px-6 py-2 font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-meta-4 dark:text-white dark:hover:bg-meta-4/80"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-8 py-2 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="rounded-xl bg-success px-8 py-2 font-bold text-white shadow-lg shadow-success/30 transition hover:bg-opacity-90"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* 1. ส่วนหัวบันทึก */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-primary/10 p-3 text-lg font-black text-primary">
            1. ส่วนหัวบันทึก (ส่วนราชการ, ที่, วันที่, เรื่อง, เรียน)
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300">
                ส่วนราชการ
              </label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                placeholder="เช่น วิทยาลัยเทคนิคกันทรลักษ์"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-400 dark:text-gray-500">
                เลขที่หนังสือ (ที่) - [ล็อค]
              </label>
              <input
                name="docNumber"
                value={formData.docNumber}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-2xl border-2 border-stroke bg-gray-200 p-4 text-gray-500 outline-none dark:border-form-strokedark dark:bg-meta-4"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300">
                วันที่
              </label>
              <input
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                placeholder="เช่น ๑๕ มกราคม ๒๕๖๗"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300">
                เรื่อง
              </label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-primary bg-primary/5 p-4 outline-none transition focus:border-primary dark:text-white"
                placeholder="ระบุเรื่องของบันทึกข้อความ"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300">
                เรียน
              </label>
              <input
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                placeholder="เช่น ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์"
              />
            </div>
          </div>
        </section>

        {/* 2. เนื้อหา */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex-1 rounded-xl border-l-8 border-primary bg-primary/10 p-3 text-lg font-black text-primary">
              2. เนื้อหา (ย่อหน้า)
            </h3>
            <button
              type="button"
              onClick={addParagraph}
              className="ml-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-opacity-90"
            >
              + เพิ่มย่อหน้า
            </button>
          </div>

          <div className="space-y-6 rounded-2xl border-2 border-stroke bg-gray-50/50 p-6 dark:border-strokedark dark:bg-meta-4/20">
            {formData.paragraphs.map((p, index) => (
              <div key={index} className="group relative">
                <div className="absolute -left-3 bottom-0 top-0 w-1 bg-gray-200 transition-colors group-hover:bg-primary dark:bg-strokedark"></div>
                <label className="mb-2 block text-sm font-bold text-gray-500 dark:text-gray-400">
                  ย่อหน้าที่ {index + 1}
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-stroke bg-white p-4 outline-none transition-all focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="พิมพ์เนื้อหาที่ต้องการ (จะมีการย่อหน้าอัตโนมัติในหน้า PDF)"
                  />
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    className="self-start rounded-lg bg-white p-3 text-danger shadow-sm transition hover:bg-danger hover:text-white dark:bg-meta-4"
                    title="ลบย่อหน้านี้"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ส่วน Preview */}
          <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 shadow-inner">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z"></path>
              </svg>
              ตัวอย่างข้อความย่อหน้าที่จะแสดงใน PDF:
            </h4>
            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              {formData.paragraphs.map((p, index) => {
                if (!p.trim()) return null;
                return (
                  <div key={index}>
                    <span className="text-gray-400">ย่อหน้าที่ {index + 1}: </span>
                    {p.trim()}
                  </div>
                );
              })}
              {formData.paragraphs.every((p) => !p.trim()) && (
                <div className="text-gray-400 italic">ยังไม่ได้ระบุข้อความ</div>
              )}
            </div>
          </div>
        </section>

        {/* 3. ส่วนลงนาม */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-primary/10 p-3 text-lg font-black text-primary">
            3. ส่วนลงนาม
          </h3>
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4 rounded-3xl border-2 border-stroke p-6 dark:border-strokedark">
              <h4 className="font-black text-gray-500 dark:text-gray-400">ผู้เสนอ</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="signerName"
                  value={formData.signerName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                  placeholder="ชื่อผู้เสนอ"
                />
                <input
                  name="signerPosition"
                  value={formData.signerPosition}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                  placeholder="ตำแหน่ง"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border-2 border-stroke p-6 dark:border-strokedark">
              <h4 className="font-black text-gray-500 dark:text-gray-400">
                ผู้อนุมัติ (ระดับรองผู้อำนวยการ) - เว้นว่างได้
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="deputyName"
                  value={formData.deputyName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                  placeholder="ชื่อรองผู้อำนวยการ"
                />
                <input
                  name="deputyPosition"
                  value={formData.deputyPosition}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                  placeholder="ตำแหน่ง"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border-2 border-stroke p-6 dark:border-strokedark">
              <h4 className="font-black text-gray-500 dark:text-gray-400">
                ผู้อนุมัติสูงสุด (ผู้อำนวยการ) - เว้นว่างได้
              </h4>
              <input
                name="directorName"
                value={formData.directorName}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
                placeholder="ชื่อผู้อำนวยการ"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-primary/10 p-3 text-lg font-black text-primary">
            4. ข้อความท้ายกระดาษ (Footer)
          </h3>
          <input
            name="footerText"
            value={formData.footerText}
            onChange={handleChange}
            className="w-full rounded-2xl border-2 border-stroke bg-transparent p-4 text-center font-bold text-gray-500 outline-none transition focus:border-primary dark:border-form-strokedark dark:text-white"
            placeholder="พิมพ์ข้อความท้ายกระดาษ..."
          />
        </section>
      </div>

      {message && (
        <div
          className={`fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl ${message.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
};

export default GeneralMemoForm;
