import InternalPdca, { connectDB } from "@/app/models/InternalPdca";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

async function parseFormData(req) {
  const formData = await req.formData();
  const data = {};
  const fileUrls = [];
  const originalFileNames = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0 && key.startsWith("filepdf")) {
      // Global PDF uploads
      const buffer = Buffer.from(await value.arrayBuffer());
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = value.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filename = `${uniqueSuffix}-${safeName}`;
      
      const uploadDir = `${process.cwd()}/public/uploads/pdca`;
      await fs.mkdir(uploadDir, { recursive: true });
      const filepath = `${uploadDir}/${filename}`;
      await fs.writeFile(filepath, buffer);
      
      fileUrls.push(`/uploads/pdca/${filename}`);
      originalFileNames.push(value.name);
    } else if (key.startsWith("itempdf_") && value && value.name) {
      // Per-item PDF upload: key format is "itempdf_{itemId}"
      const itemId = key.replace("itempdf_", "");
      const buffer = Buffer.from(await value.arrayBuffer());
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = value.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filename = `${uniqueSuffix}-${safeName}`;
      
      const uploadDir = `${process.cwd()}/public/uploads/pdca`;
      await fs.mkdir(uploadDir, { recursive: true });
      const filepath = `${uploadDir}/${filename}`;
      await fs.writeFile(filepath, buffer);
      
      data[`pdf${itemId}`] = `/uploads/pdca/${filename}`;
      data[`pdfName${itemId}`] = value.name;
    } else {
      // Don't let empty pdf/pdfName values overwrite file uploads
      if ((key.startsWith("pdf") || key.startsWith("pdfName")) && !value) {
        continue;
      }
      // Don't overwrite pdf fields already set by itempdf_ upload
      if (key.match(/^pdf\d+$/) && data[key]) {
        continue;
      }
      if (key.match(/^pdfName\d+$/) && data[key]) {
        continue;
      }
      data[key] = value;
    }
  }

  data.fileUrl = fileUrls;
  data.originalFileName = originalFileNames;

  if (data.existingAttachments) {
    try {
      const existing = JSON.parse(data.existingAttachments);
      if (Array.isArray(existing)) {
        existing.forEach(att => {
          data.fileUrl.push(att.fileUrl);
          data.originalFileName.push(att.originalFileName);
        });
      }
    } catch (e) {}
    delete data.existingAttachments;
  }

  return data;
}

export async function GET() {
  try {
    await connectDB();
    const pdcas = await InternalPdca.find().sort({ createdAt: -1 });
    return NextResponse.json({ pdcas }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await parseFormData(req);
    const newPdca = await InternalPdca.create(data);
    return NextResponse.json({ message: "Success", pdca: newPdca }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
