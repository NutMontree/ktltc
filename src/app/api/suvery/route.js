// import connectDB from "@/lib/mongodb";
import connectDB from '../../../lib/mongodb';
import Suvery from '../../../lib/models/suvery'
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // 💡 เพิ่มการ import Mongoose เพื่อตรวจสอบ ObjectId

// =======================================================
// 💡 POST Handler: สำหรับรับข้อมูลสำรวจใหม่ (Create)
// =======================================================
// ในไฟล์ route.js/ts (เฉพาะฟังก์ชัน POST)
export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.studentId || !body.fullName) {
            return NextResponse.json(
                { message: "รหัสนักศึกษาและชื่อ-สกุลเป็นข้อมูลที่จำเป็น" },
                { status: 400 }
            );
        }

        await connectDB();
        await Suvery.create(body);

        return NextResponse.json({ message: "บันทึกข้อมูลสำรวจสำเร็จ" }, { status: 201 });
    } catch (error) {
        console.error("Error creating suvery entry:", error);

        // ✅ การจัดการ E11000 Duplicate Key Error
        if (error.code === 11000) {
            // ดึงชื่อฟิลด์ที่มีปัญหาจาก error (เช่น studentId)
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json(
                {
                    message: `ข้อมูลซ้ำ: รหัส ${field} นี้มีอยู่ในระบบแล้ว`,
                    field: field,
                    value: error.keyValue[field]
                },
                { status: 409 } // 409 Conflict เป็นสถานะที่เหมาะสมสำหรับการขัดแย้งของทรัพยากร
            );
        }

        // ข้อผิดพลาด Server อื่นๆ ที่ไม่ได้เกิดจาก E11000
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ", error: error.message },
            { status: 500 }
        );
    }
}
// =======================================================
// 🚀 GET Handler: ดึงข้อมูลทั้งหมด หรือ ดึงข้อมูลเดียวตาม ID
// =======================================================
export async function GET(request) {
    try {
        await connectDB();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (id) {
            // --- 1. GET by ID (สำหรับหน้าแก้ไข) ---
            // ตรวจสอบ ID format ก่อนเพื่อป้องกัน Mongoose error
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
            }

            const suvery = await Suvery.findById(id);

            if (!suvery) {
                return NextResponse.json({ message: `Suvery with ID ${id} not found.` }, { status: 404 });
            }
            return NextResponse.json({ suvery }, { status: 200 });

        } else {
            // --- 2. GET All (สำหรับหน้า Dashboard/รายการ) ---
            const suverys = await Suvery.find();
            return NextResponse.json({ suverys }, { status: 200 });
        }

    } catch (error) {
        console.error("Error fetching suvery entries:", error);
        return NextResponse.json(
            {
                message: "เกิดข้อผิดพลาดในการดึงข้อมูลสำรวจ",
                error: error.message
            },
            { status: 500 }
        );
    }
}

// =======================================================
// 🗑️ DELETE Handler: สำหรับลบข้อมูลสำรวจตาม ID
// =======================================================
export async function DELETE(request) {
    try {
        await connectDB();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required" }, { status: 400 });
        }
        // ตรวจสอบ ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        const result = await Suvery.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ message: `Suvery with ID ${id} not found.` }, { status: 404 });
        }
        return NextResponse.json({ message: "Suvery deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("❌ SERVER DELETE ERROR:", error);
        return NextResponse.json({
            message: "Failed to delete suvery due to server error.",
            error: (error).message
        }, { status: 500 });
    }
}


// =======================================================
// ✏️ PUT Handler: สำหรับอัปเดตข้อมูลสำรวจตาม ID
// =======================================================
export async function PUT(request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const updatedData = await request.json();

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required for update" }, { status: 400 });
        }
        if (!updatedData || Object.keys(updatedData).length === 0) {
            return NextResponse.json({ message: "Update data is required" }, { status: 400 });
        }
        // ตรวจสอบ ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        await connectDB();

        const result = await Suvery.findByIdAndUpdate(id,
            updatedData,
            {
                new: true, // คืนค่าข้อมูลใหม่
                runValidators: true // ✅ บังคับใช้กฎ Validation ใน Schema อีกครั้งตอนอัปเดต
            });

        if (!result) {
            return NextResponse.json({ message: `Suvery with ID ${id} not found.` }, { status: 404 });
        }

        return NextResponse.json({ message: "Suvery updated successfully", suvery: result }, { status: 200 });

    } catch (error) {
        console.error("❌ SERVER PUT (UPDATE) ERROR:", error);
        return NextResponse.json({
            message: "Failed to update suvery due to server error.",
            error: error.message
        }, { status: 500 });
    }
}