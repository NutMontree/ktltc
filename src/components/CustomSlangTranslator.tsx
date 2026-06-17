"use client";

import { useEffect, useRef } from "react";

// 1. พี่กะเทย (LGBTQ+ / ตัวมัม)
const kathoeyDict: Record<string, string> = {
  "หน้าแรก": "โฮมเพจตัวแม่",
  "หน้าหลัก": "โฮมเพจตัวมัม",
  "ข่าวประชาสัมพันธ์": "ข่าวเม้าท์มอย",
  "ข่าวสาร": "ข่าวแซ่บๆ",
  "ข้อมูลพื้นฐาน": "ข้อมูลจึ้งๆ",
  "บุคลากร": "ตัวแม่ทั้งหลาย",
  "ผู้บริหาร": "ตัวมัมระดับสูง",
  "ผู้อำนวยการ": "ตัวมารดา",
  "ครูผู้สอน": "แม่พิมพ์เริ่ดๆ",
  "ครู": "ซิส",
  "นักเรียน": "ลูกสาว",
  "นักศึกษา": "ลูกสาวหล่า",
  "ติดต่อเรา": "ทักมาสิคะ",
  "เข้าสู่ระบบ": "ล็อกอินสวยๆ",
  "ออกจากระบบ": "เชิดใส่ออกระบบ",
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
  "สวยมาก": "สวยจึ้ง สวยตะโกน",
  "บันทึกข้อมูล": "เซฟความปัง",
  "ยืนยัน": "คอนเฟิร์มค่ะมัม",
  "ยกเลิก": "เท!",
};

// 2. วัยรุ่น Gen Y / Gen Z
const genzDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกชิวๆ",
  "หน้าหลัก": "หน้าหลักงับ",
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
  "เข้าสู่ระบบ": "ล็อกอินแพร๊บ",
  "ออกจากระบบ": "ไปละบาย",
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
  "บันทึกข้อมูล": "เซฟแง้ว",
  "ยืนยัน": "จัดไป",
  "ยกเลิก": "ปัดตก",
};

// 3. ภาษาถิ่น: อีสาน
const isanDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกเด้อ",
  "หน้าหลัก": "หน้าหลักจ้า",
  "ข่าวประชาสัมพันธ์": "ข่าวบอกต่อ",
  "ข่าวสาร": "ข่าวคราว",
  "ข้อมูลพื้นฐาน": "ข้อมูลเบื้องต้นเด้อ",
  "บุคลากร": "หมู่เฮา",
  "ผู้บริหาร": "ผู้ใหญ่",
  "ผู้อำนวยการ": "ผอ. เพิ่น",
  "ครูผู้สอน": "คุณครูเด้อ",
  "ครู": "ครูบา",
  "นักเรียน": "นักฮียน",
  "นักศึกษา": "ผู้สาวผู้บ่าว",
  "ติดต่อเรา": "ทักมาเด้อ",
  "เข้าสู่ระบบ": "เข้าระบบโลด",
  "ออกจากระบบ": "ออกระบบเด้อ",
  "วิทยาลัย": "วิทยาลัยเฮา",
  "วิทยาลัยเทคนิค": "เทคนิคเฮา",
  "ศูนย์": "ศูนย์รวม",
  "เพิ่มเติม": "เบิ่งต่อ",
  "รายละเอียด": "รายละเอียดเด้อ",
  "ประกาศ": "บอกให้ฮู้",
  "ระบบ": "ระบบเฮา",
  "ดาวน์โหลด": "โหลดโลด",
  "ยินดีต้อนรับ": "ยินดีต้อนรับเด้อจ้า",
  "ค้นหา": "หาเบิ่ง",
  "ตรวจสอบ": "กวดเบิ่ง",
  "สถานศึกษา": "ม่องเฮียน",
  "สวยมาก": "งามคักๆ",
  "บันทึกข้อมูล": "บันทึกไว้เด้อ",
  "ยืนยัน": "คักอีหลี ยืนยัน",
  "ยกเลิก": "ยกเลิกซะ",
};

// 4. ภาษาถิ่น: เหนือ
const northernDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกเจ้า",
  "หน้าหลัก": "หน้าหลักเน้อ",
  "ข่าวประชาสัมพันธ์": "ข่าวสารเจ้า",
  "บุคลากร": "จาวเฮา",
  "ผู้อำนวยการ": "เปิ้นผอ.",
  "ครู": "ป้อครูแม่ครู",
  "นักเรียน": "ละอ่อน",
  "นักศึกษา": "นักศึกษาเจ้า",
  "ติดต่อเรา": "อู้จาเจ้า",
  "เข้าสู่ระบบ": "เข้าระบบเจ้า",
  "ออกจากระบบ": "ปิ๊กละเน้อ",
  "ยินดีต้อนรับ": "ยินดีต้อนฮับเจ้า",
  "ค้นหา": "เซาะหา",
  "สวยมาก": "งามขนาด",
  "บันทึกข้อมูล": "บันทึกเน้อ",
  "ยืนยัน": "แม่นแต้ ยืนยันเจ้า",
};

