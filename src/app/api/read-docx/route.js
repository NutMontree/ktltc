import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync("python d:\\ktltc\\scratch\\read_docx.py", { encoding: "utf8" });
    return NextResponse.json({ success: true, text: stdout });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
