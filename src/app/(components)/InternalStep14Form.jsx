"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MIN_ROWS = 5;

const toThaiNumerals = (num) => {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return num.toString().split('').map(digit => thaiNumerals[digit] || digit).join('');
};

const InternalStep14Form = ({ projectId, initialData = {}, projectData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Ensure minimum 5 rows
  const initialParticipants = Array.isArray(initialData.participants) && initialData.participants.length > 0 
    ? initialData.participants 
    : Array(MIN_ROWS).fill({ name: "", position: "", remark: "" });
    
  while (initialParticipants.length < MIN_ROWS) {
    initialParticipants.push({ name: "", position: "", remark: "" });
  }

  const [participants, setParticipants] = useState(initialParticipants);
  const [header1, setHeader1] = useState(initialData.header1 || "รายชื่อผู้เข้าร่วมกิจกรรม");
  const [header2, setHeader2] = useState(initialData.header2 || `โครงการ ${projectData?.nameproject || ""}`.trim());
  const [footerText, setFooterText] = useState(initialData.footerText || "“เรียนดี มีคุณธรรม”");

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: "", position: "", remark: "" }]);
  };

  const removeParticipant = (index) => {
    if (participants.length > MIN_ROWS) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setParticipants(newParticipants);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/InternalPdcas/" + projectId + "/step14", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants, header1, header2, footerText }),
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
    
    const formatPosition = (text) => {
      if (!text) return '';
      
      // If position contains "และ", smartly truncate before it to keep meaning intact
      const andIndex = text.indexOf("และ");
      if (andIndex > 15) {
        return text.substring(0, andIndex).trim() + " ฯ";
      }
      
      if (text.length > 30) {
        return text.substring(0, 30).trim() + " ฯ";
      }
      return text;
    };

    // Generate HTML for participants
    const participantsHtml = participants.map((p, index) => `
      <tr>
        <td class="text-center">${toThaiNumerals(index + 1)}</td>
        <td>${p.name || ''}</td>
        <td class="text-center">${formatPosition(p.position)}</td>
        <td></td>
        <td>${p.remark || ''}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>รายชื่อผู้เข้าร่วมกิจกรรม</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body {
              font-family: 'TH SarabunIT๙';
              font-size: 14px;
              margin: 0;
              padding: 0;
              color: black;
              background: white;
              display: flex;
              flex-direction: column;
              height: 100%;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            h1 { font-size: 20px; margin: 0 0 5px 0; font-weight: bold; }
            h2 { font-size: 20px; margin: 0 0 10px 0; font-weight: bold; }
            .divider { font-size: 14px; margin-bottom: 20px; letter-spacing: 2px; height: 20px; overflow: hidden; display: flex; justify-content: center; font-weight: bold; }
            
            table {
              width: calc(100% - 2px);
              margin: 0 auto;
              border-collapse: collapse;
              font-size: 14px;
              table-layout: fixed;
            }
            th, td {
              font-weight: normal;
              border: 1px solid black;
              padding: 10px 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            th { text-align: center; }
            
            .footer {
              margin-top: auto;
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              padding-top: 30px;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="text-center" style="margin-bottom: 20px;">
            <h1>${header1}</h1>
            <h2>${header2}</h2>
            <div class="divider">
              ********************************************************************************************************************************
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 6%;">ลำดับ</th>
                <th style="width: 30%;">ชื่อ-สกุล</th>
                <th style="width: 26%;">ตำแหน่ง</th>
                <th style="width: 16%;">ลงชื่อ</th>
                <th style="width: 22%;">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              ${participantsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            ${footerText || ""}
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

  return (
    <>
      <div className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:bg-boxdark mb-10 no-print">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between border-b pb-6 gap-4">
          <h2 className="text-2xl font-black text-primary">ลายมือชื่อผู้เข้าร่วมโครงการ</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrint}
              className="rounded-xl bg-[#ff9800] px-8 py-2 font-bold text-white hover:bg-opacity-90 shadow-md transition-all active:scale-95"
            >
              🖨️ พิมพ์ / Export PDF
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-primary px-8 py-2 font-bold text-white hover:bg-opacity-90 shadow-md transition-all active:scale-95"
            >
              {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
            </button>
            <Link
              href="/InternalPdcaPage"
              className="flex items-center justify-center rounded-xl bg-gray-100 px-8 py-2 font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              กลับ
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-meta-4">
            <h3 className="mb-4 text-lg font-black text-black dark:text-white">ส่วนหัวกระดาษ (Header)</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={header1}
                onChange={(e) => setHeader1(e.target.value)}
                className="w-full rounded-xl border border-stroke bg-white px-4 py-3 font-bold text-gray-700 outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                placeholder="ระบุข้อความหัวกระดาษบรรทัดแรก..."
              />
              <input
                type="text"
                value={header2}
                onChange={(e) => setHeader2(e.target.value)}
                className="w-full rounded-xl border border-stroke bg-white px-4 py-3 font-bold text-gray-700 outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                placeholder="ระบุข้อความหัวกระดาษบรรทัดที่สอง..."
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-gray-50 text-black dark:bg-meta-4 dark:text-white">
                  <th className="border-b border-stroke px-4 py-4 font-bold w-16 text-center dark:border-strokedark">ลำดับ</th>
                  <th className="border-b border-stroke px-4 py-4 font-bold w-1/3 dark:border-strokedark">ชื่อ-สกุล</th>
                  <th className="border-b border-stroke px-4 py-4 font-bold w-1/3 dark:border-strokedark">ตำแหน่ง</th>
                  <th className="border-b border-stroke px-4 py-4 font-bold dark:border-strokedark">หมายเหตุ</th>
                  <th className="border-b border-stroke px-4 py-4 font-bold w-20 text-center dark:border-strokedark">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={index} className="border-b border-stroke dark:border-strokedark last:border-b-0">
                    <td className="px-4 py-3 text-center text-sm font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="ชื่อ-สกุล"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={p.position}
                        onChange={(e) => handleParticipantChange(index, "position", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="ตำแหน่ง"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={p.remark}
                        onChange={(e) => handleParticipantChange(index, "remark", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="หมายเหตุ"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeParticipant(index)}
                        disabled={participants.length <= MIN_ROWS}
                        className="text-danger hover:text-opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="ลบแถว"
                      >
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={addParticipant}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary/5 py-4 font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            เพิ่มรายชื่อผู้เข้าร่วม
          </button>
        </div>

        {/* Footer Text Input Section */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 py-3 px-4 border border-gray-100 dark:bg-meta-4 dark:border-strokedark">
            <div className="w-1.5 h-6 rounded-full bg-primary"></div>
            <h3 className="text-lg font-black text-black dark:text-white">ข้อความท้ายกระดาษ (Footer)</h3>
          </div>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full rounded-2xl border border-stroke bg-white px-4 py-4 text-center text-lg font-bold text-gray-700 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-strokedark dark:bg-boxdark dark:text-white"
            placeholder="ระบุข้อความท้ายกระดาษ..."
          />
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

export default InternalStep14Form;