// 5. ภาษาถิ่น: ใต้
const southernDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกนิ",
  "หน้าหลัก": "หน้าหลักเห้อ",
  "ข่าวประชาสัมพันธ์": "ข่าวหรอยๆ",
  "ครู": "ครูเห้อ",
  "นักเรียน": "เด็กหรอย",
  "ติดต่อเรา": "ทักมาต๊ะ",
  "เข้าสู่ระบบ": "เข้าระบบต๊ะ",
  "ออกจากระบบ": "หลบละนิ",
  "ยินดีต้อนรับ": "ยินดีต้อนรับนิ",
  "ค้นหา": "หาแล",
  "สวยมาก": "สวยหนัด",
  "บันทึกข้อมูล": "เซฟไว้เลย",
  "ยืนยัน": "หรอยจัง ยืนยัน",
};

// 6. ทางการ (Formal / ราชการ)
const formalDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกระบบสารสนเทศ",
  "หน้าหลัก": "หน้าหลักการดำเนินงาน",
  "เข้าสู่ระบบ": "เข้าสู่ระบบสารสนเทศ",
  "ออกจากระบบ": "ออกจากระบบสารสนเทศ",
  "บันทึกข้อมูล": "บันทึกข้อมูลเข้าสู่ระบบ",
  "ยกเลิก": "ยกเลิกการทำรายการ",
  "ยืนยัน": "ยืนยันการทำรายการ",
  "ยินดีต้อนรับ": "ขอต้อนรับเข้าสู่ระบบ",
  "ค้นหา": "สืบค้นข้อมูล",
};

// 7. สุภาพ / ธุรกิจ (Professional)
const profDict: Record<string, string> = {
  "หน้าแรก": "หน้าหลักเว็บ",
  "หน้าหลัก": "ภาพรวมระบบ (Dashboard)",
  "เข้าสู่ระบบ": "ลงชื่อเข้าใช้",
  "ออกจากระบบ": "ลงชื่อออก",
  "บันทึกข้อมูล": "บันทึกรายการ",
  "ยกเลิก": "ยกเลิกรายการ",
  "ยืนยัน": "ยืนยันการทำรายการ",
  "ยินดีต้อนรับ": "ยินดีต้อนรับครับ/ค่ะ",
};

// 8. ไอดอลสาว (Cute / Idol)
const idolDict: Record<string, string> = {
  "หน้าแรก": "หน้าแรกของเค้า",
  "หน้าหลัก": "หน้าหลักของเตง",
  "เข้าสู่ระบบ": "เข้าสู่ระบบนะคะเตง",
  "ออกจากระบบ": "ไปก่อนน้าา",
  "บันทึกข้อมูล": "เซฟข้อมูลแย้ว",
  "ยกเลิก": "ไม่เอาแย้ว",
  "ยืนยัน": "โอเคค๊าาา",
  "ยินดีต้อนรับ": "ยินดีต้อนรับนะคะคนเก่ง",
  "ค้นหา": "หาดูน้า",
  "ข่าวประชาสัมพันธ์": "ข่าวสารคนเก่ง",
  "นักเรียน": "คนเก่ง",
  "นักศึกษา": "ตัวเอง",
};

// 9. โค้ชความรัก (Love Coach)
const lovecoachDict: Record<string, string> = {
  "หน้าแรก": "จุดเริ่มต้นของการเดินทาง",
  "หน้าหลัก": "ศูนย์กลางของหัวใจ",
  "เข้าสู่ระบบ": "เปิดประตูหัวใจ",
  "ออกจากระบบ": "ปล่อยวางเพื่อไปต่อ",
  "บันทึกข้อมูล": "เก็บความทรงจำนี้ไว้",
  "ยกเลิก": "เรียนรู้ที่จะปฏิเสธ",
  "ยืนยัน": "เชื่อมั่นในการตัดสินใจ",
  "ยินดีต้อนรับ": "ยินดีต้อนรับสู่พื้นที่ปลอดภัย",
  "ข่าวประชาสัมพันธ์": "เสียงกระซิบจากหัวใจ",
  "ค้นหา": "ค้นหาสิ่งที่หัวใจต้องการ",
};

