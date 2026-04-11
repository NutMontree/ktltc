import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
export const dynamic = 'force-dynamic';

export async function GET() {
  const mapList = [
    "welder",
    "technology",
    "ordinary",
    "mechanic",
    "hotel",
    "electronics",
    "electricity",
    "construct",
    "accounting"
  ];
  
  const filesToRestore = mapList.map(dept => `src/app/(website)/${dept}/page.tsx`).join(" ");

  try {
    const cwd = process.cwd();
    const { stdout, stderr } = await execAsync(`git checkout -- ${filesToRestore}`, { cwd });
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
