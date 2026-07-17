import InternalPdca, { connectDB } from "@/app/models/InternalPdca";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
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
      console.log(`Saved itempdf_${itemId} to ${data[`pdf${itemId}`]}`);
    } else {
      if (key.startsWith("itempdf_")) {
         console.log("itempdf_ fell into else block!", { key, valueType: typeof value, isFile: value instanceof File, hasName: !!value?.name });
      }
      // Don't overwrite pdf fields already set by an itempdf_ upload in this same request
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

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const pdca = await InternalPdca.findById(id);
    return NextResponse.json({ pdca }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await parseFormData(req);
    
    const existingPdca = await InternalPdca.findById(id);
    if (!existingPdca) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const session = await auth();
    const adminRoles = ["super_admin"];
    const isAdmin = session?.user?.role && adminRoles.includes(session.user.role.toLowerCase());
    const isOwner = session?.user?.id && existingPdca.userId === session.user.id;
    
    // Allow edit only if user is owner or admin
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Unauthorized to edit this document" }, { status: 403 });
    }

    const updated = await InternalPdca.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ message: "Updated", pdca: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Find the document to get the file URLs before deleting
    const pdcaToDelete = await InternalPdca.findById(id);
    if (!pdcaToDelete) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const session = await auth();
    const adminRoles = ["super_admin"];
    const isAdmin = session?.user?.role && adminRoles.includes(session.user.role.toLowerCase());
    const isOwner = session?.user?.id && pdcaToDelete.userId === session.user.id;
    
    // Allow delete only if user is owner or admin
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Unauthorized to delete this document" }, { status: 403 });
    }

    if (pdcaToDelete && pdcaToDelete.fileUrl && Array.isArray(pdcaToDelete.fileUrl)) {
      for (const fileUrl of pdcaToDelete.fileUrl) {
        if (fileUrl.startsWith('/uploads/pdca/')) {
          const filename = fileUrl.replace('/uploads/pdca/', '');
          const filepath = `${process.cwd()}/public/uploads/pdca/${filename}`;
          try {
            await fs.unlink(filepath);
          } catch (e) {
            console.error(`Failed to delete file: ${filepath}`, e);
          }
        }
      }
    }

    await InternalPdca.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
