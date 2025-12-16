"use client";

import React from "react";
import Link from "next/link";
import {
  Image,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";
import { Modal, Breadcrumb } from "antd";
import { motion } from "framer-motion";
import {
  HomeOutlined,
  UserOutlined,
  FilePdfOutlined,
  GlobalOutlined,
  FormOutlined,
  YoutubeOutlined,
  FacebookFilled,
  AuditOutlined,
  SolutionOutlined,
  IdcardOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  SafetyOutlined,
  WifiOutlined,
  CommentOutlined,
  TeamOutlined,
  ExperimentOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  SmileOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  ToolOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// --- Reusable Component: ลิ้งค์ดาวน์โหลด ---
const ResourceLink = ({
  href,
  title,
  icon,
  subtitle,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
}) => (
  <Link href={href} target="_blank" className="group block h-full w-full">
    <div className="flex h-full items-center rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700">
      <div className="mr-3 shrink-0 text-xl text-slate-500 transition-colors group-hover:text-blue-600">
        {icon}
      </div>
      <div className="min-w-0 grow">
        <h4 className="truncate text-sm font-medium text-slate-700 group-hover:text-blue-700 dark:text-slate-200">
          {title}
        </h4>
        {subtitle && (
          <p className="truncate text-[10px] text-slate-400">{subtitle}</p>
        )}
      </div>
      <div className="pl-2 text-slate-300 group-hover:text-blue-400">
        <GlobalOutlined className="rotate-45 text-xs" />
      </div>
    </div>
  </Link>
);

export default function GECCPage() {
  // --- Data 1: แบบฟอร์มคำร้อง (งานทะเบียน) ---
  const formsData = [
    {
      title: "คำร้องทั่วไป",
      href: "/pdf/ทะเบียน/คำร้องทั่วไป.pdf",
      icon: <FormOutlined />,
    },
    {
      title: " ยื่นคำร้องขอรักษาสภาพการเป็นนักเรียน",
      href: "/pdf/ทะเบียน/คำร้องขอรักษาสภาพฯ.pdf",
      icon: <FormOutlined />,
    },
    {
      title: "คำร้องขอย้ายสถานศึกษา",
      href: "/pdf/ทะเบียน/คำร้องขอย้ายสถานศึกษา.pdf",
      icon: <GlobalOutlined />,
    },
    {
      title: "ทำบัตรประจำตัวนักเรียน นักศึกษา",
      href: "/pdf/ทะเบียน/คำร้องขอทำบัตรนักศึกษา.pdf",
      icon: <GlobalOutlined />,
    },
    {
      title: "คำร้องขอลาพักการเรียน",
      href: "/pdf/ทะเบียน/คำร้องขอลาพักการเรียน.pdf",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "คำร้องขอกลับเข้าเรียน",
      href: "/pdf/ทะเบียน/คำร้องขอกลับเข้าเรียน.pdf",
      icon: <SolutionOutlined />,
    },
    {
      title: "ยื่นคำร้องขอใบรับรองผลการเรียน/ใบระเบียนแสดงผลการเรียน",
      href: "/pdf/ทะเบียน/คำร้องขอใบรับรอง.pdf",
      icon: <SolutionOutlined />,
    },
    {
      title: "คำร้องขอทำบัตรนักศึกษา",
      href: "/pdf/ทะเบียน/คำร้องขอทำบัตรนักศึกษา.pdf",
      icon: <IdcardOutlined />,
    },
    {
      title: "คำร้องขอใบรับรอง/ระเบียนผล",
      href: "/pdf/ทะเบียน/คำร้องขอใบรับรอง.pdf",
      icon: <FilePdfOutlined />,
    },
    {
      title: "คำร้องขอรักษาสภาพฯ",
      href: "/pdf/ทะเบียน/คำร้องขอรักษาสภาพฯ.pdf",
      icon: <CheckCircleOutlined />,
    },
    {
      title: "ใบสมัคร ปวส. สายตรง 68",
      href: "/pdf/ทะเบียน/ใบสมัครปวส.สายตรง68.pdf",
      icon: <FileTextOutlined />,
    },
  ];

  // --- Data 2: คู่มือการปฏิบัติงานทั้งหมด (33 รายการ) ---
  const manualsData = [
    {
      title: "คู่มือการดำเนินงานเรื่องร้องเรียนร้องทุกข์",
      href: "/pdf/คู่มือ/คู่มือการดำเนินงานเรื่องร้องเรียนร้องทุก.pdf",
      icon: <CommentOutlined />,
    },
    {
      title: "คู่มือการปฏิบัตงานประชาสัมพันธ์",
      href: "/pdf/คู่มือ/คู่มือการปฏิบัตงานประชาสัมพันธ์.pdf",
      icon: <GlobalOutlined />,
    },
    {
      title: "คู่มืองาน กสศ.",
      href: "/pdf/คู่มือ/คู่มืองานกสศ.pdf",
      icon: <BookOutlined />,
    },
    {
      title: "คู่มืองานการเงิน",
      href: "/pdf/คู่มือ/คู่มืองานการเงิน.pdf",
      icon: <CalculatorOutlined />,
    },
    {
      title: "คู่มืองานกิจกรรม",
      href: "/pdf/คู่มือ/คู่มืองานกิจกรรม.pdf",
      icon: <SmileOutlined />,
    },
    {
      title: "คู่มืองานครูที่ปรึกษา",
      href: "/pdf/คู่มือ/คู่มืองานครูที่ปรึกษา.pdf",
      icon: <UserOutlined />,
    },
    {
      title: "คู่มืองานความร่วมมือ",
      href: "/pdf/คู่มือ/คู่มืองานความร่วมมือ.pdf",
      icon: <TeamOutlined />,
    },
    {
      title: "คู่มืองานโครงการพิเศษและบริการชุมชน",
      href: "/pdf/คู่มือ/คู่มืองานโครงการพิเศษและบริการชุมชน.pdf",
      icon: <SolutionOutlined />,
    },
    {
      title: "คู่มืองานทะเบียน",
      href: "/pdf/คู่มือ/คู่มืองานทะเบียน.pdf",
      icon: <IdcardOutlined />,
    },
    {
      title: "คู่มืองานแนะแนว",
      href: "/pdf/คู่มือ/คู่มืองานแนะแนว.pdf",
      icon: <UserOutlined />,
    },
    {
      title: "คู่มืองานบริหารงานทั่วไป",
      href: "/pdf/คู่มือ/คู่มืองานบริหารงานทั่วไป.pdf",
      icon: <FileTextOutlined />,
    },
    {
      title: "คู่มืองานบัญชี",
      href: "/pdf/คู่มือ/คู่มืองานบัญชี.pdf",
      icon: <AuditOutlined />,
    },
    {
      title: "คู่มืองานบุคลากร",
      href: "/pdf/คู่มือ/คู่มืองานบุคลากร.pdf",
      icon: <TeamOutlined />,
    },
    {
      title: "คู่มืองานปกครอง",
      href: "/pdf/คู่มือ/คู่มืองานปกครอง.pdf",
      icon: <SafetyOutlined />,
    },
    {
      title: "คู่มืองานประกันฯ",
      href: "/pdf/คู่มือ/คู่มืองานประกันฯ.pdf",
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: "คู่มืองานพัฒนาหลักสูตรการเรียนการสอน",
      href: "/pdf/คู่มือ/คู่มืองานพัฒนาหลักสูตรการเรียนการสอน.pdf",
      icon: <BookOutlined />,
    },
    {
      title: "คู่มืองานพัสดุ",
      href: "/pdf/คู่มือ/คู่มืองานพัสดุ.pdf",
      icon: <ToolOutlined />,
    },
    {
      title: "คู่มืองานร้านค้าสวัสดิการ",
      href: "/pdf/คู่มือ/คู่มืองานร้านค้าสวัสดิการ.pdf",
      icon: <ShopOutlined />,
    },
    {
      title: "คู่มืองานวัดผลและประเมินผล",
      href: "/pdf/คู่มือ/คู่มืองานวัดผลและประเมินผล.pdf",
      icon: <FilePdfOutlined />,
    },
    {
      title: "คู่มืองานวางแผนและงบประมาณ",
      href: "/pdf/คู่มือ/คู่มืองานวางแผนและงบประมาณ.pdf",
      icon: <CalculatorOutlined />,
    },
    {
      title: "คู่มืองานวิจัย",
      href: "/pdf/คู่มือ/คู่มืองานวิจัย.pdf",
      icon: <ExperimentOutlined />,
    },
    {
      title: "คู่มืองานวิทยบริการ",
      href: "/pdf/คู่มือ/คู่มืองานวิทยบริการ.pdf",
      icon: <ReadOutlined />,
    },
    {
      title: "คู่มืองานศูนย์ข้อมูล",
      href: "/pdf/คู่มือ/คู่มืองานศูนย์ข้อมูล.pdf",
      icon: <DatabaseOutlined />,
    },
    {
      title: "คู่มืองานส่งเสริมผลิตผลการค้า",
      href: "/pdf/คู่มือ/คู่มืองานส่งเสริมผลิตผลการค้าและประกอบธ.pdf",
      icon: <ShopOutlined />,
    },
    {
      title: "คู่มืองานสวนพฤกษศาสตร์โรงเรียน",
      href: "/pdf/คู่มือ/คู่มืองานสวนพฤกษศาสตร์โรงเรียน.pdf",
      icon: <EnvironmentOutlined />,
    },
    {
      title: "คู่มืองานสวัสดิการ",
      href: "/pdf/คู่มือ/คู่มืองานสวัสดิการ.pdf",
      icon: <SmileOutlined />,
    },
    {
      title: "คู่มืองานสื่อการเรียนการสอน",
      href: "/pdf/คู่มือ/คู่มืองานสื่อการเรียนการสอน.pdf",
      icon: <DesktopOutlined />,
    },
    {
      title: "คู่มืองานหลักสูตรวิชาชีพระยะสั้น",
      href: "/pdf/คู่มือ/คู่มืองานหลักสูตรวิชาชีพระยะสั้น.pdf",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "คู่มืองานอาคารสถานที่",
      href: "/pdf/คู่มือ/คู่มืองานอาคารสถานที่.pdf",
      icon: <HomeOutlined />,
    },
    {
      title: "คู่มืองานอาชีวศึกษาระบบทวิภาคี",
      href: "/pdf/คู่มือ/คู่มืองานอาชีวศึกษาระบบทวิภาคี.pdf",
      icon: <SolutionOutlined />,
    },
    {
      title: "คู่มือแผนเผชิญเหตุ วท.กล.",
      href: "/pdf/คู่มือ/คู่มือแผนเผชิญเหตุ วท.กล.pdf",
      icon: <SafetyOutlined />,
    },
    {
      title: "คู่มือภัยคุกคามไซเบอร์",
      href: "/pdf/คู่มือ/คู่มือภัยคุกคามไซเบอร์.pdf",
      icon: <WifiOutlined />,
    },
  ];

  // Modal Function
  const warning1 = () => {
    Modal.warning({
      title: "ลงทะเบียนเรียนรายวิชา",
      content: <div>โปรดติดต่อเจ้าหน้าที่งานทะเบียนโดยตรง</div>,
      centered: true,
    });
  };

  const openAdmissionModal = () => {
    Modal.success({
      title: "เอกสารการรับสมัครนักเรียน",
      width: 600,
      centered: true,
      content: (
        <div className="grid gap-3 pt-4">
          <ResourceLink
            href="/pdf/ทะเบียน/ใบสมัครปวช.68.pdf"
            title="ใบสมัคร ปวช.68"
            icon={<FilePdfOutlined />}
          />
          <ResourceLink
            href="/pdf/ทะเบียน/ใบสมัครปวส.ม68.pdf"
            title="ใบสมัคร ปวส.ม68"
            icon={<FilePdfOutlined />}
          />
          <ResourceLink
            href="/pdf/ทะเบียน/ใบสมัครปวส.สายตรง68.pdf"
            title="ใบสมัคร ปวส.สายตรง68"
            icon={<FilePdfOutlined />}
          />
          <ResourceLink
            href="/pdf/ทะเบียน/แบบฟอร์มประวัตินักเรียนนักศึกษา.pdf"
            title="แบบฟอร์มประวัตินักเรียน"
            icon={<SolutionOutlined />}
          />
          <ResourceLink
            href="/pdf/ทะเบียน/แบบพอร์มใบมอบตัว.pdf"
            title="แบบฟอร์มใบมอบตัว"
            icon={<AuditOutlined />}
          />
        </div>
      ),
    });
  };

  return (
    <section className="min-h-screen bg-slate-50 pb-20 font-sans dark:bg-neutral-950">
      {/* Header & Breadcrumb */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { href: "/", title: <HomeOutlined /> },
              {
                title: (
                  <span className="font-semibold text-blue-600">
                    ศูนย์ราชการสะดวก (GECC)
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[250px] w-full overflow-hidden md:h-[400px]">
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <Image
          removeWrapper
          src="/images/logo/GECCBG.webp"
          alt="GECC Banner"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 z-20 container mx-auto w-full p-6 text-center md:p-10 md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-2 inline-block rounded-full bg-[#DAA520] px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-lg">
              GECC Center
            </span>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg md:text-5xl">
              ศูนย์ราชการสะดวก
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 drop-shadow-md md:text-lg">
              วิทยาลัยเทคนิคกันทรลักษ์ | สะดวก รวดเร็ว เข้าถึงง่าย
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-30 container mx-auto -mt-10 px-4">
        {/* Quick Links / Survey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card className="border-t-4 border-blue-500 bg-white/95 shadow-xl backdrop-blur transition-transform hover:-translate-y-1">
            <CardBody className="flex flex-col items-center p-6 text-center">
              <h3 className="mb-1 text-lg font-bold text-slate-800">
                ความพึงพอใจ
              </h3>
              <p className="mb-4 text-xs text-slate-500">
                แบบสำรวจการให้บริการ
              </p>
              <Link
                href="https://siamcentric-rs-web.vercel.app/suverys/8?title=%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%AA%E0%B8%B3%E0%B8%A3%E0%B8%A7%E0%B8%88%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%9E%E0%B8%B6%E0%B8%87%E0%B8%9E%E0%B8%AD%E0%B9%83%E0%B8%88%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B2%E0%B8%8A%E0%B8%99%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%95%E0%B8%B2%E0%B8%A1%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B2%E0%B8%8A%E0%B8%99%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B9%88%E0%B8%A7%E0%B8%A2%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B8%B1%E0%B8%90"
                target="_blank"
              >
                <Image
                  src="/images/gecc/แบนเนอร์ประชาสัมพันธ์.webp"
                  alt="Survey"
                  className="h-32 rounded-lg object-contain shadow-sm"
                />
              </Link>
            </CardBody>
          </Card>
          <Card className="border-t-4 border-purple-500 bg-white/95 shadow-xl backdrop-blur transition-transform hover:-translate-y-1">
            <CardBody className="flex flex-col items-center p-6 text-center">
              <h3 className="mb-1 text-lg font-bold text-slate-800">
                ความต้องการ
              </h3>
              <p className="mb-4 text-xs text-slate-500">แบบสอบถามเพื่อพัฒนา</p>
              <div className="flex justify-center gap-3">
                <Link
                  href="https://docs.google.com/forms/d/194h3utMLMylUwcjhtCl_U7HnvJ7Oo3P0Gkqg0vQiBSY/viewform?edit_requested=true"
                  target="_blank"
                >
                  <Image
                    src="/images/gecc/qr2.webp"
                    alt="QR2"
                    className="h-20 w-20 rounded-lg border border-slate-100 shadow-sm"
                  />
                </Link>
                <Link
                  href="https://docs.google.com/forms/d/11njKP2updYfffqs2ByjlbXJQtpelHD-zvcIXMUYOYIA/viewform?edit_requested=true"
                  target="_blank"
                >
                  <Image
                    src="/images/gecc/qr1.webp"
                    alt="QR1"
                    className="h-20 w-20 rounded-lg border border-slate-100 shadow-sm"
                  />
                </Link>
              </div>
            </CardBody>
          </Card>
          <Card className="border-t-4 border-green-500 bg-white/95 shadow-xl backdrop-blur transition-transform hover:-translate-y-1">
            <CardBody className="flex flex-col items-center p-6 text-center">
              <h3 className="mb-1 text-lg font-bold text-slate-800">
                ร้องเรียน/ร้องทุกข์
              </h3>
              <p className="mb-4 text-xs text-slate-500">
                Line Official Account
              </p>
              <Link
                href="https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default"
                target="_blank"
              >
                <Image
                  src="/images/logo/QrGECC.webp"
                  alt="Line Complaint"
                  className="h-28 w-28 rounded-lg shadow-sm"
                />
              </Link>
              <span className="mt-2 rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                คลิกเพื่อแอดไลน์
              </span>
            </CardBody>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Content */}
          <div className="space-y-10 lg:col-span-8">
            {/* 1. งานทะเบียน (รวมแบบฟอร์มคำร้องต่างๆ) */}
            <div>
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-2">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 shadow-sm">
                  <IdcardOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  งานทะเบียน
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 p-5 sm:flex-row">
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">
                      รับสมัครนักเรียนใหม่
                    </h4>
                    <p className="text-sm text-blue-600">
                      สมัครออนไลน์ หรือ ดาวน์โหลดเอกสาร
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="https://admission.vec.go.th/web/Login.htm?mode=index"
                      target="_blank"
                    >
                      <Button
                        color="primary"
                        variant="shadow"
                        startContent={<GlobalOutlined />}
                      >
                        สมัครออนไลน์
                      </Button>
                    </Link>
                    <Button
                      className="border border-blue-200 bg-white text-blue-700"
                      variant="bordered"
                      startContent={<FilePdfOutlined />}
                      onPress={openAdmissionModal}
                    >
                      เอกสารสมัคร
                    </Button>
                  </div>
                </div>
                {/* แสดงรายการแบบฟอร์มคำร้อง */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {formsData.map((form, idx) => (
                    <ResourceLink
                      key={idx}
                      href={form.href}
                      title={form.title}
                      icon={form.icon}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 2. งานวัดผล */}
            <div>
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-2">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600 shadow-sm">
                  <AuditOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  งานวัดผลและประเมินผล
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div onClick={warning1} className="group cursor-pointer">
                    <div className="flex h-full items-center rounded-xl border border-red-100 bg-red-50 p-3 transition-all hover:bg-red-100">
                      <div className="ึshrink-0 mr-3 text-2xl text-red-500">
                        <FormOutlined />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-700">
                          ลงทะเบียนเรียนรายวิชา
                        </h4>
                        <p className="text-[10px] text-red-500">
                          ติดต่อเจ้าหน้าที่โดยตรง
                        </p>
                      </div>
                    </div>
                  </div>
                  <ResourceLink
                    href="#"
                    title="ขอทดสอบมาตรฐานวิชาชีพ"
                    icon={
                      <SafetyCertificateOutlined className="text-red-400" />
                    }
                  />
                  <ResourceLink
                    href="#"
                    title="ขอทดสอบ V-NET"
                    icon={<GlobalOutlined className="text-red-400" />}
                  />
                  <ResourceLink
                    href="/pdf/วัดผล/ใบสมัครฝึกและทดสอบมาตรฐานแบบใหม่.pdf"
                    title="ขอทดสอบมาตรฐานฝีมือแรงงาน"
                    icon={<FilePdfOutlined />}
                  />
                  <ResourceLink
                    href="/pdf/วัดผล/แบบฟอร์มขอแก้0-มส.นร.นศ.docx"
                    title="ขอสอบแก้ 0 / มส."
                    icon={<FormOutlined />}
                  />
                </div>
              </div>
            </div>

            {/* 3. คู่มือการปฏิบัติงาน (33 รายการ ครบถ้วน) */}
            <div>
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-2">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-600 shadow-sm">
                  <ReadOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  คู่มือการปฏิบัติงาน
                </h2>
              </div>
              <div className="custom-scrollbar grid max-h-[600px] grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
                {manualsData.map((manual, idx) => (
                  <ResourceLink
                    key={idx}
                    href={manual.href}
                    title={manual.title}
                    icon={manual.icon}
                  />
                ))}
              </div>
              <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <AuditOutlined className="text-2xl text-yellow-600" />
                  <span className="text-sm font-bold text-yellow-800">
                    แผนการติดตามผลการดำเนินการศูนย์ GECC
                  </span>
                </div>
                <Button
                  size="sm"
                  className="border border-yellow-300 bg-white text-yellow-700"
                  as={Link}
                  href="/pdf/คู่มือ/แผนการติดตามผลการดำเนินการของศูนย์ราชกา.pdf"
                  target="_blank"
                >
                  ดาวน์โหลด
                </Button>
              </div>
            </div>

            {/* 4. Certification */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <SafetyCertificateOutlined className="text-3xl text-yellow-400" />
                <div>
                  <h4 className="text-lg font-bold">การรับรองมาตรฐาน GECC</h4>
                  <p className="text-sm text-slate-300">ประจำปี 2568</p>
                </div>
              </div>
              <Button
                as={Link}
                href="/pdf/คู่มือ/เล่มการประเมินและการรับรองมาตรฐานการให้.pdf"
                target="_blank"
                color="warning"
                variant="solid"
              >
                ดูรายละเอียด
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8 lg:col-span-4">
            <Card className="overflow-hidden border border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50 pb-2 font-bold text-slate-700">
                <YoutubeOutlined className="mr-2 text-xl text-red-600" />{" "}
                วิดีโอแนะนำศูนย์
              </CardHeader>
              <CardBody className="bg-black p-0">
                <iframe
                  className="h-[220px] w-full"
                  src="/images/gecc/ศูนย์ราชการสะดวก.mp4"
                  title="Video GECC"
                  allowFullScreen
                />
              </CardBody>
            </Card>
            <Card className="border border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50 pb-2 font-bold text-slate-700">
                <FacebookFilled className="mr-2 text-xl text-blue-600" />{" "}
                ประชาสัมพันธ์
              </CardHeader>
              <CardBody className="flex justify-center overflow-hidden p-0">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100057326985699&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=952832906928077"
                  width="100%"
                  height="400"
                  style={{ border: "none", overflow: "hidden" }}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </CardBody>
            </Card>
            <Card className="border-none bg-linear-to-br from-[#DAA520] to-yellow-700 text-white shadow-xl">
              <CardBody className="px-6 py-10 text-center">
                <h3 className="mb-2 text-xl font-bold opacity-90">เวลาทำการ</h3>
                <div className="my-4 text-4xl font-black tracking-tight">
                  07.30 - 17.30
                </div>
                <p className="text-lg font-medium opacity-90">
                  วันจันทร์ - ศุกร์
                </p>
                <div className="mt-6 inline-block rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-md">
                  เปิดให้บริการต่อเนื่อง (ไม่พักเที่ยง)
                </div>
              </CardBody>
            </Card>
            <div className="overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl">
              <Image
                removeWrapper
                src="/images/ข่าวประชาสัมพันธ์/2568/มิถุนายน/74/0.webp"
                alt="News"
                className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
