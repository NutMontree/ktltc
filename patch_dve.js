const fs = require('fs');

const path = 'src/app/dashboard/dve/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
if (!content.includes('import * as XLSX from "xlsx";')) {
  content = content.replace(
    'import { useRouter, useSearchParams } from "next/navigation";',
    'import { useRouter, useSearchParams } from "next/navigation";\nimport * as XLSX from "xlsx";\nimport { useReactToPrint } from "react-to-print";'
  );
}

// 2. Add functions
if (!content.includes('handleExportSubmissionsExcel')) {
  const funcString = `
  const printSubmissionsRef = React.useRef(null);
  const handlePrintSubmissions = useReactToPrint({
    contentRef: printSubmissionsRef,
    documentTitle: submissionsQuizTitle || "รายงานผลการทดสอบ",
  });

  const handleExportSubmissionsExcel = () => {
    if (!submissions || submissions.length === 0) {
      import("antd").then(({ message }) => message.error("ไม่มีข้อมูลสำหรับส่งออก"));
      return;
    }
    const dataToExport = submissions.map((sub, idx) => ({
      "ลำดับ": idx + 1,
      "รหัสนักศึกษา": sub.studentIdNum || "",
      "ชื่อ-นามสกุล": sub.studentName || "",
      "ห้องเรียน": standardizeClassGroupName(sub.classGroupId) || "ไม่ระบุ",
      "วันที่ส่ง": new Date(sub.submittedAt).toLocaleDateString("th-TH"),
      "เวลา": new Date(sub.submittedAt).toLocaleTimeString("th-TH"),
      "คะแนน": submissionsIsBuiltIn ? (sub.maxScore > 0 ? \`\${sub.score} / \${sub.maxScore}\` : "-") : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(workbook, \`คะแนน_\${submissionsQuizTitle || "แบบทดสอบ"}.xlsx\`);
  };
`;
  content = content.replace(
    'const [submissions, setSubmissions] = useState<any[]>([]);',
    'const [submissions, setSubmissions] = useState<any[]>([]);\n' + funcString
  );
}

// 3. Add buttons to modal header
if (!content.includes('handleExportSubmissionsExcel}')) {
  const btnString = `
                <div className="flex gap-2 mr-2">
                  <button
                    type="button"
                    onClick={handleExportSubmissionsExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:bg-emerald-900/30 dark:hover:bg-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                  >
                    <Download size={12} /> Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintSubmissions()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-900/30 dark:hover:bg-red-600 dark:text-red-400 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                  >
                    <Download size={12} /> PDF
                  </button>
                </div>
                <button
`;
  content = content.replace(
    `                <button
                  type="button"
                  onClick={() => {
                    setIsSubmissionsModalOpen(false);
                    setSubmissionsPreviewUrl(null);
                  }}`,
    btnString + `                  type="button"
                  onClick={() => {
                    setIsSubmissionsModalOpen(false);
                    setSubmissionsPreviewUrl(null);
                  }}`
  );
}

// 4. Add hidden print component
if (!content.includes('ref={printSubmissionsRef}')) {
  const printString = `
                <div style={{ display: "none" }}>
                  <div ref={printSubmissionsRef} className="p-8 text-black bg-white">
                    <h2 className="text-xl font-bold mb-4 text-center">รายงานคะแนน: {submissionsQuizTitle}</h2>
                    <table className="w-full text-xs border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100 border border-gray-300">
                          <th className="p-2 border border-gray-300 text-center">ลำดับ</th>
                          <th className="p-2 border border-gray-300 text-center">รหัสนักศึกษา</th>
                          <th className="p-2 border border-gray-300 text-left">ชื่อ-นามสกุล</th>
                          <th className="p-2 border border-gray-300 text-center">ห้องเรียน</th>
                          <th className="p-2 border border-gray-300 text-center">วันที่ส่ง</th>
                          <th className="p-2 border border-gray-300 text-center">เวลา</th>
                          {submissionsIsBuiltIn && <th className="p-2 border border-gray-300 text-center">คะแนน</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, idx) => (
                          <tr key={sub.id} className="border border-gray-300">
                            <td className="p-2 border border-gray-300 text-center">{idx + 1}</td>
                            <td className="p-2 border border-gray-300 text-center">{sub.studentIdNum || ""}</td>
                            <td className="p-2 border border-gray-300">{sub.studentName}</td>
                            <td className="p-2 border border-gray-300 text-center">{standardizeClassGroupName(sub.classGroupId) || "ไม่ระบุ"}</td>
                            <td className="p-2 border border-gray-300 text-center">{new Date(sub.submittedAt).toLocaleDateString("th-TH")}</td>
                            <td className="p-2 border border-gray-300 text-center">{new Date(sub.submittedAt).toLocaleTimeString("th-TH")}</td>
                            {submissionsIsBuiltIn && (
                              <td className="p-2 border border-gray-300 text-center">
                                {sub.maxScore > 0 ? \`\${sub.score} / \${sub.maxScore}\` : "-"}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;
  content = content.replace(
    `              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`,
    printString
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched successfully');
