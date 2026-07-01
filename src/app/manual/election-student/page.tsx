"use client";

import { ArrowLeft, BookOpen, Vote, CheckCircle2, List, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ElectionStudentManual() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-[1000px] w-full mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner backdrop-blur-sm">
            <Vote size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            คู่มือการใช้งานระบบลงคะแนนเสียง
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
            เรียนรู้วิธีการเข้าสู่คูหาเลือกตั้งออนไลน์ ตรวจสอบนโยบาย และลงคะแนนเสียงอย่างถูกต้อง
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] w-full mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
          
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <List className="text-blue-600 dark:text-blue-400" /> สารบัญคู่มือ
            </h2>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl text-sm font-medium">
              <ArrowLeft size={16} /> กลับ
            </button>
          </div>

          <div className="space-y-16">
            
            {/* Step 1 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-xl">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <List size={20} className="text-blue-500" /> การเลือกหัวข้อการเลือกตั้ง
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    เมื่อคุณเข้าสู่หน้า <Link href="/student/election" className="text-blue-600 hover:underline">/student/election</Link> ระบบจะแสดงรายการการเลือกตั้งทั้งหมดที่กำลังเปิดรับการโหวตอยู่ในขณะนี้
                  </p>
                  <ul className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>หากมี <strong>เพียง 1 หัวข้อ</strong> ระบบจะพาคุณเข้าสู่หน้ารายละเอียดทันที</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>หากมี <strong>หลายหัวข้อพร้อมกัน</strong> ระบบจะให้คุณคลิกเลือกการ์ดการเลือกตั้งที่คุณต้องการลงคะแนน</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-xl">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-500" /> ทำความรู้จักผู้สมัครและนโยบาย
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ในหน้ารายละเอียดการเลือกตั้ง คุณสามารถเลื่อนลงเพื่อดูข้อมูลผู้เข้าแข่งขันทั้งหมด:
                  </p>
                  <ul className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>หมายเลข:</strong> ดูหมายเลขผู้สมัครเพื่อป้องกันการลงคะแนนผิดคน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>ชื่อพรรคและสมาชิก:</strong> หากผู้สมัครลงสมัครเป็นทีม (พรรค) คุณสามารถดูรายชื่อสมาชิกและหน้าที่ของพวกเขาได้</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>นโยบาย:</strong> อ่านนโยบายให้ครบถ้วนเพื่อประกอบการตัดสินใจ</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-xl">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Vote size={20} className="text-blue-500" /> ขั้นตอนการลงคะแนน (เข้าคูหา)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    เมื่อตรวจสอบนโยบายพร้อมแล้ว ให้คลิกปุ่มสีน้ำเงิน <strong>"เข้าสู่คูหาลงคะแนน"</strong>
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                    <ol className="list-decimal list-inside space-y-3 text-blue-900 dark:text-blue-200 text-sm font-medium">
                      <li>หน้าจอจะแสดงรายชื่อผู้สมัครพร้อมปุ่ม <strong>"เลือกหมายเลข ..."</strong></li>
                      <li>หรือหากคุณไม่ประสงค์ลงคะแนนให้ใคร สามารถเลือกปุ่ม <strong>"งดออกเสียง"</strong> ได้</li>
                      <li>เมื่อกดเลือกแล้ว ระบบจะมีหน้าต่างแจ้งเตือน <strong>"ยืนยันการลงคะแนน"</strong> เด้งขึ้นมาอีกครั้ง</li>
                      <li>เมื่อกดยืนยันแล้ว <strong className="text-red-500 font-bold underline">จะไม่สามารถแก้ไข หรือยกเลิกได้ในทุกกรณี!</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-xl">4</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-500" /> ความเป็นส่วนตัวและความปลอดภัย
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ระบบถูกออกแบบมาเพื่อรักษาความลับของคะแนนเสียง:
                  </p>
                  <ul className="space-y-3 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <span><strong>ไม่ระบุตัวตนผู้โหวต:</strong> ระบบจะบันทึกเพียงแค่ว่า "คุณใช้สิทธิ์แล้ว" เพื่อป้องกันการลงคะแนนซ้ำ แต่จะไม่บันทึกว่าคุณโหวตให้หมายเลขใด</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <span><strong>โหวตได้ครั้งเดียว:</strong> 1 บัญชีผู้ใช้สามารถใช้สิทธิ์ในแต่ละหัวข้อการเลือกตั้งได้เพียง 1 ครั้งเท่านั้น</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <Link 
              href="/student/election"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg transition-all"
            >
              กลับไปหน้าระบบการเลือกตั้ง
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
