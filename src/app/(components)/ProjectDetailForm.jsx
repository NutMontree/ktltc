"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MONTHS_TH = [
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
];

const STRATEGIC_DATA = [
  {
    id: "s1",
    label: "ยุทธศาสตร์ที่ ๑: ผู้เรียนและผู้สำเร็จการศึกษา",
    strategies: [
      {
        id: "s1_1",
        label: "กลยุทธ์ที่ ๑.๑ กลยุทธ์การจัดการความรู้",
        plans: [
          "๑.๑.๑ แผนงานส่งเสริมการประเมินมาตรฐานวิชาชีพ",
          "๑.๑.๒ แผนงานส่งเสริมมีคุณวุฒิวิชาชีพ มาตรฐานอาชีพ หรือมาตรฐานฝีมือแรงงาน",
        ],
      },
      {
        id: "s1_2",
        label: "กลยุทธ์ที่ ๑.๒ กลยุทธ์พัฒนาคุณภาพด้านทักษะและการประยุกต์ใช้",
        plans: [
          "๑.๒.๑ แผนงานส่งเสริมและสนับสนุนการแข่งขันชักษะวิชาชีพ",
          "๑.๒.๒ แผนงานส่งเสริมสมรรถนะในการประกอบการ หรือประกอบอาชีพอิสระ",
          "๑.๒.๓ แผนงานสนับสนุนวัสดุฝึกแผนกวิชา",
        ],
      },
      {
        id: "s1_3",
        label: "กลยุทธ์ที่ ๑.๓ กลยุทธ์ส่งเสริมคุณธรรม จริยธรรมและคุณลักษณะที่พึงประสงค์",
        plans: [
          "๑.๓.๑ แผนงานการดูแล และแนะแนวการศึกษา",
          "๑.๓.๒ แผนงานส่งเสริมคุณลักษณะที่พึงประสงค์",
          "๑.๓.๓ แผนงานหนุนเสริมการมีงานทำ และศึกษาต่อของผู้สำเร็จการศึกษา",
        ],
      },
    ],
  },
  {
    id: "s2",
    label: "ยุทธศาสตร์ที่ ๒: การจัดการอาชีวศึกษา",
    strategies: [
      {
        id: "s2_1",
        label: "กลยุทธ์ที่ ๒.๑ กลยุทธ์ด้านการพัฒนาหลักสูตรอาชีวศึกษา",
        plans: [
          "๒.๑.๑ แผนงานพัฒนาหลักสูตรฐานสมรรถนะอย่างเป็นระบบ",
          "๒.๑.๒ แผนงานการปรับปรุงพัฒนารายวิชาเดิม สาขาวิชาละ ๑ วิชา/๑ สถานประกอบการ",
        ],
      },
      {
        id: "s2_2",
        label: "กลยุทธ์ที่ ๒.๒ กลยุทธ์ด้านการจัดการเรียนการสอนอาชีวศึกษา",
        plans: [
          "๒.๒.๑ แผนงานส่งเสริม สนับสนุน และนิเทศติดตามการจัดการเรียนการสอน",
          "๒.๒.๒ แผนงานส่งเสริมการจัดทำแผนการจัดการเรียนรู้ฐานสมรรถนะที่เน้นผู้เรียนเป็นสำคัญ และนำไปใช้ในการจัดการเรียนการสอน",
          "๒.๒.๓ แผนงานการส่งเสริมและสนับสนุนการจัดทำสื่อการจัดการเรียนการสอน แบบ Active Learning หรือ PjBL (๑ ครู ๑ วิชา)",
          "๒.๒.๔ แผนงานส่งเสริมและสนับสนุนการบริหารจัดการชั้นเรียนห้องเรียนต้นแบบ",
          "๒.๒.๕ แผนงานส่งเสริมพัฒนาครูผู้สอน และพัฒนาวิชาชีพ",
          "๒.๒.๖ แผนงานพัฒนาระบบอินเตอร์เน็ตความเร็วสูงเพื่อการจัดการเรียนการสอน",
        ],
      },
      {
        id: "s2_3",
        label: "กลยุทธ์ที่ ๒.๓ กลยุทธ์ด้านการบริหารจัดการ",
        plans: [
          "๒.๓.๑ แผนงานส่งเสริมและสนับสนุนการบริหารสถานศึกษาแบบมีส่วนร่วม",
          "๒.๓.๒ แผนงานส่งเสริมและสนับสนุนการบริหารจัดการระบบข้อมูลสารสนเทศเพื่อการบริหาร",
          "๒.๓.๓ แผนงานสนับสนุน ปรับปรุงและพัฒนา อาคารสถานที่ ห้องเรียนห้องปฏิบัติการ โรงฝึกงาน",
          "๒.๓.๔ แผนงานปรับปรุงและพัฒนาระบบสาธารณูปโภคพื้นฐาน",
          "๒.๓.๕ แผนงานพัฒนาและสร้างเสริมแหล่งเรียนรู้และศูนย์วิทยบริการ",
        ],
      },
      {
        id: "s2_4",
        label: "กลยุทธ์ที่ ๒.๔ กลยุทธ์ด้านการนำนโยบายสู่การปฏิบัติ",
        plans: [
          "๒.๔.๑ แผนงานส่งเสริม และยกระดับการจัดการอาชีวศึกษาและระบบทวิภาคี",
          "๒.๔.๒ แผนงานสร้างห้องเรียนอาชีพใน สพฐ.",
          "๒.๔.๓ แผนงานพัฒนาสถานศึกษาเป็น Excellence Center",
        ],
      },
    ],
  },
  {
    id: "s3",
    label: "ยุทธศาสตร์ที่ ๓: การสร้างสังคมแห่งการเรียนรู้",
    strategies: [
      {
        id: "s3_1",
        label: "กลยุทธ์ที่ ๓.๑ กลยุทธ์ด้านความร่วมมือในการสร้างสังคมแห่งการเรียนรู้",
        plans: [
          "๓.๑.๑ แผนงานสร้างสังคมแห่งการเรียนรู้และชุมชนแห่งการเรียนรูวิชาชีพ",
          "๓.๑.๒ แผนงานสนับสนุนการยกระดับทรัพยากร ๔M เพื่อจัดการเรียนการสอน",
          "๓.๑.๓ แผนงานส่งเสริม และสนับสนุนการบริการวิชาชีพสู่ชุมชนและจิตอาสา",
        ],
      },
      {
        id: "s3_2",
        label: "กลยุทธ์ที่ ๓.๒ กลยุทธ์ส่งเสริมพัฒนาวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ และงานวิจัย",
        plans: [
          "๓.๒.๑ แผนงานส่งเสริมและสนับสนุนการสร้างนวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ และงานวิจัย",
        ],
      },
    ],
  },
];

