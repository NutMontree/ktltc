"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const InternalStep5Form = ({ projectId, initialData = {} }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    orderNumber: initialData.orderNumber || "",
    subject: initialData.subject || "แต่งตั้งคณะกรรมการดำเนินงาน",
    projectName: initialData.projectName || "",
    rationale: initialData.rationale || "",
    committeeGroups:
      initialData.committeeGroups && initialData.committeeGroups.length > 0
        ? initialData.committeeGroups.map((g) => ({
            groupName: g.groupName || "",
            subGroups:
              g.subGroups && g.subGroups.length > 0
                ? g.subGroups.map((s) => ({
                    subGroupName: s.subGroupName || "",
                    members:
                      s.members && s.members.length > 0
                        ? s.members.map((m) => ({
                            name: m.name || "",
                            position: m.position || "",
                            duty: m.duty || "",
                          }))
                        : [],
                  }))
                : [],
            members:
              g.members && g.members.length > 0
                ? g.members.map((m) => ({
                    name: m.name || "",
                    position: m.position || "",
                    duty: m.duty || "",
                  }))
                : [],
          }))
        : [],
    signerName: initialData.signerName || "",
    signerPosition: initialData.signerPosition || "",
    orderDate: initialData.orderDate || "",
    footerText: initialData.footerText || "“เรียนดี มีคุณธรรม”",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Group Handlers
  const handleGroupChange = (groupIndex, field, value) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex][field] = value;
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const addGroup = () => {
    setFormData((prev) => ({
      ...prev,
      committeeGroups: [
        ...prev.committeeGroups,
        { groupName: `คณะกรรมการฝ่าย...`, subGroups: [], members: [] },
      ],
    }));
  };

  const removeGroup = (groupIndex) => {
    const updatedGroups = formData.committeeGroups.filter((_, idx) => idx !== groupIndex);
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  // SubGroup Handlers
  const handleSubGroupChange = (groupIndex, subGroupIndex, field, value) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].subGroups[subGroupIndex][field] = value;
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const addSubGroup = (groupIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    if (!updatedGroups[groupIndex].subGroups) {
      updatedGroups[groupIndex].subGroups = [];
    }
    updatedGroups[groupIndex].subGroups.push({
      subGroupName: `งาน...`,
      members: [],
    });
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const removeSubGroup = (groupIndex, subGroupIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].subGroups = updatedGroups[groupIndex].subGroups.filter(
      (_, idx) => idx !== subGroupIndex,
    );
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  // Member Handlers
  const handleMemberChange = (groupIndex, memberIndex, field, value) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].members[memberIndex][field] = value;
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const addMember = (groupIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    if (!updatedGroups[groupIndex].members) {
      updatedGroups[groupIndex].members = [];
    }
    updatedGroups[groupIndex].members.push({ name: "", position: "", duty: "" });
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const removeMember = (groupIndex, memberIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].members = updatedGroups[groupIndex].members.filter(
      (_, idx) => idx !== memberIndex,
    );
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  // SubGroup Member Handlers
  const handleSubMemberChange = (groupIndex, subGroupIndex, memberIndex, field, value) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].subGroups[subGroupIndex].members[memberIndex][field] = value;
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const addSubMember = (groupIndex, subGroupIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    if (!updatedGroups[groupIndex].subGroups[subGroupIndex].members) {
      updatedGroups[groupIndex].subGroups[subGroupIndex].members = [];
    }
    updatedGroups[groupIndex].subGroups[subGroupIndex].members.push({
      name: "",
      position: "",
      duty: "",
    });
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const removeSubMember = (groupIndex, subGroupIndex, memberIndex) => {
    const updatedGroups = [...formData.committeeGroups];
    updatedGroups[groupIndex].subGroups[subGroupIndex].members = updatedGroups[
      groupIndex
    ].subGroups[subGroupIndex].members.filter((_, idx) => idx !== memberIndex);
    setFormData((prev) => ({ ...prev, committeeGroups: updatedGroups }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/InternalPdcas/${projectId}/step5`, {
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

    const toThaiDigits = (str) => {
      if (!str) return "";
      return str.toString().replace(/[0-9]/g, (digit) => "๐๑๒๓๔๕๖๗๘๙"[digit]);
    };

    const clean = (text) => {
      if (!text) return "";
      return toThaiDigits(text.trim());
    };

    const groupsHtml = formData.committeeGroups
      .map((group) => {
        if (group.subGroups && group.subGroups.length > 0) {
          const subGroupsHtml = group.subGroups
            .map((subGroup) => {
              const membersHtml = subGroup.members
                .map(
                  (m) => `
            <div class="member-row">
              <span class="member-name">${clean(m.name)}</span>
              <span class="member-pos">${clean(m.position)}</span>
              <span class="member-duty">${clean(m.duty)}</span>
            </div>
          `,
                )
                .join("");

              return `
            <div class="subgroup-block">
              <div class="subgroup-title">${clean(subGroup.subGroupName)}</div>
              ${membersHtml}
            </div>
          `;
            })
            .join("");

          return `
          <div class="group-block">
            <div class="group-title">${clean(group.groupName)}</div>
            ${subGroupsHtml}
          </div>
        `;
        } else {
          const membersHtml = group.members
            .map(
              (m) => `
          <div class="member-row">
            <span class="member-name">${clean(m.name)}</span>
            <span class="member-pos">${clean(m.position)}</span>
            <span class="member-duty">${clean(m.duty)}</span>
          </div>
        `,
            )
            .join("");

          return `
          <div class="group-block">
            <div class="group-title">${clean(group.groupName)}</div>
            ${membersHtml}
          </div>
        `;
        }
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>คำสั่งแต่งตั้งคณะกรรมการดำเนินงาน - ${formData.projectName}</title>
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
              line-height: 1.15; 
              margin: 0;
              padding-top: 2.5cm; padding-bottom: 2.5cm;
              padding-left: 3cm; padding-right: 2cm;
              color: black;
              position: relative;
              box-sizing: border-box;
            }
            .garuda { width: 1.5cm; height: auto; display: block; margin: 0 auto 10px auto; }
            .order-title { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 5px; }
            .order-subject { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
            
            .rationale { text-indent: 2.5cm; text-align: justify; margin-bottom: 15px; }
            
            .group-block { margin-top: 15px; margin-bottom: 15px; }
            .group-title { font-weight: bold; text-indent: 1cm; margin-bottom: 5px; }

            .subgroup-block { margin-top: 10px; margin-bottom: 10px; }
            .subgroup-title { font-weight: bold; text-indent: 1.8cm; margin-bottom: 5px; }
            
            .member-row { display: flex; align-items: baseline; margin-left: 2.5cm; margin-bottom: 4px; }
            .member-name { font-size: 16pt; width: 6.5cm; white-space: nowrap; }
            .member-pos { font-size: 16pt; width: 3.5cm; white-space: nowrap; padding-left: 10px; }
            .member-duty { font-size: 16pt; flex: 1; white-space: nowrap; padding-left: 10px; }

            .order-date-block { text-align: center; margin-top: 40px; margin-bottom: 40px; }
            
            .signature-block { width: 60%; margin-left: 40%; text-align: center; margin-top: 30px; }
            .sig-title { text-align: left; padding-left: 30px; margin-bottom: 40px; }

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
          </style>
        </head>
        <body>
          <img src="/pdf/pdca/ตราครุฑ.webp" class="garuda" onerror="this.style.display='none'">
          <div class="order-title">คำสั่งวิทยาลัยเทคนิคกันทรลักษ์</div>
          <div class="order-title">ที่ ${clean(formData.orderNumber) || "............. / ............."}</div>
          <div class="order-subject">เรื่อง แต่งตั้งคณะกรรมการดำเนินงานโครงการ ${clean(formData.projectName)}</div>
          
          <div class="rationale">${clean(formData.rationale)}</div>
          
          ${groupsHtml}
          
          <div class="order-date-block">
            สั่ง ณ วันที่ ${clean(formData.orderDate)}
          </div>

          <div class="signature-block">
            <div style="margin-bottom: 5px;">( ${clean(formData.signerName)} )</div>
            <div>${clean(formData.signerPosition)}</div>
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
        <h2 className="text-2xl font-black text-primary">5. คำสั่งแต่งตั้งคณะกรรมการดำเนินงาน</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-primary px-8 py-2 font-bold text-white shadow-lg hover:bg-opacity-90"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-xl bg-success px-8 py-2 font-bold text-white shadow-lg hover:bg-opacity-90"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* 1. ข้อมูลทั่วไปของคำสั่ง */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            1. ข้อมูลคำสั่งทั่วไป
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">
                เลขที่คำสั่ง (ที่ เช่น ๑๒๓/๒๕๖๙)
              </label>
              <input
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
                placeholder="ระบุเลขที่คำสั่ง..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">ชื่อโครงการ</label>
              <input
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
                placeholder="ระบุชื่อโครงการ..."
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
              <label className="block text-sm font-bold text-gray-600">
                เนื้อหาความเป็นมา / พารากราฟเกริ่นนำ
              </label>
              <textarea
                name="rationale"
                value={formData.rationale}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-2xl border bg-gray-50 p-4 transition-all focus:bg-white"
                placeholder="กรอกพารากราฟเกริ่นนำความเป็นมาและอำนาจตามประกาศ..."
              />
            </div>
          </div>
        </section>

        {/* 2. รายชื่อคณะกรรมการ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black flex-1">
              2. คณะทำงานและคณะกรรมการฝ่ายต่างๆ
            </h3>
            <button
              onClick={addGroup}
              className="ml-4 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-opacity-90 transition-all"
            >
              + เพิ่มฝ่ายคณะกรรมการ
            </button>
          </div>

          <div className="space-y-8">
            {formData.committeeGroups.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="relative rounded-3xl border-2 border-dashed border-gray-200 p-6 space-y-4"
              >
                {/* Main Group Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400">
                      ชื่อฝ่าย / กลุ่มคณะทำงาน (เช่น ๑. ฝ่ายบริหารทรัพยากร)
                    </label>
                    <input
                      value={group.groupName}
                      onChange={(e) => handleGroupChange(groupIdx, "groupName", e.target.value)}
                      className="w-full rounded-xl border bg-white p-3 font-bold text-black focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeGroup(groupIdx)}
                    className="self-end rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger hover:text-white transition-all"
                    title="ลบฝ่ายหลักนี้"
                  >
                    ลบฝ่ายหลัก ✕
                  </button>
                </div>

                {/* Sub-groups and Members Section */}
                <div className="space-y-6 border-t pt-4">
                  {/* Action Buttons for Group */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => addSubGroup(groupIdx)}
                      className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      + เพิ่มฝ่ายย่อย (เช่น ๑.๑ งานอาคารสถานที่)
                    </button>
                    {(!group.subGroups || group.subGroups.length === 0) && (
                      <button
                        onClick={() => addMember(groupIdx)}
                        className="rounded-lg bg-success/15 px-4 py-2 text-xs font-black text-success hover:bg-success hover:text-white transition-all shadow-sm"
                      >
                        + เพิ่มรายชื่อในฝ่ายหลัก
                      </button>
                    )}
                  </div>

                  {/* Render Subgroups if they exist */}
                  {group.subGroups && group.subGroups.length > 0 && (
                    <div className="space-y-6 pl-6 border-l-2 border-primary/20">
                      {group.subGroups.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="relative rounded-2xl bg-gray-50/50 p-4 border border-gray-100 space-y-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400">
                                ชื่อฝ่ายย่อย / งาน (เช่น ๑.๑ งานอาคารสถานที่)
                              </label>
                              <input
                                value={sub.subGroupName}
                                onChange={(e) =>
                                  handleSubGroupChange(
                                    groupIdx,
                                    subIdx,
                                    "subGroupName",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-xl border bg-white p-2.5 font-bold text-sm text-black focus:ring-2 focus:ring-primary focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() => removeSubGroup(groupIdx, subIdx)}
                              className="self-end rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all"
                              title="ลบฝ่ายย่อยนี้"
                            >
                              ลบฝ่ายย่อย ✕
                            </button>
                          </div>

                          {/* Subgroup Members */}
                          <div className="space-y-3 pl-4 border-l border-dashed border-gray-200">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-gray-500">
                                รายชื่อกรรมการในฝ่ายย่อย:
                              </h5>
                              <button
                                onClick={() => addSubMember(groupIdx, subIdx)}
                                className="rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success hover:bg-success hover:text-white transition-all"
                              >
                                + เพิ่มรายชื่อ
                              </button>
                            </div>

                            <div className="space-y-3">
                              {sub.members &&
                                sub.members.map((m, mIdx) => (
                                  <div key={mIdx} className="flex gap-3 items-center">
                                    <input
                                      placeholder="ชื่อ-นามสกุล..."
                                      value={m.name}
                                      onChange={(e) =>
                                        handleSubMemberChange(
                                          groupIdx,
                                          subIdx,
                                          mIdx,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-2 rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <input
                                      placeholder="ตำแหน่งหลัก (เช่น ครูพิเศษสอน)..."
                                      value={m.position}
                                      onChange={(e) =>
                                        handleSubMemberChange(
                                          groupIdx,
                                          subIdx,
                                          mIdx,
                                          "position",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-[1.5] rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <input
                                      placeholder="หน้าที่/บทบาท (เช่น ผู้ช่วยงาน)..."
                                      value={m.duty}
                                      onChange={(e) =>
                                        handleSubMemberChange(
                                          groupIdx,
                                          subIdx,
                                          mIdx,
                                          "duty",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-2 rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <button
                                      onClick={() => removeSubMember(groupIdx, subIdx, mIdx)}
                                      className="rounded-lg p-2 text-danger hover:bg-danger/10 hover:scale-105 transition-all"
                                      title="ลบรายชื่อ"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Simple Members (Fallback or Primary members if no subgroups exist) */}
                  {(!group.subGroups || group.subGroups.length === 0) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-gray-500">รายชื่อกรรมการ:</h4>
                        <button
                          onClick={() => addMember(groupIdx)}
                          className="rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success hover:bg-success hover:text-white transition-all"
                        >
                          + เพิ่มรายชื่อ
                        </button>
                      </div>
                      <div className="space-y-3">
                        {group.members.map((m, mIdx) => (
                          <div key={mIdx} className="flex gap-3 items-center">
                            <input
                              placeholder="ชื่อ-นามสกุล..."
                              value={m.name}
                              onChange={(e) =>
                                handleMemberChange(groupIdx, mIdx, "name", e.target.value)
                              }
                              className="flex-2 rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                              placeholder="ตำแหน่งหลัก (เช่น ครูพิเศษสอน)..."
                              value={m.position}
                              onChange={(e) =>
                                handleMemberChange(groupIdx, mIdx, "position", e.target.value)
                              }
                              className="flex-[1.5] rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                              placeholder="หน้าที่/บทบาท (เช่น ผู้ช่วยงาน)..."
                              value={m.duty}
                              onChange={(e) =>
                                handleMemberChange(groupIdx, mIdx, "duty", e.target.value)
                              }
                              className="flex-2 rounded-xl border bg-white p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <button
                              onClick={() => removeMember(groupIdx, mIdx)}
                              className="rounded-lg p-2 text-danger hover:bg-danger/10 hover:scale-105 transition-all"
                              title="ลบรายชื่อ"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ส่วนลงท้ายและผู้สั่งการ */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            3. ส่วนลงนามและวันสั่งการ
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">
                สั่ง ณ วันที่ (เช่น ๒๐ พฤษภาคม พ.ศ. ๒๕๖๙)
              </label>
              <input
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600">
                ชื่อผู้ลงนาม / ผู้อำนวยการ
              </label>
              <input
                name="signerName"
                value={formData.signerName}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-600">ตำแหน่งผู้ลงนาม</label>
              <input
                name="signerPosition"
                value={formData.signerPosition}
                onChange={handleChange}
                className="w-full rounded-2xl border bg-gray-50 p-4"
              />
            </div>
          </div>
        </section>

        {/* 4. ส่วนข้อความท้ายกระดาษ */}
        <section className="space-y-4">
          <h3 className="rounded-xl border-l-8 border-primary bg-gray-100 p-3 text-lg font-black">
            4. ข้อความท้ายกระดาษ (Footer)
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
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล (Step 5)"}
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

export default InternalStep5Form;
