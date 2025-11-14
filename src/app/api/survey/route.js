import connectMongoDB from "@/lib/mongodb";
// import Survey from "@/models/Survey"; // นำเข้า Model ที่สร้างใหม่
import Survey from "../../../lib/models/Survey";
import { NextResponse } from "next/server";

// 💡 POST Handler: สำหรับรับข้อมูลสำรวจใหม่
export async function POST(request) {
    try {
        const body = await request.json();

        // 💡 ตรวจสอบข้อมูลขั้นพื้นฐานที่จำเป็น
        if (!body.studentId || !body.fullName) {
            return NextResponse.json(
                { message: "รหัสนักศึกษาและชื่อ-สกุลเป็นข้อมูลที่จำเป็น" },
                { status: 400 }
            );
        }

        await connectMongoDB(); // เชื่อมต่อฐานข้อมูล

        // 💡 สร้างเอกสารใหม่ใน Collection 'surveys'
        await Survey.create(body);

        return NextResponse.json({ message: "บันทึกข้อมูลสำรวจสำเร็จ" }, { status: 201 });
    } catch (error) {
        console.error("Error creating survey entry:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ", error: error.message },
            { status: 500 }
        );
    }
}