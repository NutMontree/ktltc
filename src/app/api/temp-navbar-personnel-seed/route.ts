import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/temp-navbar-personnel-seed
 *
 * Seed / sync "ข้อมูลบุคลากร" navbar parent + all department children.
 * Run once from browser while logged in as super_admin.
 * Safe to re-run – uses upsert by label+parentId.
 */
export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role?.toLowerCase();

    if (role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const col = db.collection("navbar");

    // 1. หาหรือสร้าง parent "ข้อมูลบุคลากร"
    let parent = await col.findOne({ label: "ข้อมูลบุคลากร", parentId: null });

    if (!parent) {
      // นับจำนวน parent ที่มีอยู่เพื่อกำหนด order ถัดไป
      const count = await col.countDocuments({ parentId: null });
      const inserted = await col.insertOne({
        label: "ข้อมูลบุคลากร",
        path: "/personnel",
        order: count + 1,
        parentId: null,
        createdAt: new Date(),
      });
      parent = await col.findOne({ _id: inserted.insertedId });
    }

    if (!parent) {
      return NextResponse.json({ error: "Could not create parent menu" }, { status: 500 });
    }

    const parentId = parent._id.toString();

    // 2. รายการเมนูย่อยทั้งหมดของ "ข้อมูลบุคลากร"
    const departments = [
      { label: "ทำเนียบผู้บริหาร",               path: "/executiveboard",  order: 1 },
      { label: "แผนกวิชาช่างยนต์",                path: "/mechanic",        order: 2 },
      { label: "แผนกวิชาช่างกลโรงงาน",            path: "/machine",         order: 3 },
      { label: "แผนกวิชาช่างเชื่อมโลหะ",           path: "/welder",          order: 4 },
      { label: "แผนกวิชาช่างไฟฟ้ากำลัง",           path: "/electricity",     order: 5 },
      { label: "แผนกวิชาช่างอิเล็กทรอนิกส์",       path: "/electronics",     order: 6 },
      { label: "แผนกวิชาช่างเทคนิคพื้นฐาน",        path: "/technique",       order: 7 },
      { label: "แผนกวิชาช่างก่อสร้าง",             path: "/construct",       order: 8 },
      { label: "แผนกวิชาการบัญชี",                path: "/accounting",      order: 9 },
      { label: "แผนกวิชาการตลาด",                 path: "/marketing",       order: 10 },
      { label: "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",  path: "/technology",      order: 11 },
      { label: "แผนกวิชาการโรงแรม",               path: "/hotel",           order: 12 },
      { label: "แผนกวิชาสามัญสัมพันธ์",            path: "/ordinary",        order: 13 },
      { label: "แผนกวิชายานยนต์ไฟฟ้า",            path: "/ev",              order: 14 },
      { label: "แผนกวิชาการตลาด/โลจิสติก์",       path: "/logistics",       order: 15 },
    ];

    const results: string[] = [];

    for (const dept of departments) {
      // ตรวจว่ามีอยู่แล้วหรือไม่
      const existing = await col.findOne({ label: dept.label, parentId });

      if (existing) {
        // อัปเดต path และ order ให้ถูกต้อง
        await col.updateOne(
          { _id: existing._id },
          { $set: { path: dept.path, order: dept.order, parentId, updatedAt: new Date() } }
        );
        results.push(`✅ updated: ${dept.label}`);
      } else {
        await col.insertOne({
          label: dept.label,
          path: dept.path,
          order: dept.order,
          parentId,
          createdAt: new Date(),
        });
        results.push(`➕ created: ${dept.label}`);
      }
    }

    // 3. ลบรายการที่ไม่อยู่ในรายการข้างบน (เพื่อ sync ให้ตรงเสมอ)
    const validLabels = departments.map((d) => d.label);
    const deleteResult = await col.deleteMany({
      parentId,
      label: { $nin: validLabels },
    });

    return NextResponse.json({
      success: true,
      parentId,
      results,
      deleted: deleteResult.deletedCount,
      message: `Sync สำเร็จ: ${results.length} รายการ, ลบออก: ${deleteResult.deletedCount} รายการ`,
    });
  } catch (error) {
    console.error("Seed navbar personnel error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
