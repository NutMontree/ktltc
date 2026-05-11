import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Name): ฟังก์ชันรวม Tailwind CSS Classes
 * 
 * หน้าที่: 
 * - รวม Class หลายๆ ตัวเข้าด้วยกัน (โดยใช้ clsx)
 * - จัดการปัญหา Class ซ้ำซ้อนหรือขัดแย้งกัน (โดยใช้ tailwind-merge)
 *   เช่น ถ้าส่ง 'p-4' และ 'p-8' เข้ามา มันจะเลือก 'p-8' ให้โดยอัตโนมัติ
 * 
 * วิธีใช้: className={cn("p-4 text-white", isTrue && "bg-blue-500")}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}