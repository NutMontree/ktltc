import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('ktltc_db');
    const flagpoleRecord = await db.collection('flagpole_attendances').findOne({});
    const userRecord = await db.collection('users').findOne({ role: 'student' });
    
    return NextResponse.json({
      flagpole: flagpoleRecord,
      user: userRecord,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
