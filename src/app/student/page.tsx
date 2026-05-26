"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import StudentDashboardSection from "@/components/dashboard/StudentDashboardSection";
import { LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const studentName = session?.user?.name || "นักศึกษา";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            ยินดีต้อนรับ, {studentName}
          </h1>
          <p className="mt-2 text-gray-600">เลือกระบบที่คุณต้องการใช้งาน</p>
        </div>

        {/* Main Dashboard */}
        <StudentDashboardSection
          title="ระบบหลักของนักศึกษา"
          subtitle="เข้าใช้งานระบบสำคัญของสถาบัน"
          icon="📚"
        />
        <StudentDashboard className="mb-12" />

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            ต้องการความช่วยเหลือ?{" "}
            <Link href="/contact" className="font-semibold text-blue-600 hover:text-blue-700">
              ติดต่อเรา
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
