"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSession } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

import { Activity, FileText, BarChart2, Edit, Settings, Layout } from "lucide-react";

// Removed unused menuGroups constant

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const [customMenus, setCustomMenus] = useState<any[]>([]);
  const { data: session } = useSession();
  const permissions = (session?.user as any)?.permissions || {};

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/admin/menus");
        if (res.ok) {
          const data = await res.json();
          const sidebarMenus = data.menus?.filter((m: any) => 
            m.displayIn === "both" || m.displayIn === "sidebar" || m.displayIn === "navbar" || !m.displayIn
          ) || [];
          setCustomMenus(sidebarMenus);
        }
      } catch (err) {
        console.error("Failed to fetch sidebar custom menus", err);
      }
    };
    fetchMenus();
  }, []);

  const mainMenuItems = [
    { icon: <Activity size={18} />, label: "ระบบติดตาม PDCA", route: "/pdca" },
    { icon: <FileText size={18} />, label: "บันทึกข้อความทั่วไป", route: "/GeneralMemoPage" },
  ];

  const otherMenuItems = [
    { icon: <BarChart2 size={18} />, label: "Chart Analytics", route: "/chart" },
    { icon: <Edit size={18} />, label: "แก้ไขหัวข้อฟอร์ม", route: "/form-editor" },
    { icon: <Settings size={18} />, label: "ตั้งค่าระบบภายใน", route: "/internal-form-editor" },
  ];

  const dynamicMenuGroups = [
    {
      name: "เมนูหลัก",
      menuItems: mainMenuItems,
    },
    ...(otherMenuItems.length > 0 ? [{
      name: "อื่น ๆ",
      menuItems: otherMenuItems,
    }] : []),
    ...(customMenus.length > 0
      ? [
          {
            name: "เมนูเพิ่มเติม (Custom)",
            menuItems: customMenus
              .filter((m) => permissions[m.permissionKey] || !m.permissionKey)
              .map((m) => ({
                icon: <Layout size={18} className="text-amber-500" />,
                label: m.title,
                route: m.href,
              })),
          },
        ]
      : []),
  ];

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-[80px] z-40 flex h-[calc(100vh-80px)] w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-5 px-4 pt-24 lg:pt-9 lg:px-6">
            {dynamicMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem: any, menuIndex: number) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
