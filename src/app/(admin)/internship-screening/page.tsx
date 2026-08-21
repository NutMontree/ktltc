"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner,
  Avatar
} from "@heroui/react";
import Link from "next/link";
import { Search, Download, Filter, Eye, AlertTriangle, ShieldCheck, Printer, CheckCircle, Activity, User, Briefcase, GraduationCap, ChevronDown, Trash2, Edit, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function InternshipScreeningDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterClassroom, setFilterClassroom] = useState("");
  const [isPrintingSummary, setIsPrintingSummary] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mental-health/internship');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // รวบรวมรายชื่อห้องเรียนจากข้อมูลทั้งหมด
  const classroomList = useMemo(() => {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.classroom) set.add(item.classroom);
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(q) || 
                          item.studentId.includes(searchQuery) ||
                          item.department.toLowerCase().includes(q) ||
                          (item.classroom || "").toLowerCase().includes(q);
      
      const matchRisk = filterRisk === "all" ? true : 
                        filterRisk === "risk" ? item.mentalHealthRisk : 
                        filterRisk === "low_soft_skills" ? item.softSkillsPercentage < 60 :
                        !item.mentalHealthRisk;

      const matchClassroom = !filterClassroom || (item.classroom || "") === filterClassroom;
                        
      return matchSearch && matchRisk && matchClassroom;
    });
  }, [data, searchQuery, filterRisk, filterClassroom]);

  // จัดกลุ่มข้อมูลตามห้องเรียน
  const groupedByClassroom = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredData.forEach(item => {
      const key = item.classroom || "ไม่ระบุห้องเรียน";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'th'));
  }, [filteredData]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const headers = ["ชื่อ-นามสกุล", "รหัสนักศึกษา", "แผนกวิชา", "ห้องเรียน", "อายุ", "เพศ", "ความเครียด (ST5)", "ซึมเศร้า (2Q)", "ซึมเศร้า (9Q)", "ฆ่าตัวตาย (8Q)", "ทักษะการทำงาน", "ความเสี่ยงสุขภาพจิต", "วันที่ประเมิน"];
    
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        `"${row.name}"`,
        `"${row.studentId}"`,
        `"${row.department}"`,
        `"${row.classroom || ''}"`,
        row.age,
        row.gender,
        row.st5Total,
        row.twoQTotal,
        row.q9Total,
        row.q8Total,
        row.softSkillsScore,
        row.mentalHealthRisk ? "เสี่ยง" : "ปกติ",
        new Date(row.createdAt).toLocaleDateString('th-TH')
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `internship_screening_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว");
  };

  // Calculate Summary
  const totalStudents = data.length;
  const normalCount = data.filter(d => !d.mentalHealthRisk).length;
  const riskCount = data.filter(d => d.mentalHealthRisk).length;
  const lowSoftSkillsCount = data.filter(d => d.softSkillsPercentage < 60).length;

  // Delete handler (super_admin only)
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันลบข้อมูลของ "${name}" หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/mental-health/internship/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev.filter(d => d._id !== id));
        toast.success("ลบข้อมูลเรียบร้อยแล้ว");
      } else {
        toast.error(json.message || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // Edit handler (super_admin only)
  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({ name: item.name, studentId: item.studentId, department: item.department, classroom: item.classroom || "", age: item.age, gender: item.gender });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/mental-health/internship/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev.map(d => d._id === editingItem._id ? { ...d, ...editForm } : d));
        setEditingItem(null);
        toast.success("แก้ไขข้อมูลเรียบร้อยแล้ว");
      } else {
        toast.error(json.message || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  // Chart Data: แยกตามแผนกวิชา
  const chartByDepartment = useMemo(() => {
    const deptMap: Record<string, { total: number; risk: number; normal: number }> = {};
    data.forEach(d => {
      const dept = d.department || 'ไม่ระบุ';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, risk: 0, normal: 0 };
      deptMap[dept].total++;
      if (d.mentalHealthRisk) deptMap[dept].risk++;
      else deptMap[dept].normal++;
    });
    const entries = Object.entries(deptMap).sort((a, b) => b[1].total - a[1].total);
    return {
      labels: entries.map(([k]) => k),
      normal: entries.map(([, v]) => v.normal),
      risk: entries.map(([, v]) => v.risk),
    };
  }, [data]);

  // Chart Data: แยกตามห้องเรียน
  const chartByClassroom = useMemo(() => {
    const map: Record<string, { total: number; risk: number }> = {};
    data.forEach(d => {
      const cls = d.classroom || 'ไม่ระบุ';
      if (!map[cls]) map[cls] = { total: 0, risk: 0 };
      map[cls].total++;
      if (d.mentalHealthRisk) map[cls].risk++;
    });
    const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'th'));
    return {
      labels: entries.map(([k]) => k),
      totals: entries.map(([, v]) => v.total),
      risks: entries.map(([, v]) => v.risk),
    };
  }, [data]);

  // ApexChart options
  const barDeptOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    colors: ['#10b981', '#f43f5e'],
    plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartByDepartment.labels, labels: { style: { fontSize: '11px' } } },
    legend: { show: true, position: 'bottom' },
    grid: { strokeDashArray: 5, borderColor: '#E2E8F0' },
    fill: { opacity: 1 }
  };

  const barClassroomOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    colors: ['#3b82f6', '#f43f5e'],
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartByClassroom.labels },
    legend: { show: true, position: 'bottom' },
    grid: { strokeDashArray: 5, borderColor: '#E2E8F0' },
  };

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Satoshi, sans-serif' },
    colors: ['#10b981', '#f43f5e', '#f59e0b'],
    labels: ['ปกติด้านสุขภาพจิต', 'เสี่ยงด้านสุขภาพจิต', 'ทักษะต้องพัฒนา (<60%)'],
    legend: { position: 'bottom', fontWeight: 700 },
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'รวมทั้งหมด', fontSize: '14px', fontWeight: '700' } } } } },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full min-h-screen bg-slate-100 dark:bg-zinc-900 transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <Briefcase size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                รายงานผลคัดกรองฝึกงาน
              </h1>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-2xl text-sm sm:text-base ml-1">
              ข้อมูลสรุปผลการประเมินสุขภาพจิตและทักษะความพร้อมก่อนออกฝึกประสบการณ์วิชาชีพ
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                if (filteredData.length === 0) {
                  toast.error("ไม่มีข้อมูลสำหรับพิมพ์");
                  return;
                }
                setIsPrintingSummary(true);
                setTimeout(() => {
                  window.print();
                  setTimeout(() => setIsPrintingSummary(false), 500);
                }, 500);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-slate-200 hover:shadow-md active:scale-95 transition-all border border-slate-200 dark:border-zinc-700"
              title="พิมพ์สรุปเป็น PDF"
            >
              <Printer size={16} /> <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all border border-emerald-200 dark:border-emerald-800/50"
              title="ดาวน์โหลดข้อมูลเป็น Excel/CSV"
            >
              <Download size={16} /> <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        {!isLoading && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> ภาพรวมผลการประเมินทั้งหมด
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setFilterRisk('all')} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${filterRisk === 'all' ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 shadow-blue-500/20' : 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 shadow-sm'}`}>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <User size={14} /> นักศึกษาทั้งหมด
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-zinc-100">{totalStudents} <span className="text-sm font-bold text-slate-400">คน</span></p>
              </div>
              <div onClick={() => setFilterRisk(filterRisk === 'normal' ? 'all' : 'normal')} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${filterRisk === 'normal' ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 shadow-emerald-500/20' : 'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-zinc-900/50 border-emerald-100 dark:border-emerald-900/30 hover:shadow-emerald-500/10'}`}>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ปกติด้านสุขภาพจิต
                </p>
                <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{normalCount} <span className="text-sm font-bold text-emerald-600/50">คน</span></p>
              </div>
              <div onClick={() => setFilterRisk(filterRisk === 'risk' ? 'all' : 'risk')} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${filterRisk === 'risk' ? 'bg-rose-100 dark:bg-rose-900/50 border-rose-500 shadow-rose-500/20' : 'bg-rose-50/50 hover:bg-rose-50 dark:bg-zinc-900/50 border-rose-100 dark:border-rose-900/30 hover:shadow-rose-500/10'}`}>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> กลุ่มเสี่ยงสุขภาพจิต
                </p>
                <p className="text-3xl font-black text-rose-900 dark:text-rose-100">{riskCount} <span className="text-sm font-bold text-rose-600/50">คน</span></p>
              </div>
              <div onClick={() => setFilterRisk(filterRisk === 'low_soft_skills' ? 'all' : 'low_soft_skills')} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${filterRisk === 'low_soft_skills' ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-500 shadow-amber-500/20' : 'bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 hover:shadow-amber-500/10'}`}>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-500" /> ทักษะการทำงานต้องพัฒนา (&lt;60%)
                </p>
                <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{lowSoftSkillsCount} <span className="text-sm font-bold text-amber-600/50">คน</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!isLoading && totalStudents > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Bar Chart: แยกตามแผนกวิชา */}
            <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-zinc-950 p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">สถานะสุขภาพจิต แยกตามแผนกวิชา</h3>
                <p className="text-sm text-slate-400">จำนวนนักศึกษากลุ่มปกติ vs กลุ่มเสี่ยง แยกตามแผนกวิชา</p>
              </div>
              <ReactApexChart
                options={barDeptOptions}
                series={[
                  { name: 'ปกติ', data: chartByDepartment.normal },
                  { name: 'เสี่ยง', data: chartByDepartment.risk }
                ]}
                type="bar"
                height={350}
              />
            </div>

            {/* Donut Chart: ภาพรวม */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-zinc-950 p-8 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <h3 className="mb-2 text-xl font-black text-slate-800 dark:text-zinc-100 text-center">ภาพรวม</h3>
              <p className="mb-4 text-sm text-slate-400 text-center">สัดส่วนนักศึกษาทั้งหมด</p>
              <ReactApexChart
                options={donutOptions}
                series={[normalCount, riskCount, lowSoftSkillsCount]}
                type="donut"
                height={320}
              />
            </div>
          </div>
        )}

        {/* Horizontal Bar: แยกตามห้องเรียน */}
        {!isLoading && chartByClassroom.labels.length > 1 && (
          <div className="rounded-3xl bg-white dark:bg-zinc-950 p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">จำนวนนักศึกษาแยกตามห้องเรียน</h3>
              <p className="text-sm text-slate-400">แสดงจำนวนรวมและจำนวนกลุ่มเสี่ยงแต่ละห้องเรียน</p>
            </div>
            <ReactApexChart
              options={barClassroomOptions}
              series={[
                { name: 'ทั้งหมด', data: chartByClassroom.totals },
                { name: 'เสี่ยง', data: chartByClassroom.risks }
              ]}
              type="bar"
              height={Math.max(250, chartByClassroom.labels.length * 45)}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 p-3 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between relative z-50">
          <div className="w-full sm:max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, แผนก, ห้องเรียน..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Filter by Classroom */}
            <select
              value={filterClassroom}
              onChange={(e) => setFilterClassroom(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <option value="">ห้องเรียน: ทั้งหมด</option>
              {classroomList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Filter by Risk */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap">
                  <Filter size={16} className="text-slate-500" />
                  {filterRisk === 'all' ? 'ทั้งหมด' : filterRisk === 'risk' ? 'กลุ่มเสี่ยง' : filterRisk === 'low_soft_skills' ? 'ทักษะต้องพัฒนา' : 'กลุ่มปกติ'}
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Filter Risk" onAction={(key) => setFilterRisk(key as string)} selectedKeys={new Set([filterRisk])}>
                <DropdownItem key="all">ทั้งหมด</DropdownItem>
                <DropdownItem key="risk" className="text-danger" color="danger">กลุ่มเสี่ยงด้านสุขภาพจิต</DropdownItem>
                <DropdownItem key="normal" className="text-success" color="success">กลุ่มปกติ</DropdownItem>
                <DropdownItem key="low_soft_skills" className="text-warning" color="warning">ทักษะการทำงานต้องพัฒนา</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Data Grouped by Classroom */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : groupedByClassroom.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-12 text-center">
            <p className="text-slate-400 dark:text-zinc-500 font-medium">ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByClassroom.map(([classroomName, students]) => (
              <div key={classroomName} className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden relative z-10">
                {/* Classroom Group Header */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500" />
                    <span className="font-black text-slate-800 dark:text-zinc-200">{classroomName}</span>
                  </div>
                  <Chip size="sm" variant="flat" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">
                    {students.length} คน
                  </Chip>
                </div>

                <Table 
                  aria-label={`Screening Data - ${classroomName}`}
                  className="min-w-full"
                  removeWrapper
                  classNames={{
                    th: "bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 font-bold py-3 text-xs",
                    td: "border-b border-slate-100 dark:border-zinc-800/50 py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn>ชื่อ-นามสกุล / รหัส</TableColumn>
                    <TableColumn>แผนกวิชา</TableColumn>
                    <TableColumn>สถานะสุขภาพจิต</TableColumn>
                    <TableColumn>ทักษะการทำงาน</TableColumn>
                    <TableColumn>วันที่ประเมิน</TableColumn>
                    {isSuperAdmin ? <TableColumn>จัดการ</TableColumn> : <TableColumn aria-label="empty" className="hidden">{""}</TableColumn>}
                  </TableHeader>
                  <TableBody items={students}>
                    {(item: any) => (
                      <TableRow key={item._id} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => setViewingItem(item)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.userId ? (
                              <div className="shrink-0 hover:opacity-80 transition-opacity">
                                <Avatar src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} size="sm" name={item.name} />
                              </div>
                            ) : (
                              <div className="shrink-0 hover:opacity-80 transition-opacity">
                                <Avatar src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} size="sm" name={item.name} />
                              </div>
                            )}
                            <div className="flex flex-col">
                              {item.userId ? (
                                <span className="font-bold text-left text-slate-800 dark:text-zinc-200 hover:text-blue-500 transition-colors">
                                  {item.name}
                                </span>
                              ) : (
                                <span className="font-bold text-left text-slate-800 dark:text-zinc-200 hover:text-blue-500 transition-colors">
                                  {item.name}
                                </span>
                              )}
                              <span className="text-xs text-slate-500 font-medium">{item.studentId}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-zinc-400 font-medium">{item.department}</span>
                        </TableCell>
                        <TableCell>
                          {item.mentalHealthRisk ? (
                            <Chip size="sm" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" startContent={<AlertTriangle className="w-3 h-3 ml-1" />} variant="flat">
                              มีความเสี่ยง
                            </Chip>
                          ) : (
                            <Chip size="sm" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" startContent={<CheckCircle className="w-3 h-3 ml-1" />} variant="flat">
                              ปกติ
                            </Chip>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${item.softSkillsPercentage < 60 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                              {item.softSkillsScore} / {item.softSkillsTotal}
                            </span>
                            <span className="text-xs text-slate-500">{Math.round(item.softSkillsPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </TableCell>
                        {isSuperAdmin ? (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors" title="แก้ไข">
                                <Edit size={15} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id, item.name); }} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors" title="ลบ">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </TableCell>
                        ) : (
                          <TableCell className="hidden">{""}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">แก้ไขข้อมูลนักศึกษา</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ชื่อ-นามสกุล</label>
                  <input value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">รหัสนักศึกษา</label>
                  <input value={editForm.studentId || ""} onChange={(e) => setEditForm({...editForm, studentId: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">แผนกวิชา</label>
                  <input value={editForm.department || ""} onChange={(e) => setEditForm({...editForm, department: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ห้องเรียน</label>
                  <input value={editForm.classroom || ""} onChange={(e) => setEditForm({...editForm, classroom: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">อายุ</label>
                  <input value={editForm.age || ""} onChange={(e) => setEditForm({...editForm, age: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">เพศ</label>
                  <select value={editForm.gender || ""} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditingItem(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all">
                บันทึก
              </button>
            </div>
          </div>
    </div>
      )}

      {/* View Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 md:p-12 overflow-y-auto" onClick={() => setViewingItem(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Cover Image */}
            <div className="relative h-64 sm:h-80 w-full bg-slate-200 dark:bg-zinc-800 shrink-0">
              {viewingItem.image ? (
                <img src={viewingItem.image} alt={viewingItem.name} className="absolute inset-0 w-full h-full object-cover object-top" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-zinc-600">
                  <User size={64} />
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              {/* Close Button */}
              <button onClick={() => setViewingItem(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors z-10">
                <X size={24} />
              </button>

              {/* Expand/Profile Button */}
              {viewingItem.userId && (
                <Link href={`/dashboard/profile/${viewingItem.userId}`} className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors z-10 text-sm font-bold flex items-center gap-2 border border-white/10">
                  <User size={16} /> ดูโปรไฟล์เต็ม
                </Link>
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">{viewingItem.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm sm:text-base font-medium">
                  <span className="flex items-center gap-1"><Briefcase size={16} /> {viewingItem.department}</span>
                  <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1"><GraduationCap size={16} /> {viewingItem.classroom || 'ไม่ระบุห้องเรียน'}</span>
                  <span className="opacity-50">•</span>
                  <span>เพศ: {viewingItem.gender}</span>
                  <span className="opacity-50">•</span>
                  <span>อายุ: {viewingItem.age} ปี</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {viewingItem.mentalHealthRisk ? (
                    <Chip size="lg" className="bg-rose-100 text-rose-700 border-rose-200 shadow-sm" startContent={<AlertTriangle size={16} className="ml-1" />} variant="flat">
                      มีความเสี่ยงด้านสุขภาพจิต (Risk)
                    </Chip>
                  ) : (
                    <Chip size="lg" className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" startContent={<CheckCircle size={16} className="ml-1" />} variant="flat">
                      ปกติด้านสุขภาพจิต (Normal)
                    </Chip>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 print:hidden">
                  <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-bold flex items-center gap-2 transition-colors">
                    <Printer size={16} /> พิมพ์
                  </button>
                  {isSuperAdmin && (
                    <>
                      <button onClick={() => { setEditingItem(viewingItem); setViewingItem(null); }} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold flex items-center gap-2 transition-colors">
                        <Edit size={16} /> แก้ไข
                      </button>
                      <button onClick={() => { handleDelete(viewingItem._id, viewingItem.name); setViewingItem(null); }} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-bold flex items-center gap-2 transition-colors">
                        <Trash2 size={16} /> ลบ
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Scores Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">รายละเอียดคะแนน (Screening Results)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* ST5 */}
                  <div className={`p-5 rounded-2xl border ${viewingItem.st5Total >= 8 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'}`}>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">ความเครียด (ST5)</p>
                    <p className={`text-4xl font-black mb-1 ${viewingItem.st5Total >= 8 ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{viewingItem.st5Total}</p>
                    <p className={`text-xs font-bold ${viewingItem.st5Total >= 10 ? 'text-rose-600' : viewingItem.st5Total >= 8 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      แปลผล: {viewingItem.st5Total >= 10 ? 'เครียดรุนแรง' : viewingItem.st5Total >= 8 ? 'เครียดปานกลาง' : viewingItem.st5Total >= 5 ? 'เครียดเล็กน้อย' : 'เครียดน้อย'}
                    </p>
                  </div>

                  {/* 2Q */}
                  <div className={`p-5 rounded-2xl border ${viewingItem.twoQTotal > 0 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'}`}>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">ซึมเศร้าเบื้องต้น (2Q)</p>
                    <p className={`text-4xl font-black mb-1 ${viewingItem.twoQTotal > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{viewingItem.twoQTotal}</p>
                    <p className={`text-xs font-bold ${viewingItem.twoQTotal > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      แปลผล: {viewingItem.twoQTotal > 0 ? 'มีแนวโน้มซึมเศร้า' : 'ปกติ'}
                    </p>
                  </div>

                  {/* 9Q */}
                  <div className={`p-5 rounded-2xl border ${viewingItem.q9Total >= 13 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30' : viewingItem.q9Total >= 7 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'}`}>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">ซึมเศร้า (9Q)</p>
                    <p className={`text-4xl font-black mb-1 ${viewingItem.q9Total >= 13 ? 'text-rose-600 dark:text-rose-500' : viewingItem.q9Total >= 7 ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{viewingItem.q9Total}</p>
                    <p className={`text-xs font-bold ${viewingItem.q9Total >= 19 ? 'text-rose-600' : viewingItem.q9Total >= 13 ? 'text-orange-600' : viewingItem.q9Total >= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      แปลผล: {viewingItem.q9Total >= 19 ? 'ซึมเศร้ารุนแรง' : viewingItem.q9Total >= 13 ? 'ซึมเศร้าปานกลาง' : viewingItem.q9Total >= 7 ? 'ซึมเศร้าน้อย' : 'ปกติ'}
                    </p>
                  </div>

                  {/* 8Q */}
                  <div className={`p-5 rounded-2xl border ${viewingItem.q8Total >= 9 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30' : viewingItem.q8Total > 0 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'}`}>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">ฆ่าตัวตาย (8Q)</p>
                    <p className={`text-4xl font-black mb-1 ${viewingItem.q8Total >= 9 ? 'text-rose-600 dark:text-rose-500' : viewingItem.q8Total > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{viewingItem.q8Total}</p>
                    <p className={`text-xs font-bold ${viewingItem.q8Total >= 17 ? 'text-rose-600' : viewingItem.q8Total >= 9 ? 'text-orange-600' : viewingItem.q8Total > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      แปลผล: {viewingItem.q8Total >= 17 ? 'แนวโน้มรุนแรงมาก' : viewingItem.q8Total >= 9 ? 'แนวโน้มรุนแรง' : viewingItem.q8Total > 0 ? 'มีแนวโน้ม' : 'ปกติ'}
                    </p>
                  </div>

                </div>

                {/* Soft Skills */}
                <div className={`p-6 rounded-2xl border ${viewingItem.softSkillsPercentage < 60 ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">ทักษะการทำงานและความพร้อม (Soft Skills)</p>
                    <span className={`text-lg font-black ${viewingItem.softSkillsPercentage < 60 ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-500'}`}>
                      {viewingItem.softSkillsScore} / {viewingItem.softSkillsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-3 mb-2 overflow-hidden">
                    <div className={`h-3 rounded-full ${viewingItem.softSkillsPercentage < 60 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${viewingItem.softSkillsPercentage}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right">
                    คิดเป็น {Math.round(viewingItem.softSkillsPercentage)}% — {viewingItem.softSkillsPercentage < 60 ? 'ควรพัฒนาเพิ่มเติม' : 'ผ่านเกณฑ์มาตรฐาน'}
                  </p>
                </div>
              </div>

              {/* Timestamp footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-slate-400 dark:text-zinc-500">
                <span>รหัสนักศึกษา: {viewingItem.studentId}</span>
                <span>ประเมินเมื่อ: {new Date(viewingItem.createdAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })} น.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
