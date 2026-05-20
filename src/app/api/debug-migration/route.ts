import { NextResponse } from 'next/server';
import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';

export const dynamic = 'force-dynamic';

function getDirectoryFiles(dir: string): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return [];
  
  const list = readdirSync(dir);
  list.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getDirectoryFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

export async function GET() {
  const reports: any = {};
  
  try {
    const cwd = process.cwd();
    reports.cwd = cwd;

    // Detect all folders in root that look like our network path
    const rootItems = readdirSync(cwd);
    reports.rootFolders = rootItems.filter(item => {
      try {
        return statSync(join(cwd, item)).isDirectory() && (item.includes('192.168') || item.includes('public'));
      } catch (e) {
        return false;
      }
    });

    // 1. Identify the exact folder name
    // On Linux, the folder name could literally be "\\192.168.6.118\public"
    const legacyFolderCandidates = [
      join(cwd, "\\\\192.168.6.118\\public"),
      join(cwd, "\\192.168.6.118\\public"),
      join(cwd, "192.168.6.118", "public")
    ];

    let sourceDir = "";
    for (const cand of legacyFolderCandidates) {
      if (existsSync(cand)) {
        sourceDir = cand;
        break;
      }
    }

    // Try finding by exact directory name in rootItems
    if (!sourceDir) {
      const matchedName = rootItems.find(item => item.replace(/\\/g, '').includes('192.168.6.118public'));
      if (matchedName) {
        sourceDir = join(cwd, matchedName);
      }
    }

    reports.detectedSourceDir = sourceDir;
    reports.sourceExists = !!sourceDir;

    const targetDir = join(cwd, "public");
    reports.targetDir = targetDir;
    reports.targetExists = existsSync(targetDir);

    if (sourceDir && existsSync(sourceDir)) {
      const sourceFiles = getDirectoryFiles(sourceDir);
      reports.totalSourceFiles = sourceFiles.length;
      reports.sampleSourceFiles = sourceFiles.slice(0, 10).map(f => f.replace(cwd, ""));

      // Let's run a manual copy/migration of these files right now!
      let copiedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (const srcFile of sourceFiles) {
        try {
          const relativePath = srcFile.replace(sourceDir, "");
          const destFile = join(targetDir, relativePath);

          if (!existsSync(destFile) || statSync(srcFile).size !== statSync(destFile).size) {
            const destDir = dirname(destFile);
            if (!existsSync(destDir)) {
              mkdirSync(destDir, { recursive: true });
            }
            copyFileSync(srcFile, destFile);
            copiedCount++;
          } else {
            skippedCount++;
          }
        } catch (e: any) {
          errors.push(`${srcFile}: ${e.message}`);
        }
      }

      reports.copiedCount = copiedCount;
      reports.skippedCount = skippedCount;
      reports.errors = errors;
    } else {
      reports.error = "No legacy source directory detected. Files might have already been moved or the folder name format is different.";
    }

    // --- DB Inspection ---
    try {
      const client = await (await import('@/lib/db')).default;
      const db = client.db("ktltc_db");
      const collections = await db.listCollections().toArray();
      const dbReport: any = {};
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        dbReport[col.name] = count;
      }
      reports.databaseCollections = dbReport;
    } catch (dbErr: any) {
      reports.databaseError = dbErr.message;
    }

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
