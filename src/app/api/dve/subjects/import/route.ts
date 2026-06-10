import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PDFParse } from "pdf-parse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text;
    await parser.destroy();

    // Standard regex patterns for Thai vocational school timetables (สธ02/ศธ02)
    // 1. Subject Code: e.g., 30201-2001 or 20101-2002 or 3000-2001
    const codeMatch = text.match(/(\d{5}-\d{4})|(\d{4}-\d{4})/);
    const code = codeMatch ? codeMatch[0] : "";

    // 2. Subject Name: usually follows the subject code or is near it
    let name = "";
    if (code) {
      const escapedCode = code.replace("-", "\\-");
      const nameRegex = new RegExp(`${escapedCode}\\s+([^\\n\\r\\d\\(\\)]+)`, "i");
      const nameMatch = text.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }
    }

    // Fallback name parsing
    if (!name) {
      const nameMatch = text.match(/(?:วิชา|รายวิชา)\s*[:：]?\s*([^\n\r\d\(\)]+)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }
    }

    // Clean up name from standard trailing characters
    if (name) {
      name = name.replace(/^(แผนกวิชา|สาขาวิชา|กลุ่มวิชา)/, "").trim();
    }

    // 3. Department
    let department = "";
    const deptMatch = text.match(/(?:แผนกวิชา|แผนก|สาขาวิชา|สาขา)\s*([ก-ฮa-zA-Z\s]+)/);
    if (deptMatch && deptMatch[1]) {
      department = deptMatch[1].trim();
      if (!department.startsWith("แผนกวิชา")) {
        department = "แผนกวิชา" + department;
      }
    }

    // 4. Default timetable metrics
    let totalWeeks = 18;
    let daysPerWeek = 1;
    let hoursPerDay = 3;

    // Detect day of week (e.g. จันทร์, อังคาร)
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
    let dayOfWeek = "";
    for (const d of days) {
      if (text.includes(d)) {
        dayOfWeek = d;
        break;
      }
    }

    // Parse periods or hours
    const hoursMatch = text.match(/(\d+)\s*(?:คาบ|ชั่วโมง|ชม\.|ช\.ม\.)/i);
    if (hoursMatch && hoursMatch[1]) {
      hoursPerDay = parseInt(hoursMatch[1]);
    } else {
      const periodRangeMatch = text.match(/(?:คาบ|เวลา)\s*(\d+)\s*-\s*(\d+)/i);
      if (periodRangeMatch && periodRangeMatch[1] && periodRangeMatch[2]) {
        const start = parseInt(periodRangeMatch[1]);
        const end = parseInt(periodRangeMatch[2]);
        hoursPerDay = (end - start) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      subject: {
        code,
        name,
        department,
        totalWeeks,
        daysPerWeek,
        hoursPerDay,
        dayOfWeek,
      },
      rawText: text.substring(0, 1000),
    });
  } catch (error: any) {
    console.error("[Timetable Import Error]:", error);
    return NextResponse.json({ error: "Failed to parse PDF schedule file" }, { status: 500 });
  }
}
