const fs = require("fs");

const file = "d:\\ktltc\\src\\app\\dashboard\\director\\lesson-plans\\page.tsx";
let content = fs.readFileSync(file, "utf8");

// 1. Update handleStatus function
const handleStatusTarget = `  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/director/lesson-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status })
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };`;

const handleStatusReplace = `  const handleStatus = async (id: string, status: string) => {
    let feedback = "";
    if (status === "rejected" || status === "approved") {
      const reason = window.prompt(\`ระบุหมายเหตุ/เหตุผลที่\${status === "rejected" ? "ไม่อนุมัติ" : "อนุมัติ"} (ถ้ามี):\`);
      if (reason === null) return; // User clicked cancel
      feedback = reason;
    }

    try {
      await fetch("/api/director/lesson-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status, feedback })
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };`;

content = content.replace(handleStatusTarget, handleStatusReplace);

// 2. Update status text and add feedback
const statusTarget = `                        <td className="px-4 py-4 text-center">
                          <span className={\`px-2 py-1 text-[10px] font-bold uppercase rounded-lg \${p.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : p.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}\`}>
                            {p.status}
                          </span>
                        </td>`;

const statusReplace = `                        <td className="px-4 py-4 text-center">
                          <span className={\`px-2 py-1 text-[10px] font-bold rounded-lg \${p.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : p.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}\`}>
                            {p.status === 'approved' ? 'อนุมัติแล้ว' : p.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                          </span>
                          {p.feedback && (
                            <p className="text-[10px] text-zinc-500 mt-2 text-left bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg break-word">
                              <span className="font-bold">หมายเหตุ:</span> {p.feedback}
                            </p>
                          )}
                        </td>`;

content = content.replace(statusTarget, statusReplace);

fs.writeFileSync(file, content);
console.log("Updated lesson-plans/page.tsx successfully.");
