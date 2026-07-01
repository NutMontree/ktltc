"use client";

import { ArrowLeft, BookOpen, Settings, Users, Plus, Layout, UserPlus, CheckCircle2, List, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ElectionAdminManual() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1000px] w-full mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner backdrop-blur-sm">
            <BookOpen size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            คู่มือการใช้งานระบบจัดการการเลือกตั้ง
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl">
            เรียนรู้วิธีการสร้างการเลือกตั้ง เพิ่มผู้สมัคร และจัดการผลการลงคะแนนแบบเรียลไทม์
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] w-full mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">

          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <List className="text-indigo-600 dark:text-indigo-400" /> สารบัญคู่มือ
            </h2>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl text-sm font-medium">
              <ArrowLeft size={16} /> กลับ
            </button>
          </div>

          <div className="space-y-16">

            {/* Step 1 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-500" /> การสร้างการเลือกตั้งใหม่
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ไปที่หน้า <strong>"จัดการการเลือกตั้ง"</strong> และคลิกปุ่ม <strong>"สร้างการเลือกตั้ง"</strong> จากนั้นกรอกข้อมูลดังต่อไปนี้:
                  </p>
                  <ul className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>หัวข้อการเลือกตั้ง:</strong> เช่น "เลือกตั้งประธานชมรมปี 2569"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>รายละเอียด:</strong> อธิบายจุดประสงค์สั้นๆ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span><strong>เวลาเปิด-ปิดโหวต:</strong> ระบบจะเปิดรับคะแนนอัตโนมัติตามเวลาที่กำหนดไว้ และหลังจากปิดโหวตจะแสดงสถานะ "ปิดแล้ว"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <UserPlus size={20} className="text-indigo-500" /> การจัดการผู้สมัครและพรรคการเมือง
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    หลังจากสร้างการเลือกตั้งแล้ว ให้คลิกปุ่ม <strong>"แก้ไข"</strong> ที่การ์ดการเลือกตั้งนั้นเพื่อเข้าไปเพิ่มรายชื่อผู้สมัคร โดยระบบมีฟังก์ชันดึงรายชื่อจากระบบอัตโนมัติ:
                  </p>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 text-sm uppercase tracking-wide">ขั้นตอนการเพิ่มผู้สมัคร</h4>
                    <ol className="list-decimal list-inside space-y-2 text-indigo-800 dark:text-indigo-200 text-sm">
                      <li>คลิก "เพิ่มผู้ลงสมัครรับเลือกตั้ง"</li>
                      <li>ใช้กล่องค้นหา <strong>"ดึงข้อมูลจากระบบ"</strong> เพื่อค้นหาชื่อ แผนก หรือห้อง ของผู้ใช้ในระบบ เมื่อคลิกเลือก ระบบจะกรอกชื่อและอัปโหลดรูปให้โดยอัตโนมัติ (หากมี)</li>
                      <li>กรอกหมายเลขผู้สมัคร และ ชื่อพรรค (ถ้ามี)</li>
                      <li>กรอกนโยบายเพื่อให้ผู้ลงคะแนนอ่าน</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Users size={20} className="text-indigo-500" /> การเพิ่มรายชื่อ "สมาชิกพรรค"
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ในกรณีที่เป็นการลงสมัครแบบทีมหรือพรรค คุณสามารถเพิ่มสมาชิกได้ไม่จำกัด:
                  </p>
                  <ul className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>ในแบบฟอร์มเพิ่มผู้สมัคร เลื่อนลงมาที่หัวข้อ <strong>"สมาชิกพรรค"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>คลิกปุ่ม <strong>"เพิ่มสมาชิกพรรค"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>คุณสามารถใช้กล่องค้นหาเพื่อดึงชื่อสมาชิกจากในระบบได้เช่นเดียวกัน หรือจะพิมพ์กรอกเองก็ได้</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>ระบุ <strong>ตำแหน่งหน้าที่</strong> (เช่น รองประธาน, เหรัญญิก)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">4</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Layout size={20} className="text-indigo-500" /> การดูผลคะแนนแบบเรียลไทม์
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ภายในหน้าจัดการผู้สมัคร (กดปุ่มแก้ไขจากการ์ดเลือกตั้ง) จะมีแท็บด้านบนให้เลือกสลับไปที่ <strong>"ดูผลคะแนน (Realtime)"</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
                    หน้านี้จะแสดงกราฟแท่งสรุปผลคะแนนรวม และผู้ที่ได้คะแนนสูงสุด พร้อมตัวเลขอนิเมชันที่จะปรับเปลี่ยนแบบสดๆ เมื่อมีคนลงคะแนนเข้ามาในระบบ
                  </p>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">5</div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                    <Trash2 size={20} /> การลบและการแก้ไขสถานะ
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    ข้อควรระวังในการแก้ไขหรือลบการเลือกตั้ง:
                  </p>
                  <ul className="space-y-3 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                      <span>หากกดลบการเลือกตั้ง <strong>ข้อมูลผู้สมัคร และ ผลโหวตทั้งหมด</strong> ที่เกี่ยวข้องกับการเลือกตั้งนั้นจะถูกลบออกจากระบบอย่างถาวร ไม่สามารถกู้คืนได้</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                      <span>สถานะของการเลือกตั้งจะควบคุมอัตโนมัติด้วย <strong>วันเวลาเปิด-ปิดโหวต</strong> หากต้องการระงับการโหวต ให้เข้าไปแก้ไขวันเวลาปิดโหวตให้เป็นเวลาปัจจุบันหรืออดีต</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <Link
              href="/dashboard/election"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg transition-all"
            >
              กลับไปหน้าจัดการการเลือกตั้ง
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
