import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const termYear = searchParams.get("termYear");
    const status = searchParams.get("status");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (termYear && termYear !== "") {
      // termYear string is like "1/2567"
      const [term, year] = termYear.split("/");
      if (term && year) {
        query.term = term;
        query.academicYear = year;
      }
    }

    const records = await db
      .collection("supervision_records")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Failed to fetch supervision records:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // validate basic requirements
    if (!body.academicYear || !body.term || !body.supervisionFormat || !body.weekNumber || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน กรุณากรอกฟิลด์บังคับให้ครบ" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newRecord = {
      academicYear: body.academicYear,
      term: body.term,
      supervisionFormat: body.supervisionFormat,
      weekNumber: body.weekNumber,
      startDate: body.startDate,
      endDate: body.endDate,
      status: "รอตรวจสอบ",
      createdBy: body.createdBy || null,
      createdAt: new Date(),
    };

    const result = await db.collection("supervision_records").insertOne(newRecord);

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อยแล้ว",
      insertedId: result.insertedId
    });

  } catch (error) {
    console.error("Failed to create supervision record:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("supervision_records").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Failed to update supervision record:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("supervision_records").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Failed to delete supervision record:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