// 10. สไตล์พระเทศน์ (Monk)
const monkDict: Record<string, string> = {
  "หน้าแรก": "อารามแรก",
  "หน้าหลัก": "อารามหลัก",
  "เข้าสู่ระบบ": "เข้าสู่ร่มกาสาวพัสตร์",
  "ออกจากระบบ": "ลาสิกขา",
  "บันทึกข้อมูล": "จดจำไว้ในสติ",
  "ยกเลิก": "ละทิ้งกิเลส",
  "ยืนยัน": "สาธุ",
  "ยินดีต้อนรับ": "เจริญพรต้อนรับโยม",
  "ข่าวประชาสัมพันธ์": "ธรรมเทศนา",
  "ค้นหา": "แสวงหาปัญญา",
  "บุคลากร": "พระภิกษุ",
  "ผู้บริหาร": "เจ้าอาวาส",
};

// 11. แปลเป็น Emoji
const emojiDict: Record<string, string> = {
  "หน้าแรก": "🏠",
  "หน้าหลัก": "🏠",
  "เข้าสู่ระบบ": "🔑➡️",
  "ออกจากระบบ": "⬅️🚪",
  "บันทึกข้อมูล": "💾",
  "ยกเลิก": "❌",
  "ยืนยัน": "✅",
  "ยินดีต้อนรับ": "👋💖",
  "ค้นหา": "🔍",
  "ตั้งค่า": "⚙️",
};

export const AVAILABLE_SLANG_MODES = [
  { id: "normal", label: "🇹🇭 ภาษาไทยปกติ", group: "มาตรฐาน" },
  { id: "formal", label: "🏛️ ทางการ (ราชการ)", group: "มาตรฐาน" },
  { id: "prof", label: "💼 สุภาพ / ธุรกิจ", group: "มาตรฐาน" },
  { id: "kathoey", label: "💅 พี่กะเทย / LGBTQ+", group: "สีสันและยุคสมัย" },
  { id: "genz", label: "🛹 วัยรุ่น Gen Z", group: "สีสันและยุคสมัย" },
  { id: "idol", label: "✨ ไอดอลสาวน่ารัก", group: "สีสันและยุคสมัย" },
  { id: "isan", label: "🌶️ ภาษาอีสาน", group: "ภาษาถิ่น" },
  { id: "northern", label: "⛰️ ภาษาเหนือ", group: "ภาษาถิ่น" },
  { id: "southern", label: "🌊 ภาษาใต้", group: "ภาษาถิ่น" },
  { id: "lovecoach", label: "❤️ โค้ชความรัก", group: "รูปแบบพิเศษ" },
  { id: "monk", label: "🙏 สไตล์พระเทศน์", group: "รูปแบบพิเศษ" },
  { id: "emoji", label: "😀 โหมด Emoji", group: "รูปแบบพิเศษ" },
];

export default function CustomSlangTranslator() {
  const dictionaryRef = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    // 1. ตรวจสอบว่าเปิดโหมด Slang อยู่หรือไม่
    let match = document.cookie.match(/ktltc_slang_mode=([^;]+)/);
    
    // ตรวจสอบจาก localStorage เผื่อไว้ (กรณี set ผ่าน switcher)
    const localMode = localStorage.getItem("ktltc_slang_mode");
    const mode = (match ? match[1] : localMode) || "normal";
    
    // ถ้าเพิ่ง set ใน local แต่ยังไม่มีใน cookie ให้ซิงค์
    if (localMode && !match) {
      document.cookie = `ktltc_slang_mode=${localMode}; path=/; max-age=31536000`;
    }

    if (mode === "kathoey") dictionaryRef.current = kathoeyDict;
    else if (mode === "genz") dictionaryRef.current = genzDict;
    else if (mode === "isan") dictionaryRef.current = isanDict;
    else if (mode === "northern") dictionaryRef.current = northernDict;
    else if (mode === "southern") dictionaryRef.current = southernDict;
    else if (mode === "formal") dictionaryRef.current = formalDict;
    else if (mode === "prof") dictionaryRef.current = profDict;
    else if (mode === "idol") dictionaryRef.current = idolDict;
    else if (mode === "lovecoach") dictionaryRef.current = lovecoachDict;
    else if (mode === "monk") dictionaryRef.current = monkDict;
    else if (mode === "emoji") dictionaryRef.current = emojiDict;
    else return; // normal mode หรือไม่ตรงกับเงื่อนไข ไม่ต้องแปล

    const dict = dictionaryRef.current;
    if (!dict) return;

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

    // 4. สแกนครั้งแรกเมื่อโหลดเสร็จ (ใส่ setTimeout เล็กน้อยเพื่อให้ DOM เรนเดอร์ครบก่อน)
    setTimeout(() => {
      walkNode(document.body);
    }, 100);

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
