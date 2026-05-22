import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import clientPromise from "@/lib/db";
import VisitorTracker from "./VisitorTracker";
import Image from "next/image";

/**
 * Footer.tsx (Server Component): ส่วนท้ายของเว็บไซต์
 *
 * หน้าที่:
 * 1. แสดงข้อมูลการติดต่อและโลโก้วิทยาลัย
 * 2. แสดงเมนูลิงก์สำคัญที่ดึงมาจากฐานข้อมูล
 * 3. แสดงยอดผู้เข้าชมเว็บไซต์ (Visitor Count)
 * 4. บันทึกสถิติการเข้าชมผ่านคอมโพเนนต์ VisitorTracker
 */

interface NavItem {
  _id: string;
  label: string;
  path: string;
  order: number;
  parentId: string | null;
}

// 1. ฟังก์ชันดึงเมนู Footer จากฐานข้อมูล (Server-side)
// ดึงข้อมูลเดียวกับ Navbar เพื่อให้เมนูอัปเดตพร้อมกัน
async function getFooterNavItems() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const items = await db.collection("navbar").find({}).sort({ order: 1 }).toArray();

    if (!items || items.length === 0) {
      console.warn("⚠️ [Footer] No nav items found in database. Using fallback.");
      return [
        { _id: "f1", label: "หน้าแรก", path: "/", order: 1, parentId: null },
        { _id: "f2", label: "ข่าวประชาสัมพันธ์", path: "/news", order: 2, parentId: null },
        { _id: "f3", label: "ข้อมูลพื้นฐาน", path: "/about", order: 3, parentId: null },
        { _id: "f4", label: "บุคลากร", path: "/personnel", order: 4, parentId: null },
        { _id: "f5", label: "ติดต่อเรา", path: "/contact", order: 5, parentId: null },
      ] as NavItem[];
    }
    return JSON.parse(JSON.stringify(items)) as NavItem[];
  } catch (error) {
    console.error("Error fetching footer nav:", error);
    return [];
  }
}

// 2. ฟังก์ชันดึงยอดผู้เข้าชมล่าสุดมาแสดง
async function getVisitorCount() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("site_stats").findOne({ _id: "visitor_count" as any });

    const rawCount = result?.count;
    let parsed = typeof rawCount === "number" ? rawCount : parseInt(String(rawCount)) || 0;

    // หากค่าเริ่มต้นยังไม่ได้ตั้งค่า หรือต่ำกว่า 127457 ให้ตั้งค่าเป็น 127457 ทันที
    if (parsed < 127457) {
      await db
        .collection("site_stats")
        .updateOne({ _id: "visitor_count" as any }, { $set: { count: 127457 } }, { upsert: true });
      parsed = 127457;
    }

    return parsed;
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return 127457; // ค่า Default กรณีดึงข้อมูลไม่สำเร็จ
  }
}

