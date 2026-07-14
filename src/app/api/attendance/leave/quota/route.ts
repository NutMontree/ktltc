import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Fixed Quotas per year (in days)
const QUOTAS = {
  sick: 30, // ลาป่วย
  personal: 15, // ลากิจส่วนตัว
  paternity: 15, // ลาช่วยเหลือภริยาที่คลอดบุตร
  maternity: 98, // ลาคลอด
  ordination: 120, // ลาอุปสมบท
  official: 999, // ไปราชการ
  other: 999 // อื่นๆ
};

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await import("@/lib/db").then(m => m.default);
    const db = client.db("ktltc_db");

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Fetch approved/pending leaves for strict balance reduction
    const leaves = await db.collection("leave_requests").find({
      userId: new ObjectId(userId),
      startDate: { $gte: startOfYear, $lte: endOfYear },
      status: { $in: ["approved", "pending"] }
    }).toArray();

    // Calculate usage
    const usage = { 
      sick: 0, 
      personal: 0, 
      paternity: 0, 
      maternity: 0, 
      ordination: 0, 
      official: 0, 
      other: 0 
    };

    leaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (leave.leaveType in usage) {
        usage[leave.leaveType as keyof typeof usage] += diffDays;
      }
    });

    const quotas = Object.keys(QUOTAS).reduce((acc: any, key) => {
      const type = key as keyof typeof QUOTAS;
      acc[type] = {
        total: QUOTAS[type],
        used: usage[type],
        remaining: type === "other" ? 999 : Math.max(0, QUOTAS[type] - usage[type])
      };
      return acc;
    }, {});

    return NextResponse.json({ success: true, quotas }, { status: 200 });

  } catch (error: any) {
    console.error("Quota API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
