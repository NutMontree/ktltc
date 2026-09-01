"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, CheckCircle, Loader2, QrCode, Tv, Search, MapPin, ListChecks
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import TeacherScannerModal from "./TeacherScannerModal";
import TeacherQRGeneratorModal from "./TeacherQRGeneratorModal";
import { getAccurateLocation } from "@/lib/geolocation";

const DEPARTMENTS = [
  "ช่างยนต์",
  "ช่างกลโรงงาน",
  "ช่างเชื่อมโลหะ",
  "ช่างไฟฟ้ากำลัง",
  "ช่างอิเล็กทรอนิกส์",
  "ช่างก่อสร้าง",
  "เทคนิคพื้นฐาน",
  "การบัญชี",
  "การตลาด",
  "เทคโนโลยีธุรกิจดิจิทัล",
  "การโรงแรม",
  "การจัดการโลจิสติกส์และซัพพลายเชน",
  "การจัดการสำนักงานดิจิทัล",
  "ยานยนต์ไฟฟ้า",
  "สามัญสัมพันธ์"
];

export default function TeacherFlagpoleCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [department, setDepartment] = useState("");
  const [classGroups, setClassGroups] = useState<string[]>([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  
  const [teacherLocation, setTeacherLocation] = useState<{lat: number, lng: number} | null>(null);

  // Protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role?.toLowerCase();
      if (!["super_admin", "admin", "teacher", "director"].includes(role || "")) {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  // Fetch Location
  useEffect(() => {
    getAccurateLocation(5000).then((loc) => {
      setTeacherLocation({ lat: loc.lat, lng: loc.lng });
    }).catch(err => {
      console.error("GPS fetch error:", err);
    });
  }, []);

  // Fetch Class Groups when Department changes
  useEffect(() => {
    if (!department) {
      setClassGroups([]);
      setSelectedClassGroup("");
      setStudents([]);
      return;
    }

    const fetchClassGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await fetch(`/api/teacher/students?department=${encodeURIComponent(department)}`);
        const json = await res.json();
        if (json.success) {
          setClassGroups(json.classGroups || []);
          setSelectedClassGroup("");
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching class groups:", error);
        toast.error("ไม่สามารถโหลดข้อมูลกลุ่มเรียนได้");
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchClassGroups();
  }, [department]);

  // Fetch Students with Status when Class Group changes
  useEffect(() => {
    if (!department || !selectedClassGroup) {
      setStudents([]);
      return;
    }

    const fetchStudentsWithStatus = async () => {
      setLoadingStudents(true);
      try {
        // Here we could call a specific API, but for now we'll call the standard students API
        // and then we should merge with their check-in status for today.
        const res = await fetch(`/api/flagpole/students-status?department=${encodeURIComponent(department)}&classGroupId=${encodeURIComponent(selectedClassGroup)}`);
        const json = await res.json();
        if (json.success) {
          setStudents(json.students || []);
        } else {
          toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน");
        }
      } catch (error) {
        console.error("Error fetching students status:", error);
        toast.error("ไม่สามารถโหลดข้อมูลนักเรียนได้");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsWithStatus();
  }, [department, selectedClassGroup]);

  const handleManualCheckIn = async (userId: string, currentStatus: string) => {
    if (currentStatus === "Present" || currentStatus === "Late") {
      // Already checked in, for now we don't allow un-checking to prevent accidents
      // but you could add a prompt to confirm if they really want to uncheck
      toast.error("นักเรียนคนนี้เช็คชื่อไปแล้ว");
      return;
    }

    if (!teacherLocation) {
      toast.error("กำลังหาตำแหน่ง GPS หรือคุณไม่ได้เปิด GPS ไว้");
      return;
    }

    try {
      const res = await fetch("/api/flagpole/teacher-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          method: "manual_tick",
          lat: teacherLocation.lat,
          lng: teacherLocation.lng
        }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(`เช็คชื่อสำเร็จ: ${json.studentName || 'ไม่ทราบชื่อ'}`);
        // Update local state to reflect the change
        setStudents(prev => prev.map(s => {
          if (s.id === userId) {
            return { ...s, checkInStatus: json.status, checkInMethod: "Checked by Teacher" };
          }
          return s;
        }));
      } else {
        toast.error(json.message || "เช็คชื่อไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("ข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleScanSuccess = (userId: string) => {
    // If the scanned student is in the current list, update their status
    setStudents(prev => prev.map(s => {
      if (s.id === userId) {
        return { ...s, checkInStatus: "Present", checkInMethod: "QR Code Scan" };
      }
      return s;
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 md:p-6 pb-24 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Modals */}
      <TeacherScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
        teacherLocation={teacherLocation}
      />
      
      <TeacherQRGeneratorModal 
        isOpen={isQRGeneratorOpen} 
        onClose={() => setIsQRGeneratorOpen(false)} 
        department={department}
        classGroupId={selectedClassGroup}
      />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <ListChecks className="text-indigo-600" size={36} />
              เช็คชื่อเข้าแถวโดยครู
            </h1>
            <p className="text-slate-500 font-bold mt-1">ระบบตรวจสอบและบันทึกการเข้าแถวของนักเรียนในที่ปรึกษา</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsQRGeneratorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30"
            >
              <Tv size={18} /> สร้าง QR ขึ้นจอทีวี
            </button>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <QrCode size={18} /> สแกน QR เด็ก
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">แผนกวิชา</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- เลือกแผนกวิชา --</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
              กลุ่มเรียน / ห้องเรียน {loadingGroups && <Loader2 className="inline w-3 h-3 animate-spin ml-2" />}
            </label>
            <select
              value={selectedClassGroup}
              onChange={(e) => setSelectedClassGroup(e.target.value)}
              disabled={!department || loadingGroups || classGroups.length === 0}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
            >
              <option value="">-- เลือกห้องเรียน --</option>
              {classGroups.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <Users size={18} className="text-indigo-500" /> รายชื่อนักเรียน {students.length > 0 && `(${students.length} คน)`}
            </h3>
            {loadingStudents && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
          </div>
          
          <div className="overflow-x-auto">
            {students.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                {department && selectedClassGroup ? "ไม่พบข้อมูลนักเรียนในห้องนี้" : "กรุณาเลือกแผนกวิชาและห้องเรียนเพื่อดูรายชื่อนักเรียน"}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-sm font-bold border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4 w-16 text-center">ลำดับ</th>
                    <th className="p-4">รหัสนักเรียน</th>
                    <th className="p-4">ชื่อ - นามสกุล</th>
                    <th className="p-4">สถานะวันนี้</th>
                    <th className="p-4 text-center w-32">เช็คชื่อ (ด้วยมือ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {students.map((student, index) => {
                    const isPresent = student.checkInStatus === "Present" || student.checkInStatus === "Late";
                    const isLate = student.checkInStatus === "Late";
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-center text-slate-400 font-medium">{index + 1}</td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{student.studentId}</td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-white">{student.name}</td>
                        <td className="p-4">
                          {isPresent ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${isLate ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                              <CheckCircle size={14} /> {isLate ? 'สาย' : 'มาเข้าแถว'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                              ยังไม่เช็คชื่อ
                            </span>
                          )}
                          {student.checkInMethod && (
                            <div className="text-[10px] text-slate-400 mt-1 pl-1">
                              {student.checkInMethod}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleManualCheckIn(student.id, student.checkInStatus)}
                            disabled={isPresent}
                            className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center transition-all ${
                              isPresent 
                              ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 opacity-50 cursor-not-allowed' 
                              : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-500/20 border-2 border-slate-200 hover:border-indigo-500 dark:border-zinc-700 dark:hover:border-indigo-500'
                            }`}
                          >
                            <CheckCircle size={18} className={isPresent ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
