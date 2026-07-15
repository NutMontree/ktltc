const fs = require('fs');

const file = 'd:\\ktltc\\src\\app\\dashboard\\director\\lesson-plans\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add selectedFile state
content = content.replace(
  'const [newPlan, setNewPlan] = useState({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });',
  'const [newPlan, setNewPlan] = useState<any>({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });\n  const [selectedFile, setSelectedFile] = useState<File | null>(null);'
);

// Reset state
content = content.replace(
  'setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });',
  'setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });\n        setSelectedFile(null);'
);

// Update handleAdd
const handleAddTarget = `  const handleAdd = async () => {
    if (!newPlan.subject || !newPlan.title) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      const res = await fetch("/api/director/lesson-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPlan, teacherName: user.username || "Unknown" })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });
        setSelectedFile(null);
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };`;

const handleAddReplace = `  const handleAdd = async () => {
    if (!newPlan.subject || !newPlan.title) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    
    let uploadedUrl = newPlan.fileUrl;
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedUrl = uploadData.url;
        } else {
          return alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
        }
      } catch (err) {
        return alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }
    }

    try {
      const payload = { ...newPlan, fileUrl: uploadedUrl, teacherName: user.username || "Unknown" };
      const method = newPlan._id ? "PATCH" : "POST";
      const res = await fetch("/api/director/lesson-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });
        setSelectedFile(null);
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };`;

content = content.replace(handleAddTarget, handleAddReplace);

// Update file input onChange
const fileInputTarget = `// จำลองการอัปโหลดไฟล์ โดยเก็บเป็นชื่อไฟล์ไว้ก่อน
                        setNewPlan({...newPlan, fileUrl: e.target.files[0].name});`;
const fileInputReplace = `setSelectedFile(e.target.files[0]);`;
content = content.replace(fileInputTarget, fileInputReplace);

// Update view file link
const viewLinkTarget = `<a href="#" onClick={(e) => { e.preventDefault(); alert(\`ระบบกำลังเปิดไฟล์: \${p.fileUrl}\`); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest">`;
const viewLinkReplace = `<a href={p.fileUrl} target="_blank" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest">`;
content = content.replace(viewLinkTarget, viewLinkReplace);

// Remove isDirector from th
content = content.replace(
  '{isDirector && <th className="px-4 py-3 rounded-r-xl text-center">จัดการ (ผู้อำนวยการ)</th>}',
  '<th className="px-4 py-3 rounded-r-xl text-center">จัดการ</th>'
);

// Update colSpan logic since column is always there now
content = content.replace(/colSpan=\{isDirector \? 7 : 6\}/g, 'colSpan={7}');

// Update row actions
const rowActionsTarget = `                        {isDirector && (
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleStatus(p._id, "approved")} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="อนุมัติ"><Check size={16} /></button>
                              <button onClick={() => handleStatus(p._id, "rejected")} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors" title="ไม่อนุมัติ"><X size={16} /></button>
                            </div>
                          </td>
                        )}`;
const rowActionsReplace = `                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {p.teacherName === user.username && (
                              <>
                                <button onClick={() => { setNewPlan(p); setShowAdd(true); window.scrollTo(0, 0); }} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors text-xs font-bold" title="แก้ไข">แก้ไข</button>
                                <button onClick={async () => { if (confirm('ต้องการลบข้อมูลนี้หรือไม่?')) { await fetch(\`/api/director/lesson-plans?id=\${p._id}\`, { method: 'DELETE' }); fetchPlans(); } }} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold" title="ลบ">ลบ</button>
                              </>
                            )}
                            {isDirector && (
                              <>
                                <button onClick={() => handleStatus(p._id, "approved")} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="อนุมัติ"><Check size={16} /></button>
                                <button onClick={() => handleStatus(p._id, "rejected")} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors" title="ไม่อนุมัติ"><X size={16} /></button>
                              </>
                            )}
                          </div>
                        </td>`;
content = content.replace(rowActionsTarget, rowActionsReplace);

// Update title logic in add form
content = content.replace(
  '<h3 className="font-bold text-sm mb-4">เพิ่มข้อมูลแผนการสอน</h3>',
  '<h3 className="font-bold text-sm mb-4">{newPlan._id ? "แก้ไขข้อมูลแผนการสอน" : "เพิ่มข้อมูลแผนการสอน"}</h3>'
);

fs.writeFileSync(file, content);
console.log("Updated page.tsx with file upload and edit features.");