// --- Main Footer Component ---
export default async function Footer() {
  const navItems = await getFooterNavItems();
  const visitorCount = await getVisitorCount();

  // แปลงยอดผู้เข้าชมเป็นอาร์เรย์ของตัวเลข (เช่น 0127457) เพื่อทำกราฟิกแบบตัวเลขหมุน (แสดงผลเป็น 7 หลัก)
  const countStr = String(visitorCount);
  const countDigits = (countStr.length < 7 ? countStr.padStart(7, "0") : countStr).split("");

  const parents = navItems.filter((item) => !item.parentId);
  const getChildren = (parentId: string) => navItems.filter((item) => item.parentId === parentId);

  return (
    <footer className="bg-linear-to-b from-[#0f172a] to-[#020617] text-slate-300 pt-16 pb-8 border-t border-slate-800 overflow-hidden">
      {/* ส่วนประกอบสำหรับนับยอดผู้เข้าชม (ทำงานฝั่ง Client) */}
      <VisitorTracker />

      <div className="max-w-[1600px] mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-1">
          {/* Column 1: โลโก้และข้อมูลติดต่อ */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-sm">
                <Image src="/images/favicon.ico" alt="KTL Logo" width={48} height={48} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight text-white">KTL-TC</h2>
                <p className="text-[10px] text-slate-400">KANTHARALAK TECHNICAL COLLEGE</p>
              </div>
            </div>

            <div className="text-slate-400 text-sm leading-relaxed">
              82 หมู่ 1 ตำบล จานใหญ่ อำเภอกันทรลักษ์ ศรีสะเกษ 33110
            </div>

            <div className="flex gap-4">
              {/* ลิงก์ Social Media */}
              <SocialIcon
                icon={<FaFacebookF />}
                href="https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh"
              />
              <SocialIcon icon={<FaTwitter />} />
              <SocialIcon icon={<FaInstagram />} />
              <SocialIcon icon={<FaLinkedinIn />} />
            </div>
          </div>

          {/* Columns 2-5: เมนูลิงก์ต่างๆ ที่ดึงจาก DB */}
          {parents.length > 0 ? (
            parents.map((parent) => (
              <div key={parent._id}>
                <h3 className="font-bold text-base mb-6 border-l-2 border-blue-700 pl-3 text-white">
                  {parent.path && parent.path !== "#" ? (
                    <Link href={parent.path} className="hover:text-blue-400 transition-colors">
                      {parent.label}
                    </Link>
                  ) : (
                    parent.label
                  )}
                </h3>

                <ul className="space-y-3 text-sm text-slate-400">
                  {getChildren(parent._id).map((child) => (
                    <FooterLink key={child._id} href={child.path}>
                      {child.label}
                    </FooterLink>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl p-8">
              ยังไม่มีข้อมูลเมนูในระบบ
            </div>
          )}
        </div>

        {/* --- ส่วนแสดงยอดผู้เข้าชม (ตัวเลขสไตล์ Retro/Mechanical) --- */}
        <div className="flex flex-col items-center justify-center mb-8 gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            จำนวนผู้เข้าชมเว็บไซต์
          </span>

          <div className="flex gap-1 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            {countDigits.map((digit: string, index: number) => (
              <div
                key={index}
                className="relative w-8 h-12 md:w-10 md:h-14 bg-linear-to-b from-[#222] to-[#111] rounded border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg"
              >
                {/* ดีไซน์เส้นคั่นกลางตัวเลข */}
                <div className="absolute top-1/2 w-full h-px bg-black/50 z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                <span className="text-2xl md:text-3xl font-mono font-bold text-slate-200 z-0">
                  {digit}
                </span>
                <div className="absolute top-0 w-full h-1/2 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ลิขสิทธิ์และการออกแบบ --- */}
        <div className="pt-8 border-t border-slate-800 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1">
            สงวนลิขสิทธิ์ © {new Date().getFullYear()}.
            <p className="text-blue-500">
              <span>KTLTC</span> /งานศูนย์ข้อมูลและสารสนเทศ
            </p>
          </div>
          <p className="flex items-center gap-1">
            ออกแบบโดย
            <a
              href="https://www.allmaster.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-blue-400 transition-colors ml-1"
            >
              All M Min
            </a>
          </p>
          {/* --- ลิงก์นโยบายต่างๆ --- */}
          <div className="flex items-center gap-4 pt-2">
            <Link href="/service" className="hover:text-slate-300 transition-colors">
              เงื่อนไขการให้บริการ
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/policy" className="hover:text-slate-300 transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * FooterLink: คอมโพเนนต์ย่อยสำหรับลิงก์ใน Footer
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
      >
        {children}
      </Link>
    </li>
  );
}

/**
 * SocialIcon: คอมโพเนนต์ย่อยสำหรับปุ่ม Social Media
 */
function SocialIcon({ icon, href = "#" }: { icon: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      target={href !== "#" ? "_blank" : "_self"}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-blue-700 hover:text-white hover:scale-110 transition-all duration-300 border border-slate-700"
    >
      {icon}
    </a>
  );
}
