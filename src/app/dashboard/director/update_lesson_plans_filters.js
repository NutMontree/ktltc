const fs = require('fs');

const file = 'd:\\ktltc\\src\\app\\dashboard\\director\\lesson-plans\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update states
content = content.replace(
  'const [newPlan, setNewPlan] = useState({ subject: "", title: "", fileUrl: "" });',
  'const [newPlan, setNewPlan] = useState({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });\n  const [filterSemester, setFilterSemester] = useState("");\n  const [filterYear, setFilterYear] = useState("");'
);
content = content.replace(
  'setNewPlan({ subject: "", title: "", fileUrl: "" });',
  'setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });'
);

// 2. Add filters and process filteredPlans
const filteredPlansInjection = `
  const filteredPlans = plans.filter((p: any) => {
    if (filterSemester && p.semester !== filterSemester) return false;
    if (filterYear && p.academicYear !== filterYear) return false;
    return true;
  });
`;
content = content.replace(
  'return (',
  filteredPlansInjection + '\n  return ('
);

// 3. Update the add form
const addFormTarget = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="text" placeholder="ชื่อวิชา" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.subject} onChange={e => setNewPlan({...newPlan, subject: e.target.value})} />`;
const addFormReplace = `<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.semester} onChange={e => setNewPlan({...newPlan, semester: e.target.value})}>
                    <option value="1">เทอม 1</option>
                    <option value="2">เทอม 2</option>
                    <option value="3">เทอม 3 (ฤดูร้อน)</option>
                  </select>
                  <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.academicYear} onChange={e => setNewPlan({...newPlan, academicYear: e.target.value})}>
                    <option value="2566">2566</option>
                    <option value="2567">2567</option>
                    <option value="2568">2568</option>
                  </select>
                  <input type="text" placeholder="ชื่อวิชา" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.subject} onChange={e => setNewPlan({...newPlan, subject: e.target.value})} />`;
content = content.replace(addFormTarget, addFormReplace);

// 4. Inject filter UI
const filterUiInjection = `
          <div className="flex gap-4 mb-6">
            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="">📌 ทุกเทอม</option>
              <option value="1">เทอม 1</option>
              <option value="2">เทอม 2</option>
              <option value="3">เทอม 3</option>
            </select>
            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">📅 ทุกปีการศึกษา</option>
              <option value="2566">2566</option>
              <option value="2567">2567</option>
              <option value="2568">2568</option>
            </select>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">`;
content = content.replace(
  '<div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">',
  filterUiInjection
);

// 5. Update table headers
const tableHeaderTarget = `<th className="px-4 py-3">วิชา</th>`;
const tableHeaderReplace = `<th className="px-4 py-3">เทอม/ปี</th>\n                    <th className="px-4 py-3">วิชา</th>`;
content = content.replace(tableHeaderTarget, tableHeaderReplace);

// Update table colSpan
content = content.replace(/colSpan=\{isDirector \? 5 : 4\}/g, 'colSpan={isDirector ? 6 : 5}');

// Update map plans to filteredPlans
content = content.replace('plans.map((p: any) => (', 'filteredPlans.map((p: any) => (');

// Add semester/year to row
const rowTarget = `<td className="px-4 py-4 text-sm">{p.subject}</td>`;
const rowReplace = `<td className="px-4 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.semester}/{p.academicYear}</td>\n                        <td className="px-4 py-4 text-sm">{p.subject}</td>`;
content = content.replace(rowTarget, rowReplace);

fs.writeFileSync(file, content);
console.log("Updated lesson plans filters successfully.");
