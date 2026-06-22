"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const InternalStep9Form = ({ projectId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    docNumber: initialData.docNumber || "",
    date: initialData.date || "",
    subject: initialData.subject || "ขอรายงานการประชุม",
    salutation: initialData.salutation || "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์",
    paragraphs:
      initialData.paragraphs && initialData.paragraphs.length > 0 ? initialData.paragraphs : [""],
    introPrefix: initialData.introPrefix || "ในการนี้",
    departmentName: initialData.departmentName || "",
    additionalIntroText: initialData.additionalIntroText || "",
    projectName: initialData.projectName || "",
    signerName: initialData.signerName || "",
    signerPosition: initialData.signerPosition || "หัวหน้างาน/หัวหน้าแผนก",
    deputy2Name: initialData.deputy2Name || "นายสมศักดิ์ จันทนิตย์",
    deputy2Position: initialData.deputy2Position || "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน",
    deputy2Comment: initialData.deputy2Comment || "",
    directorName: initialData.directorName || "นางสาวทักษิณา ชมจันทร์",
    directorComment: initialData.directorComment || "",
    footerText: initialData.footerText || "“เรียนดี มีคุณธรรม”",
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
    if (formData.paragraphs.length > 1) {
      const newParagraphs = formData.paragraphs.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, paragraphs: newParagraphs }));
    } else {
      handleParagraphChange(0, "");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/InternalPdcas/${projectId}/step9`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึก" });
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

    const clean = (text) => {
      if (!text) return "";
      return toThaiDigits(text.trim().replace(/^[ \u0e48-\u0e4b|'‘’"“”]+/g, ""));
    };

    const paragraphsHtml = validParagraphs
      .map((p, index) => {
        let text = p.trim();
        if (index === 0 && !text.endsWith("นั้น")) {
          text += " นั้น";
        }
        return `<div class="para">${toThaiDigits(text)}</div>`;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>บันทึกข้อความ - ${formData.projectName}</title>
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
            <span class="value" style="flex: 1; padding-left: 10px;">${toThaiDigits("วิทยาลัยเทคนิคกันทรลักษ์")}</span>
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

          <div class="para">
            ${clean(formData.introPrefix)} ${clean(formData.departmentName)} 
            ${toThaiDigits((formData.additionalIntroText || "").trim())}
            จึงขอรายงานการประชุม ${clean(formData.projectName)}
            ดังเอกสารที่แนบมาพร้อมนี้
          </div>
          
          <div style="margin-top: 15px; text-indent: 2.5cm;">จึงเรียนมาเพื่อโปรดพิจารณา</div>

          <!-- 3. ส่วนลงนาม (ผู้เสนอ) -->
          <div class="approval-flow">
            
            <div style="text-align: center;">
              <div style="text-align: left;">ลงชื่อ</div>
              <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.signerName || "").trim().replace(/\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
              <div>${toThaiDigits(formData.signerPosition)}</div>
            </div>

            <!-- 4. ผู้อนุมัติ (รองผู้อำนวยการ) -->
            <div style="margin-top: 20px;">
              <div class="comment-line">
                <span class="comment-label">ความคิดเห็นรองฝ่าย</span>
                <span class="comment-dots">&nbsp;</span>
              </div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              
              <div style="text-align: center; margin-top: 35px;">
                <div style="text-align: left;">ลงชื่อ</div>
                <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.deputy2Name || "").trim().replace(/\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
                <div>${toThaiDigits(formData.deputy2Position)}</div>
              </div>
            </div>

            <!-- 5. ผู้อนุมัติ (ผู้อำนวยการ) -->
            <div style="margin-top: 20px;">
              <div class="comment-line">
                <span class="comment-label">ความคิดเห็นของผู้อำนวยการ</span>
                <span class="comment-dots">&nbsp;</span>
              </div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              <div class="comment-line"><span class="comment-dots">&nbsp;</span></div>
              
              <div style="text-align: center; margin-top: 35px;">
                <div style="text-align: left;">ลงชื่อ</div>
                <div style="margin-bottom: 5px;">( ${toThaiDigits((formData.directorName || "").trim().replace(/\s+/g, "&nbsp;&nbsp;")) || "................................................"} )</div>
                <div>ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์</div>
                <div style="margin-top: 10px;">............ / ............ / ............</div>
              </div>
            </div>

          </div>

          <div class="footer">${toThaiDigits(formData.footerText)}</div>

          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:bg-boxdark">
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <h2 className="text-2xl font-black text-primary">บันทึกข้อความ ขอรายงานการประชุม</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-primary px-8 py-2 font-bold text-white"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-xl bg-success px-8 py-2 font-bold text-white"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* 1. ส่วนหัวบันทึก */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            1. ส่วนหัวบันทึก
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-400">
                เลขที่หนังสือ (ที่) - [ล็อค]
              </label>
              <input
                name="docNumber"
                value={formData.docNumber}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-2xl border bg-gray-200 p-4 text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">วันที่</label>
              <input
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-600">เรื่อง</label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-400">เรียน - [ล็อค]</label>
              <input
                name="salutation"
                value={formData.salutation}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-2xl border bg-gray-200 p-4 text-gray-500"
              />
            </div>
          </div>
        </section>

        {/* 2. เนื้อหา */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex-1 rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
              2. เนื้อหา (ย่อหน้า)
            </h3>
            <button
              onClick={addParagraph}
              className="ml-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              + เพิ่มย่อหน้า
            </button>
          </div>

          <div className="space-y-6">
            {formData.paragraphs.map((p, index) => (
              <div key={index} className="group relative">
                <div className="absolute -left-3 bottom-0 top-0 w-1 bg-gray-200 transition-colors group-hover:bg-primary"></div>
                <label className="mb-1 block text-xs font-bold text-gray-400">
                  ย่อหน้าที่ {index + 1}
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border bg-gray-50 p-4 transition-all focus:bg-white"
                  />
                  <button
                    onClick={() => removeParagraph(index)}
                    className="self-start rounded-lg p-2 text-danger hover:bg-danger/10"
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

            <div className="space-y-4 rounded-2xl bg-blue-50 p-6 shadow-inner">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-blue-600">คำนำหน้า</label>
                  <input
                    name="introPrefix"
                    value={formData.introPrefix}
                    onChange={handleChange}
                    className="w-full rounded-xl border bg-white p-3"
                    placeholder="เช่น ในการนี้"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-blue-600">ชื่อแผนก/งาน</label>
                  <input
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="w-full rounded-xl border bg-white p-3"
                    placeholder="ระบุแผนก"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-blue-600">ชื่อโครงการ</label>
                  <input
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full rounded-xl border bg-white p-3"
                    placeholder="ระบุชื่อโครงการ"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-blue-100 pt-4">
                <label className="block text-sm font-black text-blue-800">
                  เขียนข้อความเพิ่มเติมต่อท้ายชื่อฝ่าย (ถ้ามี)
                </label>
                <textarea
                  name="additionalIntroText"
                  value={formData.additionalIntroText || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border-2 border-white bg-white/50 p-4 transition-all focus:bg-white focus:ring-2 focus:ring-blue-400"
                  placeholder="เช่น ได้รับมอบหมายให้ดำเนินการจัดซื้อวัสดุ... (จะแสดงก่อนคำว่า 'จึงขอรายงานการประชุม')"
                />
              </div>
            </div>

            {/* ส่วน Preview ที่คุณต้องการ */}
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
                ตัวอย่างข้อความย่อหน้าสรุปที่จะแสดงใน PDF:
              </h4>
              <div className="space-y-4 text-lg leading-relaxed text-gray-700">
                {/* ย่อหน้าที่ 1 Preview */}
                {formData.paragraphs[0] && formData.paragraphs[0].trim() !== "" && (
                  <div>
                    <span className="text-gray-400">ย่อหน้าที่ 1: </span>
                    {formData.paragraphs[0].trim()}
                    {!formData.paragraphs[0].trim().endsWith("นั้น") && (
                      <span className="font-bold text-success"> นั้น</span>
                    )}
                  </div>
                )}

                {/* ย่อหน้าสรุป Preview */}
                <div>
                  <span className="text-gray-400">ย่อหน้าสรุป: </span>
                  {(formData.introPrefix || "ในการนี้")
                    .trim()
                    .replace(/^[ \u0e48-\u0e4b|'‘’"“”]+/g, "")}{" "}
                  {(formData.departmentName || "ระบุชื่อแผนก")
                    .trim()
                    .replace(/^[ \u0e48-\u0e4b|'‘’"“”]+/g, "")}{" "}
                  <span className="italic">{formData.additionalIntroText || ""}</span>{" "}
                  <span className="font-bold text-primary underline">จึงขอรายงานการประชุม</span>{" "}
                  <span className="font-bold">
                    {(formData.projectName || "ระบุชื่อโครงการ")
                      .trim()
                      .replace(/^[ \u0e48-\u0e4b|'‘’"“”]+/g, "")}
                  </span>{" "}
                  ดังเอกสารที่แนบมาพร้อมนี้
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ส่วนลงนาม (ผู้เสนอ) */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            3. ส่วนลงนาม (ผู้เสนอ)
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              name="signerName"
              value={formData.signerName}
              onChange={handleChange}
              className="w-full rounded-2xl border bg-gray-50 p-4"
              placeholder="ชื่อผู้เสนอ"
            />
            <input
              name="signerPosition"
              value={formData.signerPosition}
              onChange={handleChange}
              className="w-full rounded-2xl border bg-gray-50 p-4"
              placeholder="ตำแหน่ง"
            />
          </div>
        </section>

        {/* 4. ผู้อนุมัติ */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            4. ผู้อนุมัติ
          </h3>
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4 rounded-3xl border-2 border-dashed border-gray-200 p-6">
              <h4 className="font-black text-gray-500">ส่วนของ: รองผู้อำนวยการ</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="deputy2Name"
                  value={formData.deputy2Name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border bg-white p-4"
                />
                <input
                  name="deputy2Position"
                  value={formData.deputy2Position}
                  onChange={handleChange}
                  className="w-full rounded-2xl border bg-white p-4"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border-2 border-dashed border-gray-200 p-6">
              <h4 className="font-black text-gray-500">ส่วนของ: ผู้อำนวยการ</h4>
              <input
                name="directorName"
                value={formData.directorName}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-white p-4"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            5. ข้อความท้ายกระดาษ (Footer)
          </h3>
          <input
            name="footerText"
            value={formData.footerText}
            onChange={handleChange}
            className="w-full rounded-2xl border bg-gray-50 p-4 text-center font-bold text-gray-500 transition-all focus:bg-white"
            placeholder="พิมพ์ข้อความท้ายกระดาษ..."
          />
        </section>

        {/* Bottom Save Button */}
        <div className="mt-10 border-t pt-10 text-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full max-w-md rounded-2xl bg-primary py-4 text-xl font-bold text-white shadow-xl transition-all hover:bg-opacity-90 disabled:bg-gray-400"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl ${message.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default InternalStep9Form;