const DEFAULT_STEPS = [
  { activity: "ประชุมคณะกรรมการ (Plan)", months: [] },
  { activity: "ดำเนินโครงการและติดตาม (Do)", months: [] },
  { activity: "ติดตามประเมิน (Check)", months: [] },
  { activity: "สรุป/เสนอแนะ (Action)", months: [] },
];

const DEFAULT_BUDGET = [
  { item: "ค่าวัสดุ", amount: 0 },
  { item: "ค่าตอบแทน", amount: 0 },
  { item: "ค่าใช้สอย", amount: 0 },
];

const PROJECT_TYPES = [
  "โครงการตาม พรบ. งบประมาณ",
  "โครงการตามภาระงานปกติ",
  "โครงการตามนโยบาย สอศ.",
  "โครงการพิเศษ (ไม่ใช้งบประมาณ สอศ.)",
];

const ProjectDetailForm = ({ projectId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const formatData = (data) => {
    let steps = data.steps || [];
    if (steps.length === 0) {
      steps = JSON.parse(JSON.stringify(DEFAULT_STEPS));
    } else {
      while (steps.length < 4) {
        steps.push({ activity: "", months: [] });
      }
    }

    // Always ensure the 3 main items exist, merging amounts from DB if available
    const dbBudget = data.budget || [];
    const mergedBudget = DEFAULT_BUDGET.map((def) => {
      const found = dbBudget.find((b) => b.item === def.item);
      return found ? { ...def, amount: found.amount } : { ...def };
    });
    // Append any extra custom items beyond the 3 defaults
    const extraItems = dbBudget.filter((b) => !DEFAULT_BUDGET.some((def) => def.item === b.item));
    const budget = [...mergedBudget, ...extraItems];

    return {
      projectName: data.projectName || "",
      departmentName: data.departmentName || "",
      divisionName: data.divisionName || "",
      projectType: data.projectType || "",
      strategicAlignment: data.strategicAlignment || [],
      rationale: data.rationale || "",
      objectives: data.objectives && data.objectives.length > 0 ? data.objectives : [""],
      targets: {
        quantity: Array.isArray(data.targets?.quantity) ? data.targets.quantity : [""],
        quality: Array.isArray(data.targets?.quality) ? data.targets.quality : [""],
      },
      overallPeriod: data.overallPeriod || "",
      overallLocation: Array.isArray(data.overallLocation)
        ? data.overallLocation
        : [data.overallLocation || ""],
      steps: steps,
      budgetSources: data.budgetSources || {
        operating: { vocational: 0, highVocational: 0, shortCourse: 0 },
        subsidy: { detail: "", amount: 0 },
        other: { detail: "", amount: 0 },
        educationSupport: 0,
      },
      budget: budget,
      expectedOutcomes:
        data.expectedOutcomes && data.expectedOutcomes.length > 0 ? data.expectedOutcomes : [""],
      evaluationMethods:
        data.evaluationMethods && data.evaluationMethods.length > 0 ? data.evaluationMethods : [""],
      proposer: {
        name: data.proposer?.name || "นายสิริปัญญ์ เสริมสิริพิพัฒน์",
        position: data.proposer?.position || "หัวหน้างานศูนย์ดิจิทัลและสื่อสารองค์กร",
      },
      endorser: {
        name: data.endorser?.name || "นายสมศักดิ์ จันทนิตย์",
        position: data.endorser?.position || "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน",
      },
      approver: {
        name: data.approver?.name || "นางสาวทักษิณา ชมจันทร์",
        position: data.approver?.position || "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์",
      },
    };
  };

  const [formData, setFormData] = useState(formatData(initialData));

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(formatData(initialData));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStrategicChange = (label) => {
    setFormData((prev) => {
      const current = prev.strategicAlignment || [];
      const newList = current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label];
      return { ...prev, strategicAlignment: newList };
    });
  };

  const handleListItemChange = (key, index, value, targetKey = null) => {
    setFormData((prev) => {
      if (targetKey) {
        const newTarget = [...(prev.targets?.[targetKey] || [])];
        newTarget[index] = value;
        return {
          ...prev,
          targets: { ...prev.targets, [targetKey]: newTarget },
        };
      } else {
        const newList = [...(prev[key] || [])];
        newList[index] = value;
        return { ...prev, [key]: newList };
      }
    });
  };

  const addListItem = (key, targetKey = null) => {
    setFormData((prev) => {
      if (targetKey) {
        return {
          ...prev,
          targets: {
            ...prev.targets,
            [targetKey]: [...(prev.targets?.[targetKey] || []), ""],
          },
        };
      } else {
        return { ...prev, [key]: [...(prev[key] || []), ""] };
      }
    });
  };

  const removeListItem = (key, index, targetKey = null) => {
    setFormData((prev) => {
      if (targetKey) {
        const newTarget = (prev.targets?.[targetKey] || []).filter((_, i) => i !== index);
        return {
          ...prev,
          targets: { ...prev.targets, [targetKey]: newTarget },
        };
      } else {
        const newList = (prev[key] || []).filter((_, i) => i !== index);
        return { ...prev, [key]: newList };
      }
    });
  };

  const addTableItem = (key, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), defaultItem],
    }));
  };

  const removeTableItem = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleTableItemChange = (key, index, field, value) => {
    setFormData((prev) => {
      const newList = [...(prev[key] || [])];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [key]: newList };
    });
  };

  const handleMonthToggle = (stepIdx, monthIdx) => {
    setFormData((prev) => {
      const newSteps = [...(prev.steps || [])];
      const currentMonths = newSteps[stepIdx].months || [];
      const newMonths = currentMonths.includes(monthIdx)
        ? currentMonths.filter((m) => m !== monthIdx)
        : [...currentMonths, monthIdx].sort((a, b) => a - b);
      newSteps[stepIdx] = { ...newSteps[stepIdx], months: newMonths };
      return { ...prev, steps: newSteps };
    });
  };

  const handleBudgetSourceChange = (category, field, value) => {
    setFormData((prev) => {
      if (field === null) {
        return {
          ...prev,
          budgetSources: { ...prev.budgetSources, [category]: value },
        };
      }
      return {
        ...prev,
        budgetSources: {
          ...prev.budgetSources,
          [category]: { ...prev.budgetSources[category], [field]: value },
        },
      };
    });
  };

  const handleSignerChange = (role, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/InternalPdcas/${projectId}/step3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "บันทึกข้อมูลโครงการสำเร็จ!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (e) => {
    if (e) e.preventDefault();
    const printWindow = window.open("", "_blank");

    const toThaiDigits = (str) => {
      if (!str && str !== 0) return "";
      return str.toString().replace(/[0-9]/g, (digit) => "๐๑๒๓๔๕๖๗๘๙"[digit]);
    };

    const renderNumberedList = (list, sectionNum) =>
      list
        .map(
          (item, i) =>
            `<div style="margin-left: 0.5cm; margin-bottom: 2px;">${toThaiDigits(sectionNum)}.${toThaiDigits(i + 1)}&nbsp; ${toThaiDigits(item)}</div>`,
        )
        .join("");

    const renderList = (list) =>
      list
        .map(
          (item) => `<li style="list-style: none; margin-bottom: 2px;">${toThaiDigits(item)}</li>`,
        )
        .join("");

    const renderCalendarSteps = (steps) =>
      steps
        .map((s, i) => {
          let monthCells = "";
          const selectedMonths = s.months || [];
          const minMonth = selectedMonths.length > 0 ? Math.min(...selectedMonths) : -1;
          const maxMonth = selectedMonths.length > 0 ? Math.max(...selectedMonths) : -1;

          for (let m = 0; m < 12; m++) {
            let content = "";
            let style =
              "text-align: center; border: 1px solid black; font-size: 10pt; width: 25px; height: 30px;";
            if (selectedMonths.includes(m)) {
              if (minMonth === maxMonth) content = "✓";
              else if (m === minMonth) content = "◄──";
              else if (m === maxMonth) content = "──►";
              else content = "───";
            }
            monthCells += `<td style="${style}">${content}</td>`;
          }
          return `<tr><td style="text-align: center; border: 1px solid black;">${toThaiDigits(i + 1)}</td><td style="padding: 2px 5px; border: 1px solid black;">${toThaiDigits(s.activity)}</td>${monthCells}</tr>`;
        })
        .join("");

    const renderBudgetTable = (budget) => {
      const total = budget.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      const cellStyle = "border: 1px solid black; padding: 2px 6px; font-size: 13pt;";
      let rows = budget
        .map(
          (b) => `
        <tr>
          <td style="${cellStyle}">${toThaiDigits(b.item)}</td>
          <td style="${cellStyle} text-align: center;"></td>
          <td style="${cellStyle} text-align: center;"></td>
          <td style="${cellStyle} text-align: right;">${b.amount > 0 ? toThaiDigits(b.amount.toLocaleString()) : "-"}</td>
          <td style="${cellStyle}"></td>
        </tr>
      `,
        )
        .join("");
      rows += `
        <tr style="font-weight: bold;">
          <td colspan="3" style="${cellStyle} text-align: center;">รวมทั้งสิ้น</td>
          <td style="${cellStyle} text-align: right;">${toThaiDigits(total.toLocaleString())}</td>
          <td style="${cellStyle}"></td>
        </tr>
      `;
      return rows;
    };

    const renderStrategyTable = (s, fontSize = "16pt") => {
      const colCount = s.strategies.length;
      const maxPlans = Math.max(...s.strategies.map((st) => st.plans.length));
      const isStrategySelected = formData.strategicAlignment.includes(s.label);

      let html = `<table class="strategy-table" style="font-size: ${fontSize}; ${fontSize === "14pt" ? "line-height: 1.0;" : ""}">`;

      html += `
        <tr>
          <td colspan="${colCount}" style="background: #fff; font-weight: bold;">
            <span class="box" style="${fontSize === "14pt" ? "width:12px;height:12px;" : ""}">${isStrategySelected ? "✓" : ""}</span> ${toThaiDigits(s.label)}
          </td>
        </tr>
      `;

      html += `<tr>`;
      s.strategies.forEach((st) => {
        const isSubSelected = formData.strategicAlignment.includes(st.label);
        html += `
          <td style="font-weight: bold; width: ${100 / colCount}%;">
            <span class="box" style="${fontSize === "14pt" ? "width:12px;height:12px;" : ""}">${isSubSelected ? "✓" : ""}</span> ${toThaiDigits(st.label)}
          </td>
        `;
      });
      html += `</tr>`;

      for (let i = 0; i < maxPlans; i++) {
        html += `<tr>`;
        s.strategies.forEach((st) => {
          const plan = st.plans[i];
          if (plan) {
            const isPlanSelected = formData.strategicAlignment.includes(plan);
            html += `
              <td>
                <span class="box" style="${fontSize === "14pt" ? "width:12px;height:12px;" : ""}">${isPlanSelected ? "✓" : ""}</span> ${toThaiDigits(plan)}
              </td>
            `;
          } else {
            html += `<td></td>`;
          }
        });
        html += `</tr>`;
      }

      html += `</table>`;
      return html;
    };

    const sources = formData.budgetSources;
    const ThaiYear = toThaiDigits(new Date().getFullYear() + 543);

    printWindow.document.write(`
      <html>
        <head>
          <title>วิทยาลัยเทคนิคกันทรลักษ์ - ${formData.projectName}</title>
          <style>
            @font-face { font-family: 'TH Sarabun New'; src: url('https://cdn.jsdelivr.net/gh/Sarabun-New/font@master/fonts/THSarabunNew.ttf') format('truetype'); }
            @page { size: A4; margin: 1.5cm 1cm 1cm 2cm; }
            body { font-family: 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.1; color: black; }
            .h1 { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 2px; }
            .section { margin-bottom: 8px; }
            .label { font-weight: bold; margin-right: 10px; font-size: 16pt; }
            .indent { text-indent: 1cm; text-align: justify; text-justify: inter-character; font-size: 16pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 2px; font-size: 16pt; }
            th { background-color: #fff; font-weight: bold; font-size: 16pt; border: 1px solid black; }
            td { border: 1px solid black; font-size: 16pt; }
            .page-container { position: relative; page-break-after: always; padding-top: 5px; }
            .page-number { text-align: center; font-size: 16pt; margin-bottom: 5px; }
            .header-info { text-align: center; margin-bottom: 15px; }
            ul { margin: 2px 0 2px 1cm; padding: 0; list-style: none; font-size: 16pt; }
            li { margin-bottom: 1px; position: relative; padding-left: 0; font-size: 16pt; }
            .checkbox-item { display: flex; align-items: center; gap: 8px; margin-left: 1.5cm; margin-bottom: 1px; }
            .box { width: 14px; height: 14px; border: 1.5px solid black; display: inline-flex; align-items: center; justify-content: center; font-size: 10pt; line-height: 1; margin-top: 1px; margin-right: 5px; }
            .strategy-table { width: 100%; border-collapse: collapse; margin-top: 2px; page-break-inside: avoid; }
            .strategy-table td { border: 1px solid black; padding: 1px 4px; vertical-align: top; }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header-info">
              <div class="h1">วิทยาลัยเทคนิคกันทรลักษ์</div>
            </div>
            <div class="section">
              <span class="label">๑.&nbsp; ชื่อโครงการ:</span> 
              <div style="margin-top: 2px; margin-left: 1cm;">${toThaiDigits(formData.projectName)}</div>
              <span class="label">๒.&nbsp; ลักษณะโครงการ:</span>
              <div style="margin-top: 2px;">
                ${PROJECT_TYPES.map(
                  (type) => `
                  <div class="checkbox-item">
                    <span class="box">${formData.projectType === type ? "✓" : ""}</span>
                    <span>${toThaiDigits(type)}</span>
                  </div>
                `,
                ).join("")}
              </div>
            </div>
            <div class="section">
              <span class="label">๓.&nbsp; ความสอดคล้องกับยุทธศาสตร์/กลยุทธ์และแผนงาน วิทยาลัยเทคนิคกันทรลักษ์:</span>
              <div style="height: 1.2em;"></div>
              <div style="margin-top: 5px;">
                ${renderStrategyTable(STRATEGIC_DATA[0], "16pt")}
              </div>
            </div>
          </div>
          <div class="page-container">
            <div class="page-number">- ${toThaiDigits(2)} -</div>
            <div class="section" style="font-size: 14pt; margin-bottom: 0;">
              ${renderStrategyTable(STRATEGIC_DATA[1], "14pt")}
              <div style="margin-top: 5px;"></div>
              ${renderStrategyTable(STRATEGIC_DATA[2], "14pt")}
            </div>
          </div>
          <div class="page-container">
            <div class="page-number">- ${toThaiDigits(3)} -</div>
            <div class="section">
              <span class="label">๔.&nbsp; สภาพปัจจุบัน/หลักการและเหตุผล</span>
              <div class="indent" style="margin-top: 2px;">${toThaiDigits(formData.rationale)}</div>
            </div>
            <div class="section"><span class="label">๕.&nbsp; วัตถุประสงค์:</span><ul>${renderList(formData.objectives)}</ul></div>
            <div class="section">
              <span class="label">๖.&nbsp; เป้าหมาย และตัวชี้วัดความสำเร็จ</span>
              <div style="margin-top: 2px;"><b>เชิงปริมาณ:</b><ul>${renderList(formData.targets.quantity)}</ul><b>เชิงคุณภาพ:</b><ul>${renderList(formData.targets.quality)}</ul></div>
            </div>
            <div class="section">
              <span class="label">๗.&nbsp; ระยะเวลาและสถานที่ดำเนินการ:</span>
              <div style="margin-left: 1cm;">
                <div>๗.๑&nbsp; ระยะเวลาดำเนินการ: ${toThaiDigits(formData.overallPeriod)}</div>
                <div>๗.๒&nbsp; สถานที่ดำเนินการ: <ul>${renderList(formData.overallLocation)}</ul></div>
                <div style="margin-top: 5px; font-weight: bold;">๗.๓&nbsp; ขั้นตอนการดำเนินงาน:</div>
                <table>
                  <thead>
                    <tr>
                      <th rowspan="2" style="width: 30px;">ที่</th>
                      <th rowspan="2">ขั้นตอนการดำเนินการ</th>
                      <th colspan="12" style="text-align: center;">ระยะเวลาดำเนินการ (ปีงบประมาณ ${ThaiYear})</th>
                    </tr>
                    <tr>${MONTHS_TH.map((m) => `<th style="font-size: 11pt; text-align: center; width: 25px; border: 1px solid black;">${m}</th>`).join("")}</tr>
                  </thead>
                  <tbody>${renderCalendarSteps(formData.steps)}</tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="page-container" style="page-break-after: auto;">
            <div class="page-number" style="margin-bottom: 10px;">- ${toThaiDigits(4)} -</div>
            <div class="section">
              <span class="label" style="font-weight: bold;">๘.&nbsp; งบประมาณ/ทรัพยากร และแหล่งที่มา การดำเนินโครงการ</span>
              <div style="margin-top: 5px; margin-left: 1cm;">
                <!-- Row 1-3: Operating -->
                <div style="display: flex; align-items: baseline;">
                  <span style="width: 3.5cm; flex-shrink: 0;">ดำเนินงาน (ระบุ)</span>
                  <span style="width: 2.5cm; flex-shrink: 0;">ผลผลิต ปวช.</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; height: 1.1em;">${sources.operating.vocational > 0 ? toThaiDigits(sources.operating.vocational.toLocaleString()) : ""}</div>
                  <span style="margin-left: 5px; width: 1cm; text-align: right;">บาท</span>
                </div>
                <div style="display: flex; align-items: baseline;">
                  <span style="width: 3.5cm; flex-shrink: 0;"></span>
                  <span style="width: 2.5cm; flex-shrink: 0;">ผลผลิต ปวส.</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; height: 1.1em;">${sources.operating.highVocational > 0 ? toThaiDigits(sources.operating.highVocational.toLocaleString()) : ""}</div>
                  <span style="margin-left: 5px; width: 1cm; text-align: right;">บาท</span>
                </div>
                <div style="display: flex; align-items: baseline;">
                  <span style="width: 3.5cm; flex-shrink: 0;"></span>
                  <span style="width: 2.5cm; flex-shrink: 0;">ผลผลิต ระยะสั้น</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; height: 1.1em;">${sources.operating.shortCourse > 0 ? toThaiDigits(sources.operating.shortCourse.toLocaleString()) : ""}</div>
                  <span style="margin-left: 5px; width: 1cm; text-align: right;">บาท</span>
                </div>
                <!-- Row 4: Subsidy -->
                <div style="display: flex; align-items: baseline; margin-top: 2px;">
                  <span style="width: 3.5cm; flex-shrink: 0;">งบอุดหนุน (ระบุ)</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;">${toThaiDigits(sources.subsidy.detail)}</div>
                  <span style="width: 1.5cm; text-align: center; flex-shrink: 0;">จำนวน</span>
                  <div style="width: 3cm; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;">${sources.subsidy.amount > 0 ? toThaiDigits(sources.subsidy.amount.toLocaleString()) : ""}</div>
                  <span style="width: 1cm; text-align: right;">บาท</span>
                </div>
                <!-- Row 5: Other -->
                <div style="display: flex; align-items: baseline; margin-top: 2px;">
                  <span style="width: 3.5cm; flex-shrink: 0;">งบรายจ่ายอื่น(ระบุ)</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;">${toThaiDigits(sources.other.detail)}</div>
                  <span style="width: 1.5cm; text-align: center; flex-shrink: 0;">จำนวน</span>
                  <div style="width: 3cm; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;">${sources.other.amount > 0 ? toThaiDigits(sources.other.amount.toLocaleString()) : ""}</div>
                  <span style="width: 1cm; text-align: right;">บาท</span>
                </div>
                <!-- Row 6: Education Support -->
                <div style="display: flex; align-items: baseline; margin-top: 2px;">
                  <span style="width: 3.5cm; flex-shrink: 0;">บำรุงการศึกษา (บกศ.)</span>
                  <div style="flex: 1; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;"></div>
                  <span style="width: 1.5cm; text-align: center; flex-shrink: 0;">จำนวน</span>
                  <div style="width: 3cm; border-bottom: 1px dotted black; text-align: center; margin: 0 5px; height: 1.1em;">${sources.educationSupport > 0 ? toThaiDigits(sources.educationSupport.toLocaleString()) : ""}</div>
                  <span style="width: 1cm; text-align: right;">บาท</span>
                </div>
              </div>
            </div>

              <!-- Budget Item Table -->
              <table style="margin-top: 15px; width: 100%; border-collapse: collapse; font-size: 13pt;">
                <thead>
                  <tr>
                    <th style="border: 1px solid black; padding: 3px 6px; width: 35%;">รายการ</th>
                    <th style="border: 1px solid black; padding: 3px 6px; width: 15%;">จำนวน/หน่วย</th>
                    <th style="border: 1px solid black; padding: 3px 6px; width: 15%;">ราคา/หน่วย</th>
                    <th style="border: 1px solid black; padding: 3px 6px; width: 15%;">จำนวนเงิน</th>
                    <th style="border: 1px solid black; padding: 3px 6px; width: 20%;">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderBudgetTable(formData.budget)}
                </tbody>
              </table>
            </div>

            <div class="section" style="margin-top: 15px;"><span class="label">๙. ผลที่คาดว่าจะได้รับ:</span><br>${renderNumberedList(formData.expectedOutcomes, 9)}</div>
            <div class="section" style="margin-top: 10px;"><span class="label">๑๐. การติดตาม และการประเมินผลโครงการ:</span><br>${renderNumberedList(formData.evaluationMethods, 10)}</div>

            <!-- Ultra-Compact Signature Blocks -->
            <div style="height: 1.25em;"></div>
            <div style="margin-top: 20px; margin-left: 3cm; font-size: 16pt; line-height: 1.25; width: 16cm;">
              
              <!-- Proposer -->
              <div style="margin-bottom: 45px;">
                <div style="display: flex; align-items: baseline; justify-content: center;">
                  <span style="white-space: nowrap;">ลงชื่อ</span>
                  <div style="width: 6.5cm; display: flex; flex-direction: column; align-items: center; margin: 0;">
                    <div style="width: 100%; border-bottom: 1px dotted black; height: 14px; margin-bottom: 4px;"></div>
                    <div style="text-align: center; white-space: nowrap;">
                      (${toThaiDigits(formData.proposer.name)})<br>
                      ${toThaiDigits(formData.proposer.position)}
                    </div>
                  </div>
                  <span style="white-space: nowrap;">ผู้เสนอโครงการ</span>
                </div>
              </div>

              <!-- Endorser -->
              <div style="margin-bottom: 45px;">
                <div style="display: flex; align-items: baseline; justify-content: center;">
                  <span style="white-space: nowrap;">ลงชื่อ</span>
                  <div style="width: 6.5cm; display: flex; flex-direction: column; align-items: center; margin: 0;">
                    <div style="width: 100%; border-bottom: 1px dotted black; height: 14px; margin-bottom: 4px;"></div>
                    <div style="text-align: center; white-space: nowrap;">
                      (${toThaiDigits(formData.endorser.name)})<br>
                      ${toThaiDigits(formData.endorser.position)}
                    </div>
                  </div>
                  <span style="white-space: nowrap;">ผู้เห็นชอบโครงการ</span>
                </div>
              </div>

              <!-- Approver -->
              <div>
                <div style="display: flex; align-items: baseline; justify-content: center;">
                  <span style="white-space: nowrap;">ลงชื่อ</span>
                  <div style="width: 6.5cm; display: flex; flex-direction: column; align-items: center; margin: 0;">
                    <div style="width: 100%; border-bottom: 1px dotted black; height: 14px; margin-bottom: 4px;"></div>
                    <div style="text-align: center; white-space: nowrap;">
                      (${toThaiDigits(formData.approver.name)})<br>
                      ${toThaiDigits(formData.approver.position)}<br>
                      <div style="margin-top: 8px;">............../............../..............</div>
                    </div>
                  </div>
                  <span style="white-space: nowrap;">ผู้อนุมัติโครงการ</span>
                </div>
              </div>

            </div>
          </div>
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="rounded-3xl border border-stroke bg-white p-8 shadow-xl dark:bg-boxdark">
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <h2 className="text-2xl font-black text-primary">3. แบบฟอร์มโครงการ</h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-primary px-8 py-2 font-bold text-white shadow-lg hover:bg-opacity-90"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกโครงการ"}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="rounded-xl bg-success px-8 py-2 font-bold text-white shadow-lg hover:bg-opacity-90"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-10">
        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            1. ข้อมูลโครงการเบื้องต้น
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">
                ชื่อโครงการ (ดึงมาจากข้อมูลหลัก)
              </label>
              <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 font-bold text-primary">
                {formData.projectName || "ไม่พบชื่อโครงการ"}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">งาน</label>
                <div className="w-full rounded-2xl border bg-gray-100 p-4 font-bold text-gray-600">
                  {formData.departmentName || "-"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">ฝ่าย</label>
                <div className="w-full rounded-2xl border bg-gray-100 p-4 font-bold text-gray-600">
                  {formData.divisionName || "-"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            2. ลักษณะโครงการ
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROJECT_TYPES.map((type, idx) => (
              <label
                key={idx}
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type}
                  checked={formData.projectType === type}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary"
                />
                <span
                  className={`text-sm font-bold ${
                    formData.projectType === type ? "text-primary" : "text-gray-600"
                  }`}
                >
                  {type}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            3. ความสอดคล้องกับยุทธศาสตร์ วิทยาลัยเทคนิคกันทรลักษ์
          </h3>
          <div className="space-y-8">
            {STRATEGIC_DATA.map((s) => (
              <div key={s.id} className="rounded-2xl border border-stroke p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-4 border-b pb-2">
                  <input
                    type="checkbox"
                    checked={formData.strategicAlignment.includes(s.label)}
                    onChange={() => handleStrategicChange(s.label)}
                    className="h-5 w-5 rounded border-gray-300 text-primary"
                  />
                  <h4 className="text-lg font-black text-primary">{s.label}</h4>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {s.strategies.map((st) => (
                    <div key={st.id} className="space-y-3 border-l-2 border-gray-100 pl-4">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.strategicAlignment.includes(st.label)}
                          onChange={() => handleStrategicChange(st.label)}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <span className="font-bold text-gray-700">{st.label}</span>
                      </label>
                      <div className="grid grid-cols-1 gap-2 pl-4">
                        {st.plans.map((p, pIdx) => (
                          <label
                            key={pIdx}
                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-all hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.strategicAlignment.includes(p)}
                              onChange={() => handleStrategicChange(p)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span
                              className={`text-sm ${
                                formData.strategicAlignment.includes(p)
                                  ? "font-bold text-primary"
                                  : "text-gray-600"
                              }`}
                            >
                              {p}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            4. สภาพปัจจุบัน/หลักการและเหตุผล
          </h3>
          <textarea
            name="rationale"
            value={formData.rationale}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-2xl border bg-gray-50 p-4"
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border-l-8 border-primary bg-gray-100 p-3">
            <h3 className="text-lg font-black">5. วัตถุประสงค์</h3>
            <button
              type="button"
              onClick={() => addListItem("objectives")}
              className="rounded-lg bg-primary px-4 py-1 text-xs font-bold text-white shadow-sm"
            >
              + เพิ่มวัตถุประสงค์
            </button>
          </div>
          <div className="space-y-3">
            {formData.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={obj}
                  onChange={(e) => handleListItemChange("objectives", i, e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 p-3"
                  placeholder={`ข้อที่ ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeListItem("objectives", i)}
                  className="rounded-lg p-2 text-danger hover:bg-danger/10"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            6. เป้าหมาย และตัวชี้วัดความสำเร็จ
          </h3>
          <div className="space-y-4 rounded-2xl border border-dashed border-gray-200 p-6 shadow-inner">
            <div className="flex items-center justify-between border-b pb-2">
              <label className="font-black italic text-gray-500">6.1 เชิงปริมาณ</label>
              <button
                type="button"
                onClick={() => addListItem(null, "quantity")}
                className="text-xs font-bold text-primary hover:underline"
              >
                + เพิ่มรายการ
              </button>
            </div>
            <div className="space-y-2">
              {formData.targets.quantity.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => handleListItemChange(null, i, e.target.value, "quantity")}
                    className="w-full rounded-xl border bg-white p-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(null, i, "quantity")}
                    className="p-2 text-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-dashed border-gray-200 p-6 shadow-inner">
            <div className="flex items-center justify-between border-b pb-2">
              <label className="font-black italic text-gray-500">6.2 เชิงคุณภาพ</label>
              <button
                type="button"
                onClick={() => addListItem(null, "quality")}
                className="text-xs font-bold text-primary hover:underline"
              >
                + เพิ่มรายการ
              </button>
            </div>
            <div className="space-y-2">
              {formData.targets.quality.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => handleListItemChange(null, i, e.target.value, "quality")}
                    className="w-full rounded-xl border bg-white p-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(null, i, "quality")}
                    className="p-2 text-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            7. ระยะเวลาและสถานที่ดำเนินการ
          </h3>
          <div className="grid grid-cols-1 gap-6 pl-4">
            <div className="space-y-2">
              <label className="text-sm font-bold italic text-gray-600">
                7.1 ระยะเวลาดำเนินการ
              </label>
              <input
                name="overallPeriod"
                value={formData.overallPeriod}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold italic text-gray-600">
                  7.2 สถานที่ดำเนินการ
                </label>
                <button
                  type="button"
                  onClick={() => addListItem("overallLocation")}
                  className="rounded-lg bg-primary px-3 py-1 text-xs text-white"
                >
                  + เพิ่มสถานที่
                </button>
              </div>
              <div className="space-y-3">
                {formData.overallLocation.map((loc, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={loc}
                      onChange={(e) => handleListItemChange("overallLocation", i, e.target.value)}
                      className="w-full rounded-2xl border bg-gray-50 p-4"
                      placeholder={`สถานที่ที่ ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("overallLocation", i)}
                      className="rounded-lg p-2 text-danger hover:bg-danger/10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold italic text-gray-600">
                  7.3 ขั้นตอนการดำเนินงาน
                </label>
                <button
                  type="button"
                  onClick={() => addTableItem("steps", { activity: "", months: [] })}
                  className="rounded-lg bg-primary px-3 py-1 text-xs text-white"
                >
                  + เพิ่มขั้นตอน
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-stroke bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-xs" rowSpan={2}>
                        ที่
                      </th>
                      <th className="border p-2 text-xs" rowSpan={2}>
                        ขั้นตอนการดำเนินการ
                      </th>
                      <th className="border p-2 text-xs" colSpan={12}>
                        ระยะเวลาดำเนินการ (ปฏิทิน 12 เดือน)
                      </th>
                      <th className="border p-2" rowSpan={2}></th>
                    </tr>
                    <tr>
                      {MONTHS_TH.map((m, i) => (
                        <th key={i} className="w-8 border p-1 text-center text-[10px]">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.steps.map((step, sIdx) => (
                      <tr key={sIdx} className="hover:bg-gray-50">
                        <td className="border p-2 text-center text-xs font-bold">{sIdx + 1}</td>
                        <td className="border p-1">
                          <input
                            value={step.activity}
                            onChange={(e) =>
                              handleTableItemChange("steps", sIdx, "activity", e.target.value)
                            }
                            className={`w-full border-none bg-transparent p-1 text-xs focus:ring-0 ${
                              sIdx < 4 ? "font-bold text-primary" : ""
                            }`}
                            readOnly={sIdx < 4}
                            placeholder={sIdx < 4 ? DEFAULT_STEPS[sIdx].activity : "ระบุกิจกรรม..."}
                          />
                        </td>
                        {MONTHS_TH.map((_, mIdx) => (
                          <td
                            key={mIdx}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMonthToggle(sIdx, mIdx);
                            }}
                            className={`cursor-pointer border p-0 transition-all hover:bg-primary/20 ${
                              step.months?.includes(mIdx) ? "bg-primary/10" : "bg-white"
                            }`}
                            title={`เลือกเดือน ${MONTHS_TH[mIdx]}`}
                            style={{ minWidth: "40px", height: "45px" }}
                          >
                            <div className="flex h-full w-full items-center justify-center px-1">
                              {step.months?.includes(mIdx) ? (
                                <div className="h-6 w-full rounded-md bg-primary shadow-md"></div>
                              ) : (
                                <div className="h-6 w-full rounded-md border border-dashed border-gray-200 hover:border-primary/50"></div>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className="border p-1 text-center">
                          {sIdx >= 4 && (
                            <button
                              type="button"
                              onClick={() => removeTableItem("steps", sIdx)}
                              className="px-2 font-bold text-danger"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            8. งบประมาณ/ทรัพยากร และแหล่งที่มา การดำเนินโครงการ
          </h3>
          <div className="grid grid-cols-1 gap-6 pl-4">
            <div className="space-y-4 rounded-2xl border p-6 shadow-sm">
              <p className="font-bold text-primary underline">8.1 งบดำเนินงาน (ระบุ)</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ผลผลิต ปวช.</label>
                  <input
                    type="number"
                    value={formData.budgetSources.operating.vocational}
                    onChange={(e) =>
                      handleBudgetSourceChange("operating", "vocational", Number(e.target.value))
                    }
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ผลผลิต ปวส.</label>
                  <input
                    type="number"
                    value={formData.budgetSources.operating.highVocational}
                    onChange={(e) =>
                      handleBudgetSourceChange(
                        "operating",
                        "highVocational",
                        Number(e.target.value),
                      )
                    }
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ผลผลิต ระยะสั้น</label>
                  <input
                    type="number"
                    value={formData.budgetSources.operating.shortCourse}
                    onChange={(e) =>
                      handleBudgetSourceChange("operating", "shortCourse", Number(e.target.value))
                    }
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 rounded-2xl border p-6 shadow-sm">
                <p className="font-bold text-primary underline">8.2 งบอุดหนุน (ระบุ)</p>
                <input
                  placeholder="ระบุรายการ..."
                  value={formData.budgetSources.subsidy.detail}
                  onChange={(e) => handleBudgetSourceChange("subsidy", "detail", e.target.value)}
                  className="mb-2 w-full rounded-xl border bg-gray-50 p-3"
                />
                <div className="flex items-center gap-2">
                  <span>จำนวน</span>
                  <input
                    type="number"
                    value={formData.budgetSources.subsidy.amount}
                    onChange={(e) =>
                      handleBudgetSourceChange("subsidy", "amount", Number(e.target.value))
                    }
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />
                  <span>บาท</span>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border p-6 shadow-sm">
                <p className="font-bold text-primary underline">8.3 งบรายจ่ายอื่น (ระบุ)</p>
                <input
                  placeholder="ระบุรายการ..."
                  value={formData.budgetSources.other.detail}
                  onChange={(e) => handleBudgetSourceChange("other", "detail", e.target.value)}
                  className="mb-2 w-full rounded-xl border bg-gray-50 p-3"
                />
                <div className="flex items-center gap-2">
                  <span>จำนวน</span>
                  <input
                    type="number"
                    value={formData.budgetSources.other.amount}
                    onChange={(e) =>
                      handleBudgetSourceChange("other", "amount", Number(e.target.value))
                    }
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />
                  <span>บาท</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border bg-primary/5 p-6 shadow-sm">
              <p className="font-bold text-primary underline">8.4 บำรุงการศึกษา (บกศ.)</p>
              <div className="flex max-w-xs items-center gap-2">
                <span>จำนวน</span>
                <input
                  type="number"
                  value={formData.budgetSources.educationSupport}
                  onChange={(e) =>
                    handleBudgetSourceChange("educationSupport", null, Number(e.target.value))
                  }
                  className="w-full rounded-xl border bg-white p-3 text-center font-bold text-primary"
                />
                <span>บาท</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold italic text-gray-600 underline">
                รายละเอียดรายจ่ายโครงการ (ตารางจะปรับอัตโนมัติใน PDF)
              </p>
              <button
                type="button"
                onClick={() => addTableItem("budget", { item: "", amount: 0 })}
                className="rounded-lg bg-primary px-4 py-1 text-xs font-bold text-white shadow-sm"
              >
                + เพิ่มรายการรายจ่าย
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-stroke shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 p-4 font-bold text-gray-600">ที่</th>
                    <th className="p-4 font-bold text-gray-600">รายการรายจ่าย</th>
                    <th className="w-48 p-4 font-bold text-gray-600">จำนวนเงิน (บาท)</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke">
                  {formData.budget.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4 text-center font-bold text-gray-400">{i + 1}</td>
                      <td className="p-2">
                        <input
                          value={b.item}
                          onChange={(e) =>
                            handleTableItemChange("budget", i, "item", e.target.value)
                          }
                          className={`w-full border-none bg-transparent p-2 focus:ring-0 ${
                            i < 3 ? "font-bold text-primary" : ""
                          }`}
                          placeholder={i < 3 ? DEFAULT_BUDGET[i].item : "ระบุรายการ..."}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={b.amount}
                          onChange={(e) =>
                            handleTableItemChange("budget", i, "amount", e.target.value)
                          }
                          className="w-full rounded-lg border bg-white p-2 text-right focus:ring-primary"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {i >= 3 && (
                          <button
                            type="button"
                            onClick={() => removeTableItem("budget", i)}
                            className="text-xl text-danger"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border-l-8 border-primary bg-gray-100 p-3">
            <h3 className="text-lg font-black">9. ผลที่คาดว่าจะได้รับ</h3>
            <button
              type="button"
              onClick={() => addListItem("expectedOutcomes")}
              className="rounded-lg bg-primary px-4 py-1 text-xs font-bold text-white shadow-sm"
            >
              + เพิ่มผลที่คาดได้รับ
            </button>
          </div>
          <div className="space-y-3">
            {formData.expectedOutcomes.map((outcome, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={outcome}
                  onChange={(e) => handleListItemChange("expectedOutcomes", i, e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 p-3"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("expectedOutcomes", i)}
                  className="rounded-lg p-2 text-danger hover:bg-danger/10"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border-l-8 border-primary bg-gray-100 p-3">
            <h3 className="text-lg font-black">10. การติดตาม และการประเมินผลโครงการ</h3>
            <button
              type="button"
              onClick={() => addListItem("evaluationMethods")}
              className="rounded-lg bg-primary px-4 py-1 text-xs font-bold text-white shadow-sm"
            >
              + เพิ่มการประเมินผล
            </button>
          </div>
          <div className="space-y-3">
            {formData.evaluationMethods.map((method, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={method}
                  onChange={(e) => handleListItemChange("evaluationMethods", i, e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 p-3"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("evaluationMethods", i)}
                  className="rounded-lg p-2 text-danger hover:bg-danger/10"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            รายชื่อผู้ลงนามโครงการ
          </h3>
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <p className="font-black text-primary underline">1. ผู้เสนอโครงการ</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ชื่อ-นามสกุล</label>
                  <input
                    value={formData.proposer.name}
                    onChange={(e) => handleSignerChange("proposer", "name", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ตำแหน่ง</label>
                  <input
                    value={formData.proposer.position}
                    onChange={(e) => handleSignerChange("proposer", "position", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <p className="font-black text-primary underline">2. ผู้เห็นชอบโครงการ</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ชื่อ-นามสกุล</label>
                  <input
                    value={formData.endorser.name}
                    onChange={(e) => handleSignerChange("endorser", "name", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ตำแหน่ง</label>
                  <input
                    value={formData.endorser.position}
                    onChange={(e) => handleSignerChange("endorser", "position", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <p className="font-black text-primary underline">3. ผู้อนุมัติโครงการ</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ชื่อ-นามสกุล</label>
                  <input
                    value={formData.approver.name}
                    onChange={(e) => handleSignerChange("approver", "name", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">ตำแหน่ง</label>
                  <input
                    value={formData.approver.position}
                    onChange={(e) => handleSignerChange("approver", "position", e.target.value)}
                    className="w-full rounded-xl border bg-white p-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 border-t pt-10 text-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full max-w-md rounded-2xl bg-primary py-4 text-xl font-bold text-white shadow-xl transition-all hover:bg-opacity-90 disabled:bg-gray-400"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกโครงการ (Step 3)"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-10 right-10 z-9999 animate-bounce rounded-2xl px-8 py-4 font-bold shadow-2xl ${
            message.type === "success" ? "bg-success text-white" : "bg-danger text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailForm;
