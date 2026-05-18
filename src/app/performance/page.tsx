import React from "react";
import { Folder, ExternalLink } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/5 dark:hover:bg-zinc-900/10 transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 shrink-0">
              <Folder size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                เผยแพร่ผลงานวิจัย/วิชาการ
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                แหล่งรวบรวมและเผยแพร่ผลงานวิจัย นวัตกรรม และผลงานทางวิชาการของบุคลากร วิทยาลัยเทคนิคกันทรลักษ์
              </p>
            </div>
          </div>
          <a
            href="/dashboard/drive?folderId=6a0a91550f09681854ea47d7"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors py-1.5 px-3 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800"
          >
            <span>เปิดโฟลเดอร์ผลงาน</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

