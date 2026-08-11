1: "use client";
2: 
3: import React, { useEffect, useState } from "react";
4: import Link from "next/link";
5: import { useSession } from "next-auth/react";
6: 
7: 
8: export default function TeachingRecordPage() {
9:   const { data: session } = useSession();
10:   const userRole = session?.user?.role?.toLowerCase() || "";
11:   const isSuperAdmin = userRole === "super_admin" || userRole === "admin";
12:   const currentUser = session?.user?.name || "";
13: 
14:   const [records, setRecords] = useState([]);
15:   const [loading, setLoading] = useState(true);
16:   const [selectedTeacher, setSelectedTeacher] = useState(null);
17:   const [selectedWeek, setSelectedWeek] = useState("");
18:   const [searchTerm, setSearchTerm] = useState("");
19: 
20:   const triggerPrint = async (recordsToPrint) => {
21:     const printWindow = window.open("", "_blank");
22:     printWindow.document.write("<html><head><title>Loading...</title></head><body><h2 style='text-align:center;font-family:sans-serif;margin-top:20vh;'>กำลังเตรียมข้อมูล PDF... กรุณารอสักครู่</h2></body></html>");
23: 
24:     let recordsArray = Array.isArray(recordsToPrint) ? recordsToPrint : [recordsToPrint];
25: 
26:     // Fetch missing signatures asynchronously
27:     recordsArray = await Promise.all(recordsArray.map(async (record) => {
28:       let teacherSig = record.teacherSignature;
29:       let headSig = record.headSignature;
30: 
31:       if (!teacherSig && record.signerName) {
32:         try {
33:           const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(record.signerName)}&type=teacher`);
34:           if (res.ok) {
35:             const data = await res.json();
36:             teacherSig = data.signature || "";
37:           }
38:         } catch (e) { }
39:       }
40: 
41:       if (!headSig && record.headName) {
42:         try {
43:           const res = await fetch(`/api/TeachingRecords/lastSignature?name=${encodeURIComponent(record.headName)}&type=head`);
44:           if (res.ok) {
45:             const data = await res.json();
46:             headSig = data.signature || "";
47:           }
48:         } catch (e) { }
49:       }
50: 
51:       return {
52:         ...record,
53:         teacherSignature: teacherSig,
54:         headSignature: headSig,
55:         semester: record.semester || "1",
56:         academicYear: record.academicYear || "2569",
57:       };
58:     }));
59: 
60:     const formatDateToThai = (dateString) => {
61:       if (!dateString) return "";
62:       if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
63:         const [year, month, day] = dateString.split("-");
64:         const thaiMonths = [
65:           "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
66:           "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
67:         ];
68:         const thaiYear = parseInt(year) + (parseInt(year) < 2500 ? 543 : 0);
69:         return `${parseInt(day)} ${thaiMonths[parseInt(month) - 1]} ${thaiYear}`;
70:       }
71:       return dateString;
72:     };
73: 
74:     const renderParagraphs = (text) => {
75:       if (!text) return `<div class="para">-</div>`;
76:       return text
77:         .split("\n")
78:         .map((p) => `<div class="para">${p}</div>`)
79:         .join("");
80:     };
81: 
82:     const renderSectionImages = (images = []) => {
83:       if (!images || images.length === 0) return "";
84:       if (images.length === 1) {
85:         return `
86:           <div style="text-align: center; margin-top: 15px;">
87:             <img src="${images[0]}" style="max-height: 250px; max-width: 90%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
88:           </div>
89:         `;
90:       }
91:       return `
92:         <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 15px;">
93:           ${images
94:           .map(
95:             (img) => `
96:             <img src="${img}" style="max-height: 200px; max-width: 45%; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />
97:           `
98:           )
99:           .join("")}
100:         </div>
101:       `;
102:     };
103: 
104:     const pagesHTML = recordsArray.map((record, index) => {
105:       const checkTheory = record.isTheory ? "☑" : "☐";
106:       const checkPractice = record.isPractice ? "☑" : "☐";
107:       const formattedDate = formatDateToThai(record.date);
108: 
109:       return `
110:         <div style="${index < recordsArray.length - 1 ? 'page-break-after: always;' : ''}">
111:           <div class="header-box">
112:             <div class="header-title">บันทึกหลังการสอน รายวิชา ภาคเรียนที่ ${record.semester} ปีการศึกษา ${record.academicYear}</div>
113:             <div class="header-subtitle">วิทยาลัยเทคนิคกันทรลักษ์</div>
114:             <div class="flex-row">
115:               <span>รหัสวิชา</span><span style="margin-left: 5px; margin-right:15px;">${record.courseCode || ""}</span>
116:               <span>ชื่อวิชา</span><span style="margin-left: 5px;">${record.courseName || ""}</span>
117:             </div>
118:             <div class="flex-row">
119:               <span>สอนครั้งที่</span><span style="margin-left: 5px; margin-right:15px;">${record.teachingNo || ""}</span>
120:               <span>วันที่</span><span style="margin-left: 5px; margin-right:15px;">${formattedDate}</span>
121:               <span>สัปดาห์ที่</span><span style="margin-left: 5px; margin-right:15px;">${record.weekNo || ""}</span>
122:               <span>หน่วยการเรียนรู้ที่</span><span style="margin-left: 5px;">${record.unitNo || ""}</span>
123:             </div>
124:             <div class="flex-row">
125:               <span>ชื่อหน่วย</span><span style="margin-left: 5px;">${record.unitName || ""}</span>
126:             </div>
127:             <div class="flex-row">
128:               <span>เรื่อง</span><span style="margin-left: 5px;">${record.topic || ""}</span>
129:             </div>
130:           </div>
131: 
132:           <div class="content-section">
133:             <div class="section-title">1. กิจกรรมการเรียนการสอน</div>
134:             ${renderParagraphs(record.activities)}
135:             ${renderSectionImages(record.activitiesImages)}
136:             <div class="checkbox-group">
137:               <span style="margin-right: 40px;">${checkTheory} ทฤษฎี</span>
138:               <span>${checkPractice} ปฏิบัติ</span>
139:             </div>
140:           </div>
141: 
142:           <div class="content-section">
143:             <div class="section-title">2. ผลการดำเนินกิจกรรมการเรียนการสอน</div>
144:             ${renderParagraphs(record.results)}
145:             ${renderSectionImages(record.resultsImages)}
146:           </div>
147: 
148:           <div class="content-section">
149:             <div class="section-title">3. ปัญหาอุปสรรค/แนวทางการแก้ไขปัญหา</div>
150:             ${renderParagraphs(record.problems)}
151:             ${renderSectionImages(record.problemsImages)}
152:           </div>
153: 
154:           <div class="signature-section">
155:             <div class="signature-box" style="display: flex; justify-content: center;">
156:               <table style="border-collapse: collapse; border: none; font-size: 16pt;">
157:                 <tr>
158:                   <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
159:                   <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
160:                     ${record.teacherSignature ? `<img src="${record.teacherSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
161:                   </td>
162:                 </tr>
163:                 <tr>
164:                   <td style="border: none;"></td>
165:                   <td style="text-align: center; padding-top: 5px; border: none;">(${record.signerName || "...................................."})</td>
166:                 </tr>
167:                 <tr>
168:                   <td style="border: none;"></td>
169:                   <td style="text-align: center; padding-top: 5px; border: none;">ครูผู้สอน</td>
170:                 </tr>
171:               </table>
172:             </div>
173:             <div class="signature-box" style="display: flex; justify-content: center;">
174:               <table style="border-collapse: collapse; border: none; font-size: 16pt;">
175:                 <tr>
176:                   <td style="vertical-align: bottom; padding-right: 5px; padding-bottom: 5px; border: none;">ลงชื่อ</td>
177:                   <td style="text-align: center; vertical-align: bottom; border-bottom: 1px dotted black; width: 220px; height: 80px; border-top: none; border-left: none; border-right: none;">
178:                     ${record.headSignature ? `<img src="${record.headSignature}" style="max-height: 75px; object-fit: contain; margin-bottom: -5px;" />` : ``}
179:                   </td>
180:                 </tr>
181:                 <tr>
182:                   <td style="border: none;"></td>
183:                   <td style="text-align: center; padding-top: 5px; border: none;">(${record.headName || "...................................."})</td>
184:                 </tr>
185:                 <tr>
186:                   <td style="border: none;"></td>
187:                   <td style="text-align: center; padding-top: 5px; border: none;">หัวหน้าแผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</td>
188:                 </tr>
189:               </table>
190:             </div>
191:           </div>
192:         </div>
193:       `;
194:     }).join("");
195: 
196:     printWindow.document.open();
197:     printWindow.document.write(`
198:       <html>
199:         <head>
200:           <title>บันทึกหลังการสอน</title>
201:           <base href="${window.location.origin}">
202:           <style>
203:             @font-face {
204:               font-family: 'TH Sarabun New';
205:               src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew.ttf') format('truetype');
206:               font-weight: normal; font-style: normal;
207:             }
208:             @font-face {
209:               font-family: 'TH Sarabun New';
210:               src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew-Bold.ttf') format('truetype');
211:               font-weight: bold; font-style: normal;
212:             }
213:             @page { size: A4; margin: 1cm 1.5cm; }
214:             body { 
215:               font-family: 'TH Sarabun IT9', 'TH Sarabun New', serif; 
216:               font-size: 16pt; 
217:               line-height: 1.3; 
218:               margin: 0;
219:               padding: 0;
220:               color: black;
221:               box-sizing: border-box;
222:             }
223:             .header-box {
224:               border: 1px solid #000;
225:               padding: 15px;
226:               margin-bottom: 20px;
227:             }
228:             .header-title { font-size: 18pt; font-weight: bold; text-align: center; }
229:             .header-subtitle { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 10px; }
230:             .flex-row { display: flex; align-items: baseline; margin-bottom: 5px; }
231:             .content-section { margin-top: 15px; }
232:             .section-title { font-weight: bold; margin-bottom: 5px; }
233:             .para { text-indent: 1.5cm; text-align: justify; text-justify: inter-character; white-space: pre-line; word-break: break-word; }
234:             .checkbox-group { text-align: center; margin: 15px 0; font-size: 18pt;}
235:             .signature-section { display: flex; justify-content: space-around; margin-top: 20px; page-break-inside: avoid; }
236:             .signature-box { text-align: center; width: 45%; }
237:           </style>
238:         </head>
239:         <body>
240:           ${pagesHTML}
241:           <script>
242:             const printContent = () => {
243:               setTimeout(() => {
244:                 window.print();
245:               }, 500);
246:             };
247:             if (document.fonts && document.fonts.ready) {
248:               document.fonts.ready.then(printContent);
249:             } else {
250:               printContent();
251:             }
252:           </script>
253:         </body>
254:       </html>
255:     `);
256:     printWindow.document.close();
257:   };
258: 
259:   const [users, setUsers] = useState([]);
260:   const [selectedSemester, setSelectedSemester] = useState("");
261:   const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
262:   const [selectedDepartment, setSelectedDepartment] = useState("");
263:   const [viewingWeekRecords, setViewingWeekRecords] = useState(null);
264:   const [activeTab, setActiveTab] = useState("submitted");
265: 
266:   useEffect(() => {
267:     const fetchData = async () => {
268:       setLoading(true);
269: 
270:     if (searchTerm) {
271:       const term = searchTerm.toLowerCase();
272:       if (!(r.courseName || "").toLowerCase().includes(term) &&
273:           !(r.signerName || "").toLowerCase().includes(term) &&
274:           !(r.courseCode || "").toLowerCase().includes(term)) {
275:         return false;
276:       }
277:     }
278:     return true;
279:   });
280: 
281:   const weekGroups = {};
282:   for (let i = 1; i <= 18; i++) {
283:     weekGroups[i] = [];
284:   }
285:   
286:   filteredRecords.forEach(r => {
287:     const w = parseInt(r.weekNo);
288:     if (!isNaN(w) && w >= 1 && w <= 18) {
289:       weekGroups[w].push(r);
290:     }
291:   });
292: 
293:   return (
294:     <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
295:       <div className="mb-6 flex flex-col gap-4">
296:         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
297:           <div>
298:             <h1 className="text-3xl font-black text-black dark:text-white">ภาพรวมบันทึกการสอนรายสัปดาห์</h1>
299:             <p className="mt-1 text-sm text-gray-500">ตรวจสอบยอดการส่งบันทึกการสอนแบ่งตามสัปดาห์</p>
300:           </div>
301:           <Link
302:             href={`/TeachingRecordPage/new?teacher=${encodeURIComponent(currentUser)}`}
303:             className="shrink-0 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 self-start md:self-auto"
304:           >
305:             + สร้างบันทึกใหม่
306:           </Link>
307:         </div>
308: 
309:         {/* Filters */}
310:         <div className="grid grid-cols-1 gap-4 md:grid-cols-4 rounded-3xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
311:           <div>
312:             <label className="mb-2 block text-sm font-bold text-gray-500">ภาคเรียน</label>
313:             <select
314:               value={selectedSemester}
315:               onChange={(e) => setSelectedSemester(e.target.value)}
316:               className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
317:             >
318:               <option value="">ทั้งหมด</option>
319:               {availableSemesters.map(s => <option key={s} value={s}>เทอม {s}</option>)}
320:             </select>
321:           </div>
322:           <div>
323:             <label className="mb-2 block text-sm font-bold text-gray-500">ปีการศึกษา</label>
324:             <select
325:               value={selectedAcademicYear}
326:               onChange={(e) => setSelectedAcademicYear(e.target.value)}
327:               className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
328:             >
329:               <option value="">ทั้งหมด</option>
330:               {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
331:             </select>
332:           </div>
333:           <div>
334:             <label className="mb-2 block text-sm font-bold text-gray-500">แผนกวิชา</label>
335:             <select
336:               value={selectedDepartment}
337:               onChange={(e) => setSelectedDepartment(e.target.value)}
338:               className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
339:             >
340:               <option value="">ทั้งหมด</option>
341:               {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
342:             </select>
343:           </div>
344:           <div>
345:             <label className="mb-2 block text-sm font-bold text-gray-500">ค้นหาวิชา / ผู้สอน</label>
346:             <input
347:               type="text"
348:               placeholder="พิมพ์ชื่อวิชา..."
349:               value={searchTerm}
350:               onChange={(e) => setSearchTerm(e.target.value)}
351:               className="w-full rounded-xl border-2 border-stroke bg-gray-50 px-4 py-2 font-bold outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
352:             />
353:           </div>
354:         </div>
355:       </div>
356: 
357:       {loading ? (
358:         <div className="flex items-center justify-center p-10 text-gray-500">กำลังโหลด...</div>
359:       ) : (
360:         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
361:           {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
362:             const recordsForWeek = weekGroups[week];
363:             const hasRecord = recordsForWeek.length > 0;
364:             return (
365:               <div
366:                 key={week}
367:                 onClick={() => {
368:                   setViewingWeekRecords({ week, records: recordsForWeek });
369:                   setActiveTab('submitted');
370:                 }}
371:                 className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border p-6 shadow-sm transition hover:scale-105 hover:shadow-lg ${
372:                   hasRecord 
373:                     ? "border-primary/30 bg-primary/5 hover:border-primary dark:bg-boxdark dark:border-strokedark" 
374:                     : "border-stroke bg-white hover:border-primary/50 dark:border-strokedark dark:bg-boxdark opacity-70 hover:opacity-100"
375:                 }`}
376:               >
377:                 <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full transition ${
378:                   hasRecord 
379:                     ? "bg-primary text-white shadow-lg shadow-primary/30" 
380:                     : "bg-gray-100 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary dark:bg-meta-4"
381:                 }`}>
382:                   <span className="text-2xl font-black">{week}</span>
383:                 </div>
384:                 <h3 className="text-lg font-bold text-black dark:text-white text-center">
385:                   สัปดาห์ที่ {week}
386:                 </h3>
387:                 <p className={`mt-2 text-sm font-semibold text-center rounded-lg px-3 py-1 ${hasRecord ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-gray-400'}`}>
388:                   {hasRecord ? `ส่งแล้ว ${recordsForWeek.length} รายการ` : 'ยังไม่มีคนส่ง'}
389:                 </p>
390:               </div>
391:             );
392:           })}
393:         </div>
394:       )}
395: 
396:       {/* Modal View Week Records */}
397:       {viewingWeekRecords && (
398:         <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
399:           <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-boxdark">
400:             <div className="flex items-center justify-between border-b border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-meta-4">
401:               <h3 className="text-2xl font-black text-black dark:text-white">
402:                 บันทึกการสอน สัปดาห์ที่ {viewingWeekRecords.week}
403:               </h3>
404:               <button
405:                 onClick={() => setViewingWeekRecords(null)}
406:                 className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition hover:bg-danger hover:text-white dark:bg-boxdark"
407:               >
408:                 ✕
409:               </button>
410:             </div>
411:             
412:             <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-boxdark">
413:               {(() => {
414:                 const submittedTeachers = new Set(viewingWeekRecords.records.map(r => r.signerName));
415:                 const targetTeachers = users.filter(u => {
416:                   if (selectedDepartment) return u.department === selectedDepartment;
417:                   return u.department && availableDepts.includes(u.department); 
418:                 });
419:                 const unsubmittedTeachers = targetTeachers.filter(u => u.name && !submittedTeachers.has(u.name));
420:                 return (
421:                   <>
422:                     <div className="mb-6 flex space-x-2 border-b border-stroke dark:border-strokedark pb-2">
423:                       <button
424:                         onClick={() => setActiveTab('submitted')}
425:                         className={`px-4 py-2 font-bold transition ${activeTab === 'submitted' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
426:                       >
427:                         ส่งแล้ว ({viewingWeekRecords.records.length} รายการ)
428:                       </button>
429:                       <button
430:                         onClick={() => setActiveTab('missing')}
431:                         className={`px-4 py-2 font-bold transition ${activeTab === 'missing' ? 'border-b-2 border-danger text-danger' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
432:                       >
433:                         ยังไม่ส่ง ({unsubmittedTeachers.length} คน)
434:                       </button>
435:                     </div>
436: 
437:                     <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
438:                       <div>
439:                         <p className="text-sm font-bold text-gray-500">
440:                           แสดงข้อมูล: {selectedDepartment || "ทุกแผนก"} | เทอม {selectedSemester || "ทั้งหมด"} | ปี {selectedAcademicYear || "ทั้งหมด"}
441:                         </p>
442:                       </div>
443:                       {activeTab === 'submitted' && (
444:                         <button
445:                           onClick={() => triggerPrint(viewingWeekRecords.records)}
446:                           className="rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-opacity-90 flex items-center gap-2"
447:                         >
448:                           <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
449:                           Export PDF ทั้งสัปดาห์
450:                         </button>
451:                       )}
452:                     </div>
453: 
454:                     {activeTab === 'submitted' ? (
455:                       <div className="grid gap-4 md:grid-cols-2">
456:                         {viewingWeekRecords.records.map((record) => (
457:                           <div key={record._id} className="flex flex-col rounded-2xl border border-stroke bg-gray-50 p-6 shadow-sm transition hover:border-primary/50 dark:border-strokedark dark:bg-meta-4">
458:                             <div className="flex justify-between items-start mb-4">
459:                               <h3 className="text-lg font-bold text-black dark:text-white line-clamp-1 pr-4">{record.courseName}</h3>
460:                               <span className="shrink-0 text-xs font-bold bg-white dark:bg-boxdark text-primary px-3 py-1.5 rounded-lg shadow-sm border border-stroke dark:border-strokedark">สอนครั้งที่ {record.teachingNo}</span>
461:                             </div>
462:                             
463:                             <div className="flex items-center gap-3 mb-4 rounded-xl bg-white p-3 border border-stroke dark:bg-boxdark dark:border-strokedark shadow-sm">
464:                               {userImageMap[record.signerName] ? (
465:                                 <img src={userImageMap[record.signerName]} alt={record.signerName} className="h-10 w-10 rounded-full object-cover border border-primary/20" />
466:                               ) : (
467:                                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
468:                                   {(record.signerName || "อ")[0]}
469:                                 </div>
470:                               )}
471:                               <div>
472:                                 <p className="text-sm font-bold text-black dark:text-white">{record.signerName || "ไม่ระบุชื่อครูผู้สอน"}</p>
473:                                 <p className="text-xs font-semibold text-gray-500">วันที่: {record.date || "ไม่ระบุ"}</p>
474:                               </div>
475:                             </div>
476:                             
477:                             <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 flex-1 mb-4">เรื่อง: {record.topic}</p>
478: 
479:                             <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-stroke dark:border-strokedark">
480:                               {(isSuperAdmin || currentUser === (record.signerName || "ไม่ระบุชื่อครูผู้สอน")) && (
481:                                 <Link
482:                                   href={`/TeachingRecordPage/${record._id}`}
483:                                   className="flex-1 rounded-xl bg-primary/10 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-white min-w-[80px]"
484:                                 >
485:                                   แก้ไข
486:                                 </Link>
487:                               )}
488:                               <button
489:                                 onClick={() => triggerPrint([record])}
490:                                 className="flex-1 rounded-xl bg-indigo-500/10 py-2.5 text-center text-sm font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white min-w-[80px]"
491:                               >
492:                                 Export PDF
493:                               </button>
494:                               {(isSuperAdmin || currentUser === (record.signerName || "ไม่ระบุชื่อครูผู้สอน")) && (
495:                                 <button
496:                                   onClick={(e) => handleDelete(record._id, e)}
497:                                   className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-bold text-danger transition hover:bg-danger hover:text-white"
498:                                 >
499:                                   ลบ
500:                                 </button>
501:                               )}
502:                             </div>
503:                           </div>
504:                         ))}
505:                       </div>
506:                     ) : (
507:                       <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
508:                         {unsubmittedTeachers.length > 0 ? unsubmittedTeachers.map((t) => (
509:                           <div key={t._id || t.name} className="flex items-center gap-3 rounded-2xl border border-stroke bg-gray-50 p-4 shadow-sm dark:border-strokedark dark:bg-meta-4">
510:                             {userImageMap[t.name] ? (
511:                               <img src={userImageMap[t.name]} alt={t.name} className="h-12 w-12 shrink-0 rounded-full object-cover border border-danger/20" />
512:                             ) : (
513:                               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger font-bold text-xl">
514:                                 {(t.name || "อ")[0]}
515:                               </div>
516:                             )}
517:                             <div className="min-w-0">
518:                               <p className="text-sm font-bold text-black dark:text-white line-clamp-1">{t.name}</p>
519:                               <p className="text-xs font-semibold text-gray-500 line-clamp-1">{t.department}</p>
520:                             </div>
521:                           </div>
522:                         )) : (
523:                           <div className="col-span-full py-10 text-center text-gray-500 font-bold">
524:                             ส่งครบทุกคนแล้ว! 🎉
525:                           </div>
526:                         )}
527:                       </div>
528:                     )}
529:                   </>
530:                 );
531:               })()}
532:             </div>
533:           </div>
534:         </div>
535:       )}
536:     </div>
537:   );
538: }
539: 
The above content shows the entire, complete file contents of the requested file.
