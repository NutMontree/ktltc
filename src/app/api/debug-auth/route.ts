import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const client = await clientPromise;
    const db = client.db('ktltc_db');

    const user = await db.collection('users').findOne({ name: /วันเฉลิม/ });
    const factionPermissions = await db.collection('department_permissions').findOne({ department: user?.faction });
    
    return NextResponse.json({
      sessionUser: session?.user,
      dbUser: user,
      factionPermissions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
