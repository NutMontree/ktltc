import connectMongoDB from "@/lib/mongodb";
// ❌ เปลี่ยนจาก import suveryModel เป็น import Suvery
import Suvery from '../../../lib/models/suvery'
import { NextResponse } from "next/server";

// 💡 POST Handler: สำหรับรับข้อมูลสำรวจใหม่
export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.studentId || !body.fullName) {
            return NextResponse.json(
                { message: "รหัสนักศึกษาและชื่อ-สกุลเป็นข้อมูลที่จำเป็น" },
                { status: 400 }
            );
        }

        await connectMongoDB();
        // ✅ ใช้ Suvery.create(body);
        await Suvery.create(body);

        return NextResponse.json({ message: "บันทึกข้อมูลสำรวจสำเร็จ" }, { status: 201 });
    } catch (error) {
        console.error("Error creating suvery entry:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ", error: error.message },
            { status: 500 }
        );
    }
}

// 🚀 GET Handler: สำหรับดึงข้อมูลสำรวจทั้งหมด
export async function GET() {
    try {
        await connectMongoDB();
        // ✅ ใช้ Suvery.find();
        const suverys = await Suvery.find();
        return NextResponse.json({ suverys }, { status: 200 });

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

// 🗑️ DELETE Handler: สำหรับลบข้อมูลสำรวจตาม ID
export async function DELETE(request) {
    try {
        await connectMongoDB();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required" }, { status: 400 });
        }
        // ✅ ใช้ Suvery.findByIdAndDelete(id);
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


// ✏️ PUT Handler: สำหรับอัปเดตข้อมูลสำรวจตาม ID
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

        await connectMongoDB();

        // ✅ ใช้ Suvery.findByIdAndUpdate(id, updatedData, { new: true });
        const result = await Suvery.findByIdAndUpdate(id, updatedData, { new: true });

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