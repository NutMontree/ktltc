import connectMongoDB from "@/lib/mongodb";
// import suveryModel from "@/models/suvery";
import suveryModel from '../../../lib/models/suvery'
import { NextResponse } from "next/server";

// 💡 POST Handler: สำหรับรับข้อมูลสำรวจใหม่
export async function POST(request) {
    // ... (โค้ด POST เดิมของคุณ)
    try {
        const body = await request.json();

        if (!body.studentId || !body.fullName) {
            return NextResponse.json(
                { message: "รหัสนักศึกษาและชื่อ-สกุลเป็นข้อมูลที่จำเป็น" },
                { status: 400 }
            );
        }

        await connectMongoDB();
        // 💡 ใช้ suveryModel ที่ import มา
        await suveryModel.create(body);

        return NextResponse.json({ message: "บันทึกข้อมูลสำรวจสำเร็จ" }, { status: 201 });
    } catch (error) {
        console.error("Error creating suvery entry:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ", error: error.message },
            { status: 500 }
        );
    }
}

// 🚀 เพิ่ม GET Handler: สำหรับดึงข้อมูลสำรวจทั้งหมด
export async function GET() {
    try {
        await connectMongoDB(); // เชื่อมต่อฐานข้อมูล

        // 💡 ใช้ suveryModel ในการค้นหาข้อมูลทั้งหมด
        const suverys = await suveryModel.find(); // .find() จะดึงข้อมูลทั้งหมดใน Collection

        // คืนค่าข้อมูลในรูปแบบ JSON โดยใช้ key 'suverys' (ตามที่ใช้ Destructure ใน page.tsx)
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