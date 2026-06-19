import { execSync } from "child_process";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const output = execSync("python d:\\ktltc\\scratch\\read_docx.py", { encoding: "utf8" });
    return NextResponse.json({ success: true, text: output });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
