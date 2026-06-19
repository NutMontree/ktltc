"use client";
import React, { useEffect, useState, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PdcaChartPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdcas, setPdcas] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [internalPdcas, setInternalPdcas] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generalMemos, setGeneralMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("ทั้งหมด");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resPdcas, resInternal, resGeneral] = await Promise.all([
          fetch("/api/Pdcas", { cache: "no-store" }),
          fetch("/api/InternalPdcas", { cache: "no-store" }),
          fetch("/api/GeneralMemos", { cache: "no-store" })
        ]);
        
        const dataPdcas = await resPdcas.json();
        const dataInternal = await resInternal.json();
        const dataGeneral = await resGeneral.json();
        
        setPdcas(dataPdcas.pdcas || []);
        setInternalPdcas(dataInternal.pdcas || []); // InternalPdcas API returns { pdcas }
        setGeneralMemos(dataGeneral.memos || []); // GeneralMemos API returns { memos }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Data processing for charts
  const chartData = useMemo(() => {
    const depts = ["ฝ่ายยุทธศาสตร์และแผนงาน", "ฝ่ายพัฒนากิจการนักเรียน", "ฝ่ายวิชาการ", "ฝ่ายบริหารทรัพยากร"];

    const extractYear = (p: any) => {
      if (p.year) return p.year;
      if (p.createdAt) {
        const y = new Date(p.createdAt).getFullYear();
        return (y + 543).toString();
      }
      return "2567";
    };

    const allDocs = [...pdcas, ...internalPdcas, ...generalMemos];
    const trendYears = Array.from(new Set(allDocs.map(extractYear))).sort();
    const yearCounts = trendYears.map(y => allDocs.filter(p => extractYear(p) === y).length);
    const availableYears = ["ทั้งหมด", ...Array.from(new Set(allDocs.map(extractYear))).sort((a, b) => Number(b) - Number(a))];

    // Filter data by selected year
    const filterByYear = (data: any[]) => selectedYear === "ทั้งหมด" ? data : data.filter(d => extractYear(d) === selectedYear);
    
    const fPdcas = filterByYear(pdcas);
    const fInternal = filterByYear(internalPdcas);
    const fGeneral = filterByYear(generalMemos);

    // 1. Project/Memo Count by Department
    const pdcaCounts = depts.map(d => {
      const p = fPdcas.filter(x => x.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && x.department === "ฝ่ายยุธศาสตร์และแผนงาน")).length;
      const i = fInternal.filter(x => x.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && x.department === "ฝ่ายยุธศาสตร์และแผนงาน")).length;
      return p + i;
    });
    const generalCounts = depts.map(d => fGeneral.filter(p => p.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && p.department === "ฝ่ายยุธศาสตร์และแผนงาน")).length);

    // 2. Average Completion % by Department (For ALL docs)
    const deptCompletion = depts.map(d => {
      const deptPdcas = fPdcas.filter(p => p.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && p.department === "ฝ่ายยุธศาสตร์และแผนงาน"));
      const deptInternal = fInternal.filter(p => p.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && p.department === "ฝ่ายยุธศาสตร์และแผนงาน"));
      const deptGeneral = fGeneral.filter(p => p.department === d || (d === "ฝ่ายยุทธศาสตร์และแผนงาน" && p.department === "ฝ่ายยุธศาสตร์และแผนงาน"));
      
      const totalDocs = deptPdcas.length + deptInternal.length + deptGeneral.length;
      if (totalDocs === 0) return 0;
      
      const pdcaProgress = deptPdcas.reduce((acc, p) => {
        const done = Array.from({ length: 20 }, (_, i) => p[`id${i + 1}`]).filter(Boolean).length;
        return acc + (done / 20) * 100;
      }, 0);
      
      const internalProgress = deptInternal.length * 100;
      const generalProgress = deptGeneral.length * 100;
      
      return Math.round((pdcaProgress + internalProgress + generalProgress) / totalDocs);
    });

    return { 
      depts, 
      pdcaCounts, 
      generalCounts, 
      deptCompletion, 
      trendYears, 
      yearCounts, 
      availableYears,
      totalPdca: fPdcas.length + fInternal.length,
      totalGeneral: fGeneral.length
    };
  }, [pdcas, internalPdcas, generalMemos, selectedYear]);

  // Chart Options
  const barOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    colors: ['#3C50E0', '#F0950E'],
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.depts },
    legend: { show: true, position: 'bottom' },
    grid: { strokeDashArray: 5, borderColor: '#E2E8F0' },
    fill: { opacity: 1 }
  };

  const lineOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    stroke: { curve: 'smooth', width: 4 },
    colors: ['#3C50E0'],
    xaxis: { categories: chartData.trendYears },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
    grid: { strokeDashArray: 5 },
    dataLabels: { enabled: false }
  };

  const radialOptions: ApexOptions = {
    chart: { type: 'radialBar', fontFamily: 'Satoshi, sans-serif' },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: true, fontSize: '14px', fontWeight: 900, color: '#888' },
          value: { show: true, fontSize: '30px', fontWeight: 900, color: '#111', formatter: (val: number) => `${val}%` }
        }
      }
    },
    colors: ['#3C50E0'],
    labels: ['ภาพรวมความคืบหน้า'],
  };

  if (loading) {
    return (
      <>
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </>
    );
  }

  const overallCompletion = Math.round(chartData.deptCompletion.reduce((a, b) => a + b, 0) / 4) || 0;

  return (
    <>
      <Breadcrumb pageName="PDCA Data Analytics" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">โครงการทั้งหมด (PDCA)</p>
              <h2 className="mt-2 text-4xl font-black text-black dark:text-white">{chartData.totalPdca}</h2>
            </div>
            <div className="text-6xl opacity-10">📁</div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5"></div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">บันทึกข้อความทั่วไป</p>
              <h2 className="mt-2 text-4xl font-black text-black dark:text-white">{chartData.totalGeneral}</h2>
            </div>
            <div className="text-6xl opacity-10">📝</div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-warning/5"></div>
          </div>

          <div className="rounded-3xl bg-linear-to-br from-primary to-blue-700 p-8 shadow-xl text-white flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10 w-full">
              <p className="text-xs font-black uppercase tracking-widest opacity-80">เลือกปีงบประมาณ</p>
              <div className="relative mt-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-transparent w-full text-4xl font-black outline-none cursor-pointer pr-10"
                >
                  {chartData.availableYears.map((year) => (
                    <option key={year} value={year} className="text-black text-base">
                      {year === "ทั้งหมด" ? "ข้อมูลทั้งหมด" : `ปี ${year}`}
                    </option>
                  ))}
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <div className="text-6xl opacity-20 absolute right-8">📅</div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Bar Chart: Projects & Memos by Dept */}
          <div className="lg:col-span-8 rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-black dark:text-white">จำนวนเอกสารแยกตามฝ่าย</h3>
                <p className="text-sm text-gray-400">ข้อมูลรวมโครงการและบันทึกข้อความทั้งหมด</p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">Live Data</span>
            </div>
            <ReactApexChart 
              key={`bar-${selectedYear}`}
              options={barOptions} 
              series={[
                { name: 'โครงการ (PDCA)', data: chartData.pdcaCounts },
                { name: 'บันทึกข้อความทั่วไป', data: chartData.generalCounts }
              ]} 
              type="bar" 
              height={350} 
            />
          </div>

          {/* Radial: Overall Completion */}
          <div className="lg:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark flex flex-col items-center justify-center">
            <h3 className="mb-2 text-xl font-black text-black dark:text-white text-center">ภาพรวมความสำเร็จ</h3>
            <p className="mb-6 text-sm text-gray-400 text-center">รวมข้อมูลเอกสารทั้งหมด (โครงการ, ภายใน, ทั่วไป)</p>
            <ReactApexChart key={`radial-${selectedYear}`} options={radialOptions} series={[overallCompletion]} type="radialBar" height={380} />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
              <div className="text-center rounded-2xl bg-gray-50 p-4 dark:bg-meta-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase">เป้าหมาย</p>
                <p className="font-black text-black dark:text-white">100%</p>
              </div>
              <div className="text-center rounded-2xl bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary uppercase">ปัจจุบัน</p>
                <p className="font-black text-primary">{overallCompletion}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Line Chart: Yearly Trends */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="mb-6 text-2xl font-black text-black dark:text-white">แนวโน้มเอกสารรายปี</h3>
            <p className="mb-6 text-sm text-gray-400">ข้อมูลรวมโครงการและบันทึกข้อความทั้งหมด</p>
            <ReactApexChart key={`line-${selectedYear}`} options={lineOptions} series={[{ name: 'จำนวนเอกสารทั้งหมด', data: chartData.yearCounts }]} type="area" height={300} />
          </div>

          {/* List: Department Ranking */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="mb-6 text-2xl font-black text-black dark:text-white">ความสำเร็จรวมรายฝ่าย</h3>
            <div className="space-y-6">
              {chartData.depts.map((d, i) => (
                <div key={d} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-black dark:text-white truncate max-w-[200px]">{d}</span>
                    <span className="text-sm font-black text-primary">{chartData.deptCompletion[i]}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-meta-4 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${chartData.deptCompletion[i]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PdcaChartPage;
