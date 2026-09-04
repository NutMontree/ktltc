"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface Group {
  label: string;
  options: Option[];
}

export default function DepartmentManagerModal({ 
  isOpen, 
  onClose, 
  onSaved 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSaved: (newGroups: Group[]) => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      toast.error("ดึงข้อมูลแผนกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("บันทึกข้อมูลสำเร็จ");
        onSaved(groups);
        onClose();
      } else {
        toast.error(data.error || "บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const addGroup = () => {
    setGroups([...groups, { label: "กลุ่มใหม่", options: [] }]);
  };

  const updateGroupLabel = (index: number, label: string) => {
    const newGroups = [...groups];
    newGroups[index].label = label;
    setGroups(newGroups);
  };

  const deleteGroup = (index: number) => {
    const newGroups = groups.filter((_, i) => i !== index);
    setGroups(newGroups);
  };

  const addOption = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options.push({ value: "รายการใหม่", label: "รายการใหม่" });
    setGroups(newGroups);
  };

  const updateOption = (groupIndex: number, optIndex: number, val: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options[optIndex].value = val;
    newGroups[groupIndex].options[optIndex].label = val;
    setGroups(newGroups);
  };

  const deleteOption = (groupIndex: number, optIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optIndex);
    setGroups(newGroups);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100">
            ตั้งค่าฝ่ายงานและแผนกวิชา
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
          ) : (
            <>
              {groups.map((group, gIdx) => (
                <div key={gIdx} className="border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-3 mb-4">
                    <input 
                      value={group.label}
                      onChange={(e) => updateGroupLabel(gIdx, e.target.value)}
                      className="flex-1 font-black text-lg bg-white dark:bg-zinc-950 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => deleteGroup(gIdx)} className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg cursor-pointer transition-colors" title="ลบกลุ่มนี้">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                    {group.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-zinc-300 dark:bg-zinc-600"></div>
                        <input 
                          value={opt.value}
                          onChange={(e) => updateOption(gIdx, oIdx, e.target.value)}
                          className="flex-1 text-sm bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={() => deleteOption(gIdx, oIdx)} className="p-1.5 text-zinc-400 hover:text-rose-500 cursor-pointer">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-0.5 bg-transparent"></div>
                      <button onClick={() => addOption(gIdx)} className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer">
                        <Plus size={14} /> เพิ่มรายการ
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addGroup} className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 font-bold flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/30">
                <Plus size={24} />
                เพิ่มกลุ่มฝ่ายงานใหม่
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/80 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold rounded-xl transition-colors cursor-pointer text-sm">
            ยกเลิก
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
}
