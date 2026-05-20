import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function copyRecursiveSync(src: string, dest: string, log: string[]) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), log);
    });
  } else {
    // Only copy if file doesn't exist or is different size
    if (!fs.existsSync(dest) || fs.statSync(src).size !== fs.statSync(dest).size) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
      log.push(`Copied: ${src} -> ${dest}`);
    }
  }
}

export async function GET() {
  const log: string[] = [];
  try {
    const cwd = process.cwd();
    // Path to the literal \\192.168.6.118\public folder
    const sourceDir = path.join(cwd, "\\\\192.168.6.118\\public");
    const targetDir = path.join(cwd, "public");
    
    log.push(`CWD: ${cwd}`);
    log.push(`Source directory: ${sourceDir} (exists: ${fs.existsSync(sourceDir)})`);
    log.push(`Target directory: ${targetDir} (exists: ${fs.existsSync(targetDir)})`);

    if (fs.existsSync(sourceDir)) {
      copyRecursiveSync(sourceDir, targetDir, log);
      log.push("Migration completed successfully!");
    } else {
      log.push("Source directory does not exist, nothing to migrate.");
    }

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, log });
  }
}
