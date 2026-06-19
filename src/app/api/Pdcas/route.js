import Pdca from "@/app/models/Pdca";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { auth } from "@/auth";

// --- ฟังก์ชันช่วย: parseFormData ---

// แปลง FormData ของ Next.js เป็น object และจัดการการอัปโหลดไฟล์
async function parseFormData(req) {
  const formData = await req.formData();
  const data = {};
  const attachments = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0 && key.startsWith("filepdf")) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = value.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filename = `${uniqueSuffix}-${safeName}`;
      
      const uploadDir = `${process.cwd()}/public/uploads/pdca`;
      await fs.mkdir(uploadDir, { recursive: true });
      const filepath = `${uploadDir}/${filename}`;
      await fs.writeFile(filepath, buffer);
      
      const url = `/uploads/pdca/${filename}`;
      attachments.push({ fileUrl: url, originalFileName: value.name });
    } else {
      data[key] = value;
    }
  }

  // Handle multiple attachments
  if (attachments.length > 0) {
    data.attachments = attachments;
    // Backward compatibility for single file
    data.fileUrl = attachments[0].fileUrl;
    data.originalFileName = attachments[0].originalFileName;
  }

  // Process existing attachments passed from frontend
  if (data.existingAttachments) {
    try {
      const existing = JSON.parse(data.existingAttachments);
      if (Array.isArray(existing)) {
        data.attachments = [...existing, ...(data.attachments || [])];
      }
    } catch (e) {
      console.error("Error parsing existing attachments:", e);
    }
    delete data.existingAttachments;
  }

  return data;
}

export async function GET() {
  try {
    const pdcas = await Pdca.find().sort({ createdAt: -1 });
    return NextResponse.json({ pdcas }, { status: 200 });
  } catch (err) {
    console.error("❌ PDCA fetch error:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let pdcaData = {};

    if (contentType.includes("multipart/form-data")) {
      pdcaData = await parseFormData(req);
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      pdcaData = body.formData || body;
    } else {
      return NextResponse.json({ message: "Unsupported content type" }, { status: 400 });
    }

    const session = await auth();
    if (session?.user) {
      pdcaData.userId = session.user.id;
      pdcaData.authorName = session.user.name;
      pdcaData.authorImage = session.user.image;
      pdcaData.authorRole = session.user.role;
    }

    const newPdca = await Pdca.create(pdcaData);

    return NextResponse.json({ message: "Create Pdca Success", pdca: newPdca }, { status: 201 });
  } catch (err) {
    console.error("❌ PDCA Create error:", err);
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
