"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  HomeIcon,
  LayoutDashboard,
  MessageCircle,
  Folder,
  Flag,
  GraduationCap,
  Briefcase
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from './motion-primitives/dock';

const iconClass = "h-full w-full text-neutral-600 dark:text-neutral-300";

export function AppleStyleDock() {
  const { data: session } = useSession();
  
  // ตรวจสอบ role โดยถ้าไม่มี session หรือไม่มี role จะถือว่าเป็นผู้ใช้งานทั่วไป ("user" หรือ "")
  const role = (session?.user as any)?.role || "";
  
  const isGeneralUser = !session || role === "user" || role === "";
  const isStudent = role === "student";
  const isTeacher = role === "teacher";

  const dockItems = [];

  // ปุ่ม 1: Home
  dockItems.push({
    title: 'Home',
    icon: <HomeIcon className={iconClass} />,
    href: '/',
  });

  // ปุ่ม 2: Dashboard (แสดงทุกคนยกเว้นผู้ใช้งานทั่วไป)
  if (!isGeneralUser) {
    dockItems.push({
      title: 'Dashboard',
      icon: <LayoutDashboard className={iconClass} />,
      href: '/dashboard',
    });
  }

  // ปุ่ม 3: ระบบแชท / กล่องข้อความ (แสดงทุกคนยกเว้นผู้ใช้งานทั่วไป)
  if (!isGeneralUser) {
    dockItems.push({
      title: 'ระบบแชท',
      icon: <MessageCircle className={iconClass} />,
      href: '/dashboard/chat',
    });
  }

  // ปุ่ม 4: คลังไฟล์งาน (แสดงทุกคน ยกเว้นนักเรียน และผู้ใช้งานทั่วไป)
  if (!isGeneralUser && !isStudent) {
    dockItems.push({
      title: 'คลังไฟล์งาน',
      icon: <Folder className={iconClass} />,
      href: '/dashboard/drive',
    });
  }

  // ปุ่ม 5: เช็คชื่อกิจกรรมเสาธง (แสดงแค่นักเรียน)
  if (isStudent) {
    dockItems.push({
      title: 'กิจกรรมเสาธง',
      icon: <Flag className={iconClass} />,
      href: '/student/flagpole',
    });
  }

  // ปุ่ม 6: DVE นักเรียน (แสดงแค่นักเรียน)
  if (isStudent) {
    dockItems.push({
      title: 'DVE นักเรียน',
      icon: <GraduationCap className={iconClass} />,
      href: '/dashboard/dve',
    });
  }

  // ปุ่ม 7: DVE ครู (แสดงแค่ครู)
  if (isTeacher) {
    dockItems.push({
      title: 'DVE ครู',
      icon: <Briefcase className={iconClass} />,
      href: '/dashboard/dve',
    });
  }

  return (
    <div className='print:hidden fixed bottom-1 left-1/2 z-50 max-w-full -translate-x-1/2'>
      {/* แก้ไข class 'pb-' กลับเป็น 'pb-2' เพื่อให้ไม่ Error และวงกลมไม่โดนตัด */}
      <Dock className='items-end pb-2' panelHeight={56} magnification={64} distance={100}>
        {dockItems.map((item, idx) => (
          <Link key={idx} href={item.href}>
            <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 cursor-pointer'>
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          </Link>
        ))}
      </Dock>
    </div>
  );
}
