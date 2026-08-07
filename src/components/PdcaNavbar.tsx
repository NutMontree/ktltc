"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, BarChart2, Edit, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

const PdcaNavbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const permissions = (session?.user as any)?.permissions || {};

  const navItems = [
    ...(permissions.access_pdca ? [{ name: "ระบบติดตาม PDCA", href: "/pdca", icon: <Activity className="w-5 h-5" /> }] : []),
    ...(permissions.access_general_memo ? [{ name: "บันทึกข้อความทั่วไป", href: "/GeneralMemoPage", icon: <FileText className="w-5 h-5" /> }] : []),
    ...(permissions.access_chart_analytics ? [{ name: "Chart Analytics", href: "/chart", icon: <BarChart2 className="w-5 h-5" /> }] : []),
    ...(permissions.access_form_editor ? [{ name: "แก้ไขหัวข้อฟอร์ม", href: "/form-editor", icon: <Edit className="w-5 h-5" /> }] : []),
    ...(permissions.access_internal_form_editor ? [{ name: "ตั้งค่าระบบภายใน", href: "/internal-form-editor", icon: <Settings className="w-5 h-5" /> }] : []),
  ];

  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-stroke dark:bg-boxdark dark:border-strokedark">
      <div className="flex flex-wrap gap-2 md:gap-4 items-center">
        <div className="mr-4 hidden md:flex items-center gap-2 border-r pr-4 border-stroke dark:border-strokedark">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
               <Activity className="w-6 h-6" />
            </div>
            <span className="font-black text-lg text-black dark:text-white uppercase tracking-wider">PDCA System</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/30 scale-[1.02]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PdcaNavbar;
