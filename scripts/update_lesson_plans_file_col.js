const fs = require('fs');

const file = 'd:\\ktltc\\src\\app\\dashboard\\director\\lesson-plans\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update header
const headerTarget = `<th className="px-4 py-3">หัวข้อ</th>`;
const headerReplace = `<th className="px-4 py-3">หัวข้อ</th>\n                    <th className="px-4 py-3 text-center">ไฟล์เอกสาร</th>`;
content = content.replace(headerTarget, headerReplace);

// 2. Update colSpan
content = content.replace(/colSpan=\{isDirector \? 6 : 5\}/g, 'colSpan={isDirector ? 7 : 6}');

// 3. Update row
const rowTarget = `<td className="px-4 py-4 text-sm">{p.title}</td>`;
const rowReplace = `<td className="px-4 py-4 text-sm">{p.title}</td>
                        <td className="px-4 py-4 text-center">
                          {p.fileUrl ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(\`ระบบกำลังเปิดไฟล์: \${p.fileUrl}\`); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest">
                              <FileText size={14} /> ดูไฟล์
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">-</span>
                          )}
                        </td>`;
content = content.replace(rowTarget, rowReplace);

fs.writeFileSync(file, content);
console.log("Added file column successfully.");
