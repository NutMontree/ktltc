"use client";

import { useEffect, useRef } from "react";

// พจนานุกรมโหมดตัวแม่ (กะเทย)
const kathoeyDict: Record<string, string> = {
  "หน้าแรก": "โฮมเพจตัวแม่",
  "ข่าวประชาสัมพันธ์": "ข่าวเม้าท์มอย",
  "ข่าวสาร": "ข่าวแซ่บๆ",
  "ข้อมูลพื้นฐาน": "ข้อมูลจึ้งๆ",
  "บุคลากร": "ตัวแม่ทั้งหลาย",
  "ผู้บริหาร": "ตัวมัมสุดๆ",
  "ผู้อำนวยการ": "ตัวมารดา",
  "ครูผู้สอน": "แม่พิมพ์เริ่ดๆ",
  "ครู": "ซิส",
  "นักเรียน": "ลูกสาว",
  "นักศึกษา": "ลูกสาวหล่า",
  "ติดต่อเรา": "ทักมาสิคะ",
  "เข้าสู่ระบบ": "ล็อกอินสวยๆ",
  "วิทยาลัย": "สำนักตัวแม่",
  "วิทยาลัยเทคนิค": "สำนักเทคนิคจึ้งๆ",
  "ศูนย์": "แก๊ง",
  "เพิ่มเติม": "ส่องความปังต่อ",
  "รายละเอียด": "ความเริ่ดเพิ่มเติม",
  "ประกาศ": "ประกาศค่าาา",
  "ระบบ": "ความปัง",
  "ดาวน์โหลด": "สูบไฟล์",
  "ยินดีต้อนรับ": "เวลคัมทูความปัง",
  "ค้นหา": "ส่องหา",
  "ตรวจสอบ": "เช็คดูสิคะ",
  "สถานศึกษา": "สำนักประทับทับ",
};

// พจนานุกรมโหมดวัยรุ่น (Gen Z)
const genzDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกชิวๆ",
  "ข่าวประชาสัมพันธ์": "อัปเดตหน่อยดิ",
  "ข่าวสาร": "มีไรอัปเดต",
  "ข้อมูลพื้นฐาน": "ข้อมูลดิบ",
  "บุคลากร": "ชาวแก๊งค์",
  "ผู้บริหาร": "บอส",
  "ผู้อำนวยการ": "บอสใหญ่",
  "ครูผู้สอน": "โค้ช",
  "ครู": "พี่ๆ",
  "นักเรียน": "วัยรุ่น",
  "นักศึกษา": "วัยรุ่นเทสดี",
  "ติดต่อเรา": "ทักแชทดิ",
  "เข้าสู่ระบบ": "ล็อกอิน",
  "วิทยาลัย": "มอ",
  "วิทยาลัยเทคนิค": "เทคนิค",
  "ศูนย์": "แหล่ง",
  "เพิ่มเติม": "ส่องต่อดิ",
  "รายละเอียด": "ดีเทลเพียบ",
  "ประกาศ": "สปอยล์",
  "ระบบ": "ซิสเต็ม",
  "ดาวน์โหลด": "โหลดดิรอไร",
  "ยินดีต้อนรับ": "ว่าไงวัยรุ่น",
  "ค้นหา": "สแกน",
  "ตรวจสอบ": "เช็คดิ",
  "สถานศึกษา": "แหล่งกบดาน",
};

export default function CustomSlangTranslator() {
  const dictionaryRef = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    // 1. ตรวจสอบว่าเปิดโหมด Slang อยู่หรือไม่
    const match = document.cookie.match(/ktltc_slang_mode=([^;]+)/);
    if (!match) return;

    const mode = match[1];
    if (mode === "kathoey") dictionaryRef.current = kathoeyDict;
    else if (mode === "genz") dictionaryRef.current = genzDict;
    else return;

    const dict = dictionaryRef.current;

    // 2. ฟังก์ชันแปลข้อความ (ค้นหาและแทนที่คำ)
    const translateText = (text: string) => {
      let translated = text;
      let changed = false;

      // เราเรียงคำยาวๆ ขึ้นก่อน เพื่อไม่ให้คำสั้นๆ ไปแย่งแทนที่ส่วนหนึ่งของคำยาวๆ
      const keys = Object.keys(dict).sort((a, b) => b.length - a.length);

      for (const key of keys) {
        if (translated.includes(key)) {
          // ใช้ RegExp เปลี่ยนทุกคำที่เจอแบบ Global
          translated = translated.replace(new RegExp(key, "g"), dict[key]);
          changed = true;
        }
      }
      return { translated, changed };
    };

    // 3. ฟังก์ชันเดินสายลุยใน DOM (สแกน Text Nodes ทั้งหมด)
    const walkNode = (node: Node) => {
      // ข้าม Node ที่ไม่ควรอ่าน เช่น Script, Style, Input, Textarea
      if (
        node.nodeName === "SCRIPT" ||
        node.nodeName === "STYLE" ||
        node.nodeName === "NOSCRIPT" ||
        node.nodeName === "INPUT" ||
        node.nodeName === "TEXTAREA"
      ) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (text && text.trim().length > 0) {
          const { translated, changed } = translateText(text);
          if (changed) {
            node.nodeValue = translated;
          }
        }
      } else {
        // Recursive children
        node.childNodes.forEach((child) => walkNode(child));
      }
    };

    // 4. สแกนครั้งแรกเมื่อโหลดเสร็จ
    walkNode(document.body);

    // 5. ติดตั้ง MutationObserver เพื่อจับตาดู Text ที่โหลดขึ้นมาใหม่ (เช่น เวลาเปลี่ยนหน้าแบบ SPA)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            walkNode(node);
          });
        } else if (mutation.type === "characterData") {
          // กรณี Text Node ถูกเปลี่ยนข้อความ เราก็ต้องแปลซ้ำ
          const node = mutation.target;
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue || "";
            // ป้องกัน infinite loop โดยเช็คก่อนว่าแปลไปแล้วหรือยัง
            let isAlreadyTranslated = false;
            for (const val of Object.values(dict)) {
              if (text.includes(val)) {
                isAlreadyTranslated = true;
                break;
              }
            }
            if (!isAlreadyTranslated) {
              const { translated, changed } = translateText(text);
              if (changed) {
                node.nodeValue = translated;
              }
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // Component นี้ไม่มี UI ของตัวเอง แค่แอบทำงานเงียบๆ
}
