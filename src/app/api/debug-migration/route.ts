import { NextResponse } from 'next/server';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

function getFileCount(dir: string): { files: number, dirs: number, totalSizeMB: number } {
  let files = 0;
  let dirs = 0;
  let totalSize = 0;

  function recurse(current: string) {
    if (!existsSync(current)) return;
    const stats = statSync(current);
    if (stats.isDirectory()) {
      dirs++;
      readdirSync(current).forEach((child) => {
        recurse(join(current, child));
      });
    } else {
      files++;
      totalSize += stats.size;
    }
  }

  recurse(dir);
  return { files, dirs, totalSizeMB: parseFloat((totalSize / (1024 * 1024)).toFixed(2)) };
}

export async function GET() {
  try {
    const cwd = process.cwd();
    const legacyPath = join(cwd, "\\\\192.168.6.118\\public");
    const localPath = join(cwd, "public");

    const legacyExists = existsSync(legacyPath);
    const localExists = existsSync(localPath);

    const legacyStats = legacyExists ? getFileCount(legacyPath) : null;
    const localStats = localExists ? getFileCount(localPath) : null;

    // Check DB status as well
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ktltc_db";
    let dbStatus = {};
    try {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      const db = client.db();
      const collections = await db.listCollections().toArray();
      const counts: Record<string, number> = {};
      for (const col of collections) {
        counts[col.name] = await db.collection(col.name).countDocuments();
      }
      dbStatus = {
        connected: true,
        database: db.databaseName,
        collections: counts
      };
      await client.close();
    } catch (dbErr: any) {
      dbStatus = {
        connected: false,
        error: dbErr.message
      };
    }

    return NextResponse.json({
      success: true,
      cwd,
      legacyPath,
      legacyExists,
      legacyStats,
      localPath,
      localExists,
      localStats,
      dbStatus
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
