"use client";
import React, { useEffect, useState, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PdcaChartPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdcas, setPdcas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdcas = async () => {
      try {
        const res = await fetch("/api/Pdcas", { cache: "no-store" });
        const data = await res.json();
        setPdcas(data.pdcas || []);
      } catch (error) {
        console.error("Failed to fetch PDCA data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPdcas();
  }, []);

  // Data processing for charts
  const chartData = useMemo(() => {
    const depts = ["ฝ่ายยุทธศาสตร์และแผนงาน", "ฝ่ายพัฒนากิจการนักเรียน", "ฝ่ายวิชาการ", "ฝ่ายบริหารทรัพยากร"];

    // 1. Project Count by Department
    const deptCounts = depts.map(d => pdcas.filter(p => p.department === d).length);

    // 2. Average Completion % by Department
    const deptCompletion = depts.map(d => {
      const deptPdcas = pdcas.filter(p => p.department === d);
      if (deptPdcas.length === 0) return 0;
      const totalProgress = deptPdcas.reduce((acc, p) => {
        const done = Array.from({ length: 20 }, (_, i) => p[`id${i + 1}`]).filter(Boolean).length;
        return acc + (done / 20) * 100;
      }, 0);
      return Math.round(totalProgress / deptPdcas.length);
    });

    // 3. Yearly Distribution
    const years = Array.from(new Set(pdcas.map(p => p.year))).sort();
    const yearCounts = years.map(y => pdcas.filter(p => p.year === y).length);

    return { depts, deptCounts, deptCompletion, years, yearCounts };
  }, [pdcas]);

  // Chart Options
  const barOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    colors: ['#3C50E0', '#80CAEE', '#F0950E', '#22C55E'],
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 8, distributed: true } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.depts, labels: { show: false } },
    legend: { show: true, position: 'bottom' },
    grid: { strokeDashArray: 5, borderColor: '#E2E8F0' },
    fill: { opacity: 1 }
  };

  const lineOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Satoshi, sans-serif' },
    stroke: { curve: 'smooth', width: 4 },
    colors: ['#3C50E0'],
    xaxis: { categories: chartData.years },
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
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">โครงการทั้งหมด</p>
              <h2 className="mt-2 text-4xl font-black text-black dark:text-white">{pdcas.length}</h2>
            </div>
            <div className="text-6xl opacity-10">📁</div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5"></div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">หน่วยงานที่ร่วมงาน</p>
              <h2 className="mt-2 text-4xl font-black text-black dark:text-white">{chartData.depts.length}</h2>
            </div>
            <div className="text-6xl opacity-10">🏢</div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-success/5"></div>
          </div>

          <div className="rounded-3xl bg-linear-to-br from-primary to-blue-700 p-8 shadow-xl text-white flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-60">ปีงบประมาณล่าสุด</p>
              <h2 className="mt-2 text-4xl font-black">{chartData.years[chartData.years.length - 1] || "2567"}</h2>
            </div>
            <div className="text-6xl opacity-20">📅</div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Bar Chart: Projects by Dept */}
          <div className="lg:col-span-8 rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-black dark:text-white">จำนวนโครงการแยกตามฝ่าย</h3>
                <p className="text-sm text-gray-400">ข้อมูลรวมทุกปีงบประมาณ</p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">Live Data</span>
            </div>
            <ReactApexChart options={barOptions} series={[{ name: 'จำนวนโครงการ', data: chartData.deptCounts }]} type="bar" height={350} />
          </div>

          {/* Radial: Overall Completion */}
          <div className="lg:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark flex flex-col items-center justify-center">
            <h3 className="mb-2 text-xl font-black text-black dark:text-white text-center">ภาพรวมความสำเร็จ</h3>
            <p className="mb-6 text-sm text-gray-400 text-center">เทียบกับการดำเนินการเอกสารครบ 100%</p>
            <ReactApexChart options={radialOptions} series={[overallCompletion]} type="radialBar" height={380} />
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
            <h3 className="mb-6 text-2xl font-black text-black dark:text-white">แนวโน้มโครงการรายปี</h3>
            <ReactApexChart options={lineOptions} series={[{ name: 'จำนวนโครงการ', data: chartData.yearCounts }]} type="area" height={300} />
          </div>

          {/* List: Department Ranking */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="mb-6 text-2xl font-black text-black dark:text-white">ความคืบหน้าเฉลี่ยรายฝ่าย</h3>
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
