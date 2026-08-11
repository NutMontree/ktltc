"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PremiumDatePicker from "./PremiumDatePicker";

const TeachingRecordForm = ({ recordId, initialData = {} }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [message, setMessage] = useState(null);
  const [aiOptions, setAiOptions] = useState({});
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [users, setUsers] = useState([]);
  const fileInputRef = React.useRef(null);

  const EDITMODE = recordId !== "new";
  const defaultTeacherName = searchParams.get("teacher") || "";

  const formatDateToThai = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];
      const thaiYear = parseInt(year) + (parseInt(year) < 2500 ? 543 : 0);
      return `${parseInt(day)} ${thaiMonths[parseInt(month) - 1]} ${thaiYear}`;
    }
    return dateString;
  };

  const [formData, setFormData] = useState({
    semester: initialData.semester || "1",
    academicYear: initialData.academicYear || "2569",
    courseCode: initialData.courseCode || "",
    courseName: initialData.courseName || "",
    teachingNo: initialData.teachingNo || "",
    date: initialData.date || "",
    weekNo: initialData.weekNo || "",
    unitNo: initialData.unitNo || "",
    unitName: initialData.unitName || "",
    topic: initialData.topic || "",
    activities: initialData.activities || "",
    isTheory: initialData.isTheory || false,
    isPractice: initialData.isPractice || true,
    results: initialData.results || "",
    problems: initialData.problems || "",
    activitiesImages: initialData.activitiesImages || [],
    resultsImages: initialData.resultsImages || [],
    problemsImages: initialData.problemsImages || [],
    signerName: initialData.signerName || defaultTeacherName,
    headName: initialData.headName || "นางกิ่งดาว บุญประสิทธิ์",
    teacherSignature: initialData.teacherSignature || "",
    headSignature: initialData.headSignature || "",
  });

  // ดึงข้อมูลลายเซ็นครูผู้สอนอัตโนมัติเมื่อเปลี่ยนชื่อ
  useEffect(() => {
    if (EDITMODE && formData.signerName === initialData?.signerName) return;
    if (!formData.signerName) return;
    
    const delayId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(formData.signerName)}&type=teacher`);
        if (res.ok) {
          const data = await res.json();
          if (data.signature) {
            setFormData(prev => ({ ...prev, teacherSignature: data.signature }));
          }
        }
      } catch (err) {
        console.error("Failed to auto-fetch teacher signature:", err);
      }
    }, 800);
    return () => clearTimeout(delayId);
  }, [formData.signerName, EDITMODE, initialData]);

  // ดึงข้อมูลลายเซ็นหัวหน้าแผนกอัตโนมัติเมื่อเปลี่ยนชื่อ
  useEffect(() => {
    if (EDITMODE && formData.headName === initialData?.headName) return;
    if (!formData.headName) return;
    
    const delayId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(formData.headName)}&type=head`);
        if (res.ok) {
          const data = await res.json();
          if (data.signature) {
            setFormData(prev => ({ ...prev, headSignature: data.signature }));
          }
        }
      } catch (err) {
        console.error("Failed to auto-fetch head signature:", err);
      }
    }, 800);
    return () => clearTimeout(delayId);
  }, [formData.headName, EDITMODE, initialData]);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/user/settings/apikey");
        if (res.ok) {
          const data = await res.json();
          setHasApiKey(data.hasKey);
        }
      } catch (error) {
        console.error("Failed to check api key status");
      }
    };
    checkApiKey();

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchAllUsers();

    const fetchSavedDocuments = async () => {
      try {
        const res = await fetch("/api/TeachingRecords/extracted-cache");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSavedDocuments(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch saved documents");
      }
    };
    fetchSavedDocuments();
  }, [isApiKeyModalOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleGenerateDetails = async () => {
    try {
      setGeneratingText(true);
      setMessage({ type: "info", text: "AI กำลังช่วยเขียนรายละเอียดการสอน..." });

      const res = await fetch("/api/TeachingRecords/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: formData.courseName,
          unitName: formData.unitName,
          topic: formData.topic,
          isTheory: formData.isTheory,
          isPractice: formData.isPractice,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate text");
      }

      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        activities: data.activities || prev.activities,
        results: data.results || prev.results,
        problems: data.problems || prev.problems,
      }));
      
      setMessage({ type: "success", text: "AI ช่วยเขียนรายละเอียดการสอนเสร็จเรียบร้อย!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเรียก AI กรุณาลองใหม่" });
    } finally {
      setGeneratingText(false);
      setCooldownTime(15);
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => setMessage(null), 3000);
    }
  };
  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const method = EDITMODE ? "PUT" : "POST";
      const endpoint = EDITMODE ? `/api/TeachingRecords/${recordId}` : `/api/TeachingRecords`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("บันทึกไม่สำเร็จ");
      }

      setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ!" });
      setTimeout(() => {
        setMessage(null);
        router.push("/TeachingRecordPage");
        router.refresh();
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาดในการบันทึก" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCachedDocument = (docId) => {
    setSelectedDocumentId(docId);
    if (!docId) {
      setAiOptions({});
      return;
    }

    const doc = savedDocuments.find(d => d._id === docId);
    if (doc && doc.data) {
      setMessage({ type: "info", text: `โหลดข้อมูลจากเอกสารเก่า: ${doc.documentName}` });
      const optionsMapping = {
        semester: doc.data.availableSemesters,
        academicYear: doc.data.availableAcademicYears,
        courseCode: doc.data.availableCourseCodes,
        courseName: doc.data.availableCourseNames,
        teachingNo: doc.data.availableTeachingNos,
        date: doc.data.availableDates,
        weekNo: doc.data.availableWeekNos,
        unitNo: doc.data.availableUnitNos,
        unitName: doc.data.availableUnitNames,
        topic: doc.data.availableTopics,
      };

      const cleanedOptions = {};
      Object.entries(optionsMapping).forEach(([key, val]) => {
        cleanedOptions[key] = Array.isArray(val)
          ? val.map((item) => String(item).trim()).filter((item) => item !== "" && item !== "undefined")
          : [];
      });

      setAiOptions(cleanedOptions);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteCachedDocument = async (docId) => {
    if (!confirm("ต้องการลบเอกสารนี้ออกจากระบบหรือไม่?")) return;
    try {
      const res = await fetch("/api/TeachingRecords/extracted-cache", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId })
      });
      if (res.ok) {
        setSavedDocuments(prev => prev.filter(d => d._id !== docId));
        if (selectedDocumentId === docId) {
          setSelectedDocumentId("");
          setAiOptions({});
        }
        setMessage({ type: "success", text: "ลบเอกสารสำเร็จ" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      setMessage({ type: "error", text: "ลบเอกสารไม่สำเร็จ" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAIUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setMessage({ type: "info", text: "กำลังให้ AI อ่านข้อมูลจากเอกสาร..." });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      if (formData.unitName) formDataUpload.append("unitName", formData.unitName);
      if (formData.topic) formDataUpload.append("topic", formData.topic);

      const res = await fetch("/api/TeachingRecords/extract", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");

      // Refetch saved documents to include the newly uploaded one
      try {
        const cacheRes = await fetch("/api/TeachingRecords/extracted-cache");
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          if (cacheData.success) {
            setSavedDocuments(cacheData.data);
            if (cacheData.data.length > 0) {
              setSelectedDocumentId(cacheData.data[0]._id);
            }
          }
        }
      } catch (e) { console.error(e); }

      // Extract options from AI response
      const optionsMapping = {
        semester: data.data.availableSemesters,
        academicYear: data.data.availableAcademicYears,
        courseCode: data.data.availableCourseCodes,
        courseName: data.data.availableCourseNames,
        teachingNo: data.data.availableTeachingNos,
        date: data.data.availableDates,
        weekNo: data.data.availableWeekNos,
        unitNo: data.data.availableUnitNos,
        unitName: data.data.availableUnitNames,
        topic: data.data.availableTopics,
      };

      const newAiOptions = {};
      for (const [key, val] of Object.entries(optionsMapping)) {
        if (Array.isArray(val) && val.length > 0) {
          newAiOptions[key] = val;
        }
      }
      setAiOptions(newAiOptions);

      // Auto-fill form fields with the first extracted value
      const autoFill = {};
      if (newAiOptions.semester?.length === 1) autoFill.semester = String(newAiOptions.semester[0]);
      if (newAiOptions.academicYear?.length === 1) autoFill.academicYear = String(newAiOptions.academicYear[0]);
      if (newAiOptions.courseCode?.length === 1) autoFill.courseCode = String(newAiOptions.courseCode[0]);
      if (newAiOptions.courseName?.length === 1) autoFill.courseName = String(newAiOptions.courseName[0]);
      if (newAiOptions.teachingNo?.length === 1) autoFill.teachingNo = String(newAiOptions.teachingNo[0]);
      if (newAiOptions.date?.length === 1) autoFill.date = String(newAiOptions.date[0]);
      if (newAiOptions.weekNo?.length === 1) autoFill.weekNo = String(newAiOptions.weekNo[0]);
      if (newAiOptions.unitNo?.length === 1) autoFill.unitNo = String(newAiOptions.unitNo[0]);
      if (newAiOptions.unitName?.length === 1) autoFill.unitName = String(newAiOptions.unitName[0]);
      if (newAiOptions.topic?.length === 1) autoFill.topic = String(newAiOptions.topic[0]);

      setFormData((prev) => ({
        ...prev,
        ...autoFill,
      }));

      setMessage({ type: "success", text: "ดึงข้อมูลสำเร็จ! กรุณาตรวจสอบความถูกต้อง" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      const isApiError = error.message.includes("ผู้ใช้งานเยอะ") || error.message.includes("API Key") || error.message.includes("AI ล้มเหลว");
      setTimeout(() => setMessage(null), isApiError ? 10000 : 3000);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignatureUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage({ type: "info", text: "กำลังอัปโหลดลายเซ็น..." });
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");
      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        [fieldName]: data.url,
      }));
      setMessage({ type: "success", text: "อัปโหลดลายเซ็นสำเร็จ" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMultipleImageUpload = async (e, fieldName) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setMessage({ type: "info", text: "กำลังอัปโหลดรูปภาพ..." });
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");
        const data = await res.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), ...urls],
      }));

      setMessage({ type: "success", text: "อัปโหลดรูปภาพสำเร็จ" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
    // clear input
    e.target.value = "";
  };

  const handleRemoveImage = (fieldName, index) => {
    setFormData((prev) => {
      const newArray = [...(prev[fieldName] || [])];
      newArray.splice(index, 1);
      return { ...prev, [fieldName]: newArray };
    });
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    const checkTheory = formData.isTheory ? "☑" : "☐";

    const checkPractice = formData.isPractice ? "☑" : "☐";

    const formattedDate = formatDateToThai(formData.date);

    const renderParagraphs = (text) => {
      if (!text) return `<div class="para">-</div>`;
      return text
        .split("\n")
        .map((p) => `<div class="para">${p}</div>`)
        .join("");
    };

    const renderSectionImages = (images = []) => {
      if (!images || images.length === 0) return "";

      if (images.length === 1) {
        return `
          <div style="text-align: center; margin-top: 15px;">
            <img src="${images[0]}" style="max-height: 250px; max-width: 90%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
          </div>
        `;
      }

      return `
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 15px;">
          ${images
            .map(
              (img) => `
            <img src="${img}" style="max-height: 200px; max-width: 45%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
          `,
            )
            .join("")}
        </div>
      `;
    };



    printWindow.document.write(`
      <html>
        <head>
          <title>บันทึกหลังการสอน - ${formData.courseName}</title>
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
            @page { size: A4; margin: 1cm 1.5cm; }
            body { 
              font-family: 'TH Sarabun IT9', 'TH Sarabun New', serif; 
              font-size: 16pt; 
              line-height: 1.3; 
              margin: 0;
              padding: 0;
              color: black;
              box-sizing: border-box;
            }
            .header-box {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
            }
            .header-title { font-size: 18pt; font-weight: bold; text-align: center; }
            .header-subtitle { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 10px; }
            .flex-row { display: flex; align-items: baseline; margin-bottom: 5px; }
            .content-section { margin-top: 15px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .para { text-indent: 1.5cm; text-align: justify; text-justify: inter-character; white-space: pre-line; word-break: break-word; }
            .checkbox-group { text-align: center; margin: 15px 0; font-size: 18pt;}
            .signature-section { display: flex; justify-content: space-around; margin-top: 20px; page-break-inside: avoid; }
            .signature-box { text-align: center; width: 45%; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div class="header-title">บันทึกหลังการสอน รายวิชา ภาคเรียนที่ ${formData.semester} ปีการศึกษา ${formData.academicYear}</div>
            <div class="header-subtitle">วิทยาลัยเทคนิคกันทรลักษ์</div>
            <div class="flex-row">
              <span>รหัสวิชา</span><span style="margin-left: 5px; margin-right:15px;">${formData.courseCode}</span>
              <span>ชื่อวิชา</span><span style="margin-left: 5px;">${formData.courseName}</span>
            </div>
            <div class="flex-row">
              <span>สอนครั้งที่</span><span style="margin-left: 5px; margin-right:15px;">${formData.teachingNo}</span>
              <span>วันที่</span><span style="margin-left: 5px; margin-right:15px;">${formattedDate}</span>
              <span>สัปดาห์ที่</span><span style="margin-left: 5px; margin-right:15px;">${formData.weekNo}</span>
              <span>หน่วยการเรียนรู้ที่</span><span style="margin-left: 5px;">${formData.unitNo}</span>
            </div>
            <div class="flex-row">
              <span>ชื่อหน่วย</span><span style="margin-left: 5px;">${formData.unitName}</span>
            </div>
            <div class="flex-row">
              <span>เรื่อง</span><span style="margin-left: 5px;">${formData.topic}</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">1. กิจกรรมการเรียนการสอน</div>
            ${renderParagraphs(formData.activities)}
            ${renderSectionImages(formData.activitiesImages)}
            <div class="checkbox-group">
              <span style="margin-right: 40px;">${checkTheory} ทฤษฎี</span>
              <span>${checkPractice} ปฏิบัติ</span>
            </div>
          </div>

          <div class="content-section">
            <div class="section-title">2. ผลการดำเนินกิจกรรมการเรียนการสอน</div>
            ${renderParagraphs(formData.results)}
            ${renderSectionImages(formData.resultsImages)}
          </div>

          <div class="content-section">
            <div class="section-title">3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา</div>
            ${renderParagraphs(formData.problems)}
            ${renderSectionImages(formData.problemsImages)}
          </div>

          <div class="signature-section">
            <div class="signature-box" style="display: flex; justify-content: center;">
              <table style="border-collapse: collapse; border: none; font-size: 16pt;">
                <tr>
                  <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
                  <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
                    ${formData.teacherSignature ? `<img src="${formData.teacherSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
                  </td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">(${formData.signerName || "...................................."})</td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">ครูผู้สอน</td>
                </tr>
              </table>
            </div>
            <div class="signature-box" style="display: flex; justify-content: center;">
              <table style="border-collapse: collapse; border: none; font-size: 16pt;">
                <tr>
                  <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
                  <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
                    ${formData.headSignature ? `<img src="${formData.headSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
                  </td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">(${formData.headName || "...................................."})</td>
                </tr>
                <tr>
                  <td style="border: none;"></td>
                  <td style="text-align: center; padding-top: 5px; border: none;">หัวหน้าแผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</td>
                </tr>
              </table>
            </div>
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fixedOptions = {
    semester: ["1", "2", "3"],
    academicYear: ["2568", "2569", "2570"],
    courseCode: ["21910-2018"],
    courseName: ["คอมพิวเตอร์และการบำรุงรักษา"],
    teachingNo: Array.from({ length: 18 }, (_, i) => (i + 1).toString()),
    date: ["10 สิงหาคม 2569"],
    weekNo: Array.from({ length: 18 }, (_, i) => (i + 1).toString()),
    unitNo: Array.from({ length: 18 }, (_, i) => (i + 1).toString()),
    unitName: ["หน่วยที่ 9 การติดตั้งซอฟต์แวร์ประยุกต์"],
    topic: ["อุปกรณ์ฮาร์ดแวร์ภายในและภายนอก และหลักการทำงานของ CPU, RAM, Mainboard"],
    signerName: users.filter(u => u.role === "teacher").map(u => u.name).filter(Boolean),
  };

  const renderInput = (label, name, placeholder = "", colSpan = "col-span-1") => {
    // Determine if we should show a select or text input based on aiOptions state
    // By default, if the field is in fixedOptions and the user hasn't toggled it off, use select
    const isFixedOption = fixedOptions[name] !== undefined;
    const isAiOption = aiOptions[name] && aiOptions[name].length > 0;

    // We show a select if it's either explicitly in aiOptions, or it's a fixedOption and not explicitly disabled
    const hasOptions = isAiOption || (isFixedOption && aiOptions[name] !== false);

    let optionsToRender = isAiOption ? aiOptions[name] : isFixedOption ? fixedOptions[name] : [];

    // Ensure the current value is available in the dropdown options
    if (hasOptions && formData[name] && !optionsToRender.includes(formData[name])) {
      optionsToRender = [formData[name], ...optionsToRender];
    }

    // Convert text inputs that should be dates to date pickers if they don't have options
    const inputType = name === "date" && !hasOptions ? "date" : "text";

    return (
      <div className={`group space-y-3 ${colSpan}`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {label}
          </label>
          {hasOptions && (
            <button
              type="button"
              onClick={() => {
                setAiOptions((prev) => ({
                  ...prev,
                  [name]: false, // Mark as false to disable dropdown and switch to text input
                }));
              }}
              className="text-[10px] font-bold text-blue-500 hover:underline"
            >
              (พิมพ์เอง)
            </button>
          )}
        </div>

        {hasOptions ? (
          <select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full appearance-none rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
          >
            <option value="">-- เลือกจากเอกสาร --</option>
            {optionsToRender.map((u, i) => (
              <option key={i} value={u}>
                {name === "date" ? formatDateToThai(u) : u}
              </option>
            ))}
          </select>
        ) : inputType === "date" ? (
          <PremiumDatePicker
            value={formData[name] || ""}
            onChange={(val) => setFormData((prev) => ({ ...prev, [name]: val }))}
          />
        ) : (
          <input
            name={name}
            type={inputType}
            placeholder={placeholder}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
          />
        )}
      </div>
    );
  };

  const renderTextarea = (label, name, rows = 3, imageFieldName = null) => (
    <div className="group space-y-3 mt-8">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-primary">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={formData[name]}
        onChange={handleChange}
        className="w-full rounded-2xl border-2 border-stroke bg-gray-50 px-4 py-3 text-base font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary md:px-6 md:py-4 md:text-lg"
      />
      {imageFieldName && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4 dark:border-strokedark">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              รูปภาพประกอบ (สามารถอัปโหลดได้หลายรูป)
            </span>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              อัปโหลดรูปภาพ
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleMultipleImageUpload(e, imageFieldName)}
                className="hidden"
              />
            </label>
          </div>
          {formData[imageFieldName] && formData[imageFieldName].length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {formData[imageFieldName].map((url, idx) => (
                <div key={idx} className="relative group/img">
                  <img
                    src={url}
                    alt="Preview"
                    className="h-20 w-auto rounded border border-gray-200 object-contain shadow-sm dark:border-strokedark bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageFieldName, idx)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-gray-400">ยังไม่มีรูปภาพประกอบ</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full px-2">
      <form onSubmit={handleSave} className="space-y-10">
        <div className="relative rounded-3xl border border-stroke bg-white/90 shadow-2xl shadow-primary/5 backdrop-blur-xl dark:border-strokedark dark:bg-boxdark/90 md:rounded-[2.5rem]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl md:rounded-[2.5rem]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"></div>
          </div>

          <div className="relative bg-white px-6 py-8 dark:bg-boxdark md:px-12 md:py-12 rounded-3xl md:rounded-[2.5rem]">
            <div className="relative z-10 flex flex-col justify-between gap-8 border-b border-stroke pb-8 dark:border-strokedark md:flex-row md:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Registration Form
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-black dark:text-white md:text-4xl">
                  {EDITMODE ? "แก้ไขข้อมูล" : "แบบฟอร์มบันทึก"}{" "}
                  <span className="text-primary">การสอน</span>
                </h2>
                <p className="max-w-lg text-sm font-medium leading-relaxed text-gray-500">
                  กรอกข้อมูลรายละเอียดการสอนประจำสัปดาห์ให้ครบถ้วน ข้อมูลจะถูกนำไปใช้ออกแบบฟอร์ม PDF
                  บันทึกหลังการสอน
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  {/* Saved Documents Dropdown */}
                  {savedDocuments.length > 0 && (
                    <div className="flex items-center gap-2 w-full max-w-lg">
                      <select
                        value={selectedDocumentId}
                        onChange={(e) => handleLoadCachedDocument(e.target.value)}
                        className="flex-1 rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2.5 text-sm font-bold text-black outline-none transition focus:border-purple-500 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      >
                        <option value="">📄 เลือกจากเอกสารที่เคยอัปโหลดไว้...</option>
                        {savedDocuments.map(doc => (
                          <option key={doc._id} value={doc._id}>{doc.documentName}</option>
                        ))}
                      </select>
                      {selectedDocumentId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCachedDocument(selectedDocumentId)}
                          className="rounded-xl bg-danger/10 p-2.5 text-danger transition hover:bg-danger hover:text-white"
                          title="ลบเอกสารนี้"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAIUpload}
                      accept="image/jpeg, image/png, image/webp, application/pdf"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={extracting}
                      className="flex w-fit items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {extracting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      )}
                      {extracting
                        ? "กำลังวิเคราะห์ด้วย AI..."
                        : "ดึงข้อมูลอัตโนมัติด้วย AI (PDF/รูปภาพ)"}
                    </button>
                    <p className="text-xs text-gray-400">
                      รองรับไฟล์ แผนการสอน/ตารางสอน (ไม่เกิน 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 to-blue-500/10 text-4xl shadow-inner backdrop-blur-md md:flex">
                📝
              </div>
            </div>

            <div className="relative z-30 pt-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {renderInput("ภาคเรียนที่", "semester")}
                {renderInput("ปีการศึกษา", "academicYear")}
                {renderInput("รหัสวิชา", "courseCode")}
                {renderInput("ชื่อวิชา", "courseName")}

                {renderInput("สอนครั้งที่", "teachingNo")}
                {renderInput("วันที่", "date")}
                {renderInput("สัปดาห์ที่", "weekNo")}
                {renderInput("หน่วยการเรียนรู้ที่", "unitNo")}

                {renderInput("ชื่อหน่วย", "unitName", "", "md:col-span-2")}
                {renderInput("เรื่อง", "topic", "", "md:col-span-2")}
              </div>
            </div>
          </div>

          <div className="relative z-20 border-t border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-black text-black dark:text-white flex items-center gap-2">
                <span className="text-primary">▶</span> รายละเอียดการสอน
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="rounded-xl border border-stroke bg-white px-4 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-3"
                  title="ตั้งค่า API Key ส่วนตัวเพื่อป้องกันการติดลิมิต"
                >
                  ⚙️ ตั้งค่า API
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDetails}
                  disabled={generatingText || !formData.courseName || !formData.topic || cooldownTime > 0}
                  className="flex w-fit items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                >
                {generatingText ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="text-lg leading-none">✨</span>
                )}
                {generatingText
                  ? "AI กำลังเขียน..."
                  : cooldownTime > 0
                  ? `รอ ${cooldownTime} วิ...`
                  : "ให้ AI ช่วยเขียนรายละเอียดการสอน"}
                </button>
              </div>
            </div>

            {(!formData.courseName || !formData.topic) && (
              <p className="text-xs text-danger mb-4 font-semibold">
                * กรุณากรอก "ชื่อวิชา" และ "เรื่อง" ด้านบนก่อน เพื่อให้ AI ช่วยเขียนรายละเอียดได้ตรงจุด
              </p>
            )}

            {renderTextarea("1. กิจกรรมการเรียนการสอน", "activities", 4, "activitiesImages")}

            <div className="mt-4 flex gap-6 justify-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${formData.isTheory ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-gray-600"}`}
                >
                  {formData.isTheory && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  name="isTheory"
                  checked={formData.isTheory}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className=" text-sm font-bold text-gray-700 group-hover:text-primary dark:text-gray-300">
                  ทฤษฎี
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${formData.isPractice ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-gray-600"}`}
                >
                  {formData.isPractice && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  name="isPractice"
                  checked={formData.isPractice}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary dark:text-gray-300">
                  ปฏิบัติ
                </span>
              </label>
            </div>

            {renderTextarea("2. ผลการดำเนินกิจกรรมการเรียนการสอน", "results", 3, "resultsImages")}
            {renderTextarea("3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา", "problems", 3, "problemsImages")}
          </div>

          <div className="relative z-10 border-t border-stroke bg-gray-50/50 p-6 dark:border-strokedark dark:bg-meta-4/20 md:p-12">
            <h3 className="text-xl font-black text-black dark:text-white mb-6 flex items-center gap-2">
              <span className="text-primary">✍️</span> การลงนาม
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {renderInput("ชื่อครูผู้สอน", "signerName")}
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-primary/50 dark:border-strokedark">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    อัปโหลดรูปลายเซ็นครูผู้สอน (แนบภาพ)
                  </div>
                  {formData.teacherSignature && (
                    <div className="relative mb-2">
                      <img
                        src={formData.teacherSignature}
                        alt="Teacher Signature"
                        className="h-28 w-auto rounded-lg border border-stroke bg-white p-2 shadow-sm dark:border-strokedark"
                      />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {formData.teacherSignature ? "เปลี่ยนรูปภาพใหม่" : "เลือกไฟล์รูปภาพ"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSignatureUpload(e, "teacherSignature")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                {renderInput("ชื่อหัวหน้าแผนก", "headName")}
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-primary/50 dark:border-strokedark">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    อัปโหลดรูปลายเซ็นหัวหน้าแผนก (แนบภาพ)
                  </div>
                  {formData.headSignature && (
                    <div className="relative mb-2">
                      <img
                        src={formData.headSignature}
                        alt="Head Signature"
                        className="h-28 w-auto rounded-lg border border-stroke bg-white p-2 shadow-sm dark:border-strokedark"
                      />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {formData.headSignature ? "เปลี่ยนรูปภาพใหม่" : "เลือกไฟล์รูปภาพ"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSignatureUpload(e, "headSignature")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-stroke pt-8 dark:border-strokedark sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleExportPDF}
            className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-success px-8 py-3 font-black text-white shadow-xl shadow-success/30 transition-all hover:scale-[1.02] hover:shadow-success/40 active:scale-95 disabled:opacity-50 sm:h-14 sm:min-w-[200px] sm:flex-none"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
            <div className="relative z-10 flex items-center gap-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="text-sm sm:text-base">Export PDF</span>
            </div>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-primary to-blue-600 px-12 py-3 font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-95 disabled:opacity-50 sm:h-14 sm:min-w-[280px] sm:flex-none"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
            <div className="relative z-10 flex items-center gap-3">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              )}
              <span className="text-sm sm:text-base">
                {loading
                  ? "กำลังประมวลผล..."
                  : EDITMODE
                    ? "อัปเดตข้อมูลทั้งหมด"
                    : "บันทึกข้อมูลหลัก"}
              </span>
            </div>
          </button>

          <Link
            href="/TeachingRecordPage"
            className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-gray-50 px-8 font-bold text-gray-600 transition-all hover:bg-gray-200 hover:text-black dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:h-14 sm:px-10"
          >
            <svg
              className="transition-transform group-hover:-translate-x-1"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>ยกเลิก</span>
          </Link>
        </div>
      </form>

      {message && (
        <div
          className={`fixed bottom-10 right-10 z-9999 rounded-2xl px-8 py-4 font-bold shadow-2xl transition-all duration-300 ${message.type === "success" ? "bg-success text-white" : message.type === "info" ? "bg-blue-500 text-white" : "bg-danger text-white"}`}
        >
          <div className="flex flex-col gap-3">
            <span>{message.text}</span>
            {(message.text.includes("ผู้ใช้งานเยอะ") || message.text.includes("API Key") || message.text.includes("AI ล้มเหลว")) && (
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="w-full rounded-xl bg-white px-4 py-2 text-sm font-bold text-danger hover:bg-gray-100 transition-colors shadow-sm active:scale-95"
              >
                ⚙️ ตั้งค่า API ส่วนตัว
              </button>
            )}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-boxdark">
            <h3 className="mb-2 text-2xl font-black text-black dark:text-white">ตั้งค่า Gemini API Key</h3>
            <p className="mb-6 text-sm text-gray-500">
              กรอก API Key ส่วนตัวของท่านเพื่อป้องกันการติดลิมิตรวมของระบบ<br/>
              (ระบบใช้ความปลอดภัยระดับสูงสุด โดยเก็บเข้ารหัสไว้ในฐานข้อมูลและไม่นำมาแสดงบนหน้าจออีก)
            </p>
            <div className="mb-6 rounded-xl border border-stroke p-4 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
              <h4 className="font-bold text-black dark:text-white mb-2 text-sm">สถานะ API Key ของคุณ:</h4>
              {hasApiKey ? (
                 <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-500">
                   <span>✅</span>
                   <span>ตั้งค่าแล้ว (ระบบกำลังใช้ API Key ของคุณ)</span>
                 </div>
              ) : (
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                   <span>🌐</span>
                   <span>ยังไม่ได้ตั้งค่า (กำลังใช้ API Key ส่วนกลาง)</span>
                 </div>
              )}
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-black dark:text-white">Gemini API Key</label>
              <input
                type="password"
                placeholder="ปล่อยว่างเพื่อลบออกและกลับไปใช้ของส่วนกลาง"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full rounded-xl border border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsApiKeyModalOpen(false);
                  setApiKeyInput("");
                }}
                className="rounded-xl bg-gray-200 px-6 py-2.5 font-bold text-gray-700 transition hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/user/settings/apikey", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ apiKey: apiKeyInput }),
                    });
                    if (res.ok) {
                      alert("บันทึก API Key สำเร็จ");
                      setHasApiKey(!!apiKeyInput.trim());
                      setIsApiKeyModalOpen(false);
                      setApiKeyInput("");
                    } else {
                      alert("เกิดข้อผิดพลาดในการบันทึก");
                    }
                  } catch (error) {
                    alert("เกิดข้อผิดพลาดในการบันทึก");
                  }
                }}
                className="rounded-xl bg-primary px-6 py-2.5 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90"
              >
                บันทึกอย่างปลอดภัย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingRecordForm;
