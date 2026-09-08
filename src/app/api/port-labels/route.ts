import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ใช้ไฟล์ JSON ในการเก็บชื่อที่ผู้ใช้ตั้งชั่วคราว (ถ้ามี MongoDB สามารถเปลี่ยนไปบันทึกใน DB ได้)
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'portLabels.json');

// Helper function to ensure file exists
const ensureDataFile = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}), 'utf-8');
  }
};

export async function GET() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return NextResponse.json({ success: true, data: JSON.parse(data) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, port, label } = body;

    if (!ip || !port) {
      return NextResponse.json({ success: false, error: 'IP and Port are required' }, { status: 400 });
    }

    ensureDataFile();
    const currentData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    if (!currentData[ip]) {
      currentData[ip] = {};
    }
    
    currentData[ip][port] = label;

    fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: currentData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
