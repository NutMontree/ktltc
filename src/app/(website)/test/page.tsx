
import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <span className="text-xl font-bold tracking-wider">M1</span>
        </div>
        <h1 className="text-xl font-semibold text-white">
          หน้าทดสอบระบบ (Test Page)
        </h1>
        <div className="text-sm text-cyan-400 font-medium bg-cyan-950/40 border border-cyan-800/50 py-3 px-4 rounded-xl shadow-inner space-y-1.5">
          <div>ทดสอบการแก้ไขข้อมูลหน้าเว็บผ่าน M1 AI</div>
          <div className="text-xs text-cyan-300/80 border-t border-cyan-800/40 pt-1.5">ทดสอบการทำงาน เทรน M1</div>
          <div className="text-xs text-cyan-300/70 border-t border-cyan-800/30 pt-1.5">ทดสอบการทำงานทดสอบการทำงานระบบ</div>
          <div className="text-xs text-cyan-300/60 border-t border-cyan-800/20 pt-1.5">บรรทัดที่สี่</div>
          <div className="text-xs text-cyan-300/50 border-t border-cyan-800/20 pt-1.5">บรรทัดที่ 5</div>
        </div>
        <p className="text-xs text-slate-500">
          KTLTC Cognitive Agent Engine — Verified & Applied
        </p>
      </div>
    </div>
  );
}
