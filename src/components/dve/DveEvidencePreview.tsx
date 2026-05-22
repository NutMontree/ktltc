"use client";

import { ExternalLink, FileText } from "lucide-react";
import {
  getDveEvidenceFileName,
  getDveEvidenceLabel,
  isDveEvidenceImage,
} from "@/lib/dve/evidence-file";

type DveEvidencePreviewProps = {
  url: string;
  imgClassName?: string;
  compact?: boolean;
};

/** แสดงตัวอย่างหลักฐาน: รูป thumbnail หรือลิงก์เปิด PDF/Word */
export function DveEvidencePreview({
  url,
  imgClassName = "w-14 h-14 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700",
  compact = false,
}: DveEvidencePreviewProps) {
  if (isDveEvidenceImage(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title="เปิดหลักฐานคะแนน" className="shrink-0">
        <img src={url} alt="หลักฐานคะแนน" className={imgClassName} />
      </a>
    );
  }

  const label = getDveEvidenceLabel(url);
  const fileName = getDveEvidenceFileName(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`เปิดไฟล์ ${label}`}
      className={`shrink-0 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
        compact ? "px-2.5 py-2 max-w-[140px]" : "px-3 py-2.5 max-w-full"
      }`}
    >
      <FileText className="w-5 h-5 text-rose-500 shrink-0" />
      <span className="min-w-0 flex flex-col text-left leading-tight">
        <span className="text-[10px] font-black text-zinc-500 uppercase">{label}</span>
        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{fileName}</span>
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
    </a>
  );
}
