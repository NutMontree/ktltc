// src/app/api/suvery/[id]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Suvery from '@/lib/models/suvery'; // ตรวจสอบ Path และชื่อ Model อีกครั้ง (ในตัวอย่างใช้ตัวใหญ่)

// -----------------------------------------------------------------
// 🚀 GET: ดึงข้อมูลแบบสำรวจด้วย ID
// -----------------------------------------------------------------
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        // ใช้ findOne หรือ findById() ก็ได้
        const suvery = await Suvery.findOne({ _id: id });

        if (!suvery) {
            return NextResponse.json({ message: "Suvery entry not found" }, { status: 404 });
        }

        return NextResponse.json({ suvery }, { status: 200 });

    } catch (error) {
        console.error("Error fetching single suvery entry:", error);
        return NextResponse.json(
            { message: "Failed to fetch suvery entry", error: error.message },
            { status: 500 }
        );
    }
}

// -----------------------------------------------------------------
// 💾 PUT: อัปเดตข้อมูลแบบสำรวจด้วย ID
// -----------------------------------------------------------------
export async function PUT(request, { params }) {
    try {
        await connectDB(); // เชื่อมต่อฐานข้อมูล

        const { id } = params;
        const body = await request.json(); // อ่านข้อมูลที่ส่งมาจากฟอร์ม (SuveryEditForm)

        // 💡 Mongoose Query: ใช้ findByIdAndUpdate เพื่ออัปเดตข้อมูลตาม ID
        const updatedSuvery = await Suvery.findByIdAndUpdate(
            id,
            { $set: body }, // $set จะอัปเดตเฉพาะฟิลด์ที่มีใน body
            { new: true, runValidators: true } // new: true เพื่อรับค่าที่อัปเดตแล้ว
        );

        if (!updatedSuvery) {
            // ถ้าไม่พบ ID ในฐานข้อมูล (หรือ ID ผิดรูปแบบ)
            return NextResponse.json({ message: "Suvery entry not found or invalid ID" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Suvery updated successfully",
            suvery: updatedSuvery
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating single suvery entry:", error);
        return NextResponse.json(
            { message: "Failed to update suvery entry", error: error.message },
            { status: 500 }
        );
    }
}