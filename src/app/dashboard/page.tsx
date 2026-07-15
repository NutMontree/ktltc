import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getCachedDashboardStats, getCachedMenus, getCachedPermissions } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session?.user?.role || "").toLowerCase();
  const isStudent = ["student", "user"].includes(userRole);

  // Fetch data in parallel on the server
  const [stats, customMenus, permissions] = await Promise.all([
    isStudent ? { isStudentEmptyStats: true } : getCachedDashboardStats(userRole),
    getCachedMenus(),
    getCachedPermissions(userRole)
  ]);

  return (
    <DashboardClient 
      initialStats={stats} 
      initialCustomMenus={customMenus} 
      initialPermissions={permissions} 
      isStudent={isStudent} 
    />
  );
}
