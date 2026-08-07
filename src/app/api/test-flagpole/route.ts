import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const totalStudentsCount = await db.collection("users").countDocuments({ role: "student", isActive: { $ne: false } });
    const internshipStudentsCount = await db.collection("users").countDocuments({ 
      role: "student", 
      isInternship: { $in: [true, "true"] },
      isActive: { $ne: false }
    });

    return NextResponse.json({
      success: true,
      totalStudentsCount,
      internshipStudentsCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
