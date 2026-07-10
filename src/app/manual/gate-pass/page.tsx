"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, QrCode, Map, History, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function GatePassManualPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-zinc-500 hover:text-blue-600 font-medium transition-colors w-fit">
            <ArrowLeft size={16} className="mr-2" /> กลับหน้าหลัก
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 text-white">
            <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">คู่มือการใช้งานระบบ Gate Pass</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              ระบบสแกนขออนุญาตออกนอกสถานศึกษา และการติดตามตำแหน่ง (GPS Tracking) สำหรับนักเรียนและบุคลากร
            </p>
          </div>

          <div className="p-8 sm:p-12 space-y-16">

            {/* Section 1: Student */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <Smartphone className="text-blue-500" size={32} />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">1. สำหรับนักเรียน (Student)</h2>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <QrCode size={20} className="text-indigo-500" />
                  หน้าบัตรประจำตัวดิจิทัล (/student/id-card)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  ใช้สำหรับแสดง QR Code ประจำตัวให้ครูเวรหรือ รปภ. สแกนเพื่อบันทึกเวลาเข้า-ออกวิทยาลัย และส่งพิกัด GPS
                </p>
                <ol className="list-decimal list-inside space-y-3 text-zinc-700 dark:text-zinc-300 ml-2">
                  <li>เข้าสู่ระบบด้วยบัญชีนักเรียน และไปที่เมนู <strong>"บัตรประจำตัวดิจิทัล"</strong></li>
                  <li>ระบบจะแสดงข้อมูลส่วนตัวและ <strong>QR Code</strong> ประจำตัว</li>
                  <li><strong>การสแกนออก:</strong> ยื่นหน้าจอนี้ให้คุณครูสแกนเพื่อบันทึกเวลาออก</li>
                  <li><strong>การสแกนกลับ:</strong> เมื่อกลับถึงวิทยาลัย ให้ยื่นหน้า QR Code เดิมให้คุณครูสแกนอีกครั้งเพื่อจบขั้นตอน</li>
                </ol>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 mt-6">
                  <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
                    <ShieldAlert size={18} /> ข้อควรปฏิบัติระหว่างอยู่ข้างนอก (สำคัญมาก)
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400 font-medium">
                    "เมื่อสแกนเสร็จแล้ว ให้หรี่แสงหน้าจอลง แต่อย่ากดปุ่มล็อกหน้าจอ (ปุ่ม Power) และห้ามปิดหน้าเว็บนี้ ให้ใส่กระเป๋าไว้ได้เลย หน้าจอจะไม่ดับเอง และ GPS จะส่งตำแหน่งได้ตลอดเวลา"
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Teacher - Gate Scanner */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <QrCode className="text-emerald-500" size={32} />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">2. สำหรับคุณครู (Gate Scanner)</h2>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  หน้าสแกนเข้า-ออก (/teacher/gate-scanner)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  ใช้สแกน QR Code ของนักเรียนเพื่อบันทึกการเข้า-ออก และควบคุมระบบ GPS
                </p>
                <ol className="list-decimal list-inside space-y-3 text-zinc-700 dark:text-zinc-300 ml-2">
                  <li>เข้าไปที่เมนู <strong>"สแกนเข้า-ออก (Gate Pass)"</strong></li>
                  <li>กดปุ่ม <strong>"เริ่มเปิดกล้องสแกน"</strong> (อนุญาตให้เข้าถึงกล้อง)</li>
                  <li>นำกล้องไปส่องที่ QR Code จากหน้าจอโทรศัพท์ของนักเรียน</li>
                  <li>
                    <strong>ผลลัพธ์การสแกน:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                      <li><strong>สแกนครั้งแรก (ออก):</strong> แจ้งเตือนสีเหลือง "เริ่มการติดตามเรียบร้อยแล้ว"</li>
                      <li><strong>สแกนครั้งที่สอง (กลับ):</strong> แจ้งเตือนสีเขียว "ยกเลิกการติดตามเรียบร้อยแล้ว" พร้อมสรุปเวลา</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 3: Teacher - Tracking */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <Map className="text-rose-500" size={32} />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">3. การติดตาม GPS (Tracking)</h2>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  หน้าติดตามสถานะนักเรียน (/teacher/tracking)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  ใช้ดูตำแหน่ง GPS ของนักเรียนที่ถูกสแกนออกนอกวิทยาลัยไปแล้วแบบ Real-time
                </p>
                <ul className="list-disc list-inside space-y-4 text-zinc-700 dark:text-zinc-300 ml-2">
                  <li><strong>ดูแผนที่รวม:</strong> แสดงจุด (หมุด) ของนักเรียนทุกคนที่กำลังอยู่ข้างนอก</li>
                  <li>
                    <strong>การดูข้อมูลโดยละเอียด:</strong> กดหมุดของนักเรียนบนแผนที่ แล้วกดปุ่ม "📄 ดูข้อมูลนักเรียน"
                    ระบบจะแสดงหน้าต่างข้อมูลรูปภาพ ชื่อ เวลาที่ออกไป และสถานะ GPS
                  </li>
                  <li>
                    <strong className="text-rose-500">การตรวจสอบสถานะ GPS:</strong> หากเด็กปิดหน้าจอหรือสัญญาณหาย ระบบจะแสดงกล่องสีแดงระบุเวลาที่ขาดการเชื่อมต่อ เช่น <em>"GPS ปิด (15 นาที)"</em>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4: Teacher - History */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <History className="text-purple-500" size={32} />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">4. ประวัติการเข้า-ออก (History)</h2>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  หน้าประวัติการเข้า-ออก (/teacher/tracking/history)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  ดูสรุปประวัติย้อนหลังว่านักเรียนคนไหน ออกไปเมื่อไหร่ และกลับมาเมื่อไหร่
                </p>
                <ul className="list-disc list-inside space-y-4 text-zinc-700 dark:text-zinc-300 ml-2">
                  <li><strong>🟡 อยู่ข้างนอก:</strong> นักเรียนถูกสแกนออกไปแล้ว แต่ยังไม่ได้ถูกสแกนกลับเข้าวิทยาลัย</li>
                  <li><strong>🟢 เสร็จสิ้น:</strong> นักเรียนสแกน QR Code กลับเข้าวิทยาลัยเรียบร้อยแล้ว</li>
                </ul>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
