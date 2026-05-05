import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const users = await db.collection("users").find({}).limit(5).project({ username: 1, isActive: 1, role: 1 }).toArray();
    const count = await db.collection("users").countDocuments();
    const recentLogs = await db.collection("logs").find({ action: "LOGIN_FAILED" }).sort({ createdAt: -1 }).limit(10).toArray();

    return NextResponse.json({ total: count, users, recentLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
