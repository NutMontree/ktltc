// src/app/api/suvery/[id]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Suvery from "@/lib/models/suvery"; // ตรวจสอบว่าชื่อไฟล์ model ตรงกับที่มีอยู่จริง

// =======================================================
// 🚀 GET: ดึงข้อมูลแบบสำรวจรายบุคคล (By ID)
// =======================================================
export async function GET(request, { params }) {
    try {
        await connectDB();

        // ✅ รองรับ Next.js 15: ต้อง await params ก่อน
        const { id } = await params;

        // ใช้ findById สั้นและตรงความหมายกว่า findOne({ _id: id })
        const suvery = await Suvery.findById(id);

        if (!suvery) {
            return NextResponse.json({ message: "ไม่พบข้อมูลแบบสำรวจ" }, { status: 404 });
        }

        return NextResponse.json({ suvery }, { status: 200 });

    } catch (error) {
        console.error("Error fetching single suvery:", error);
        return NextResponse.json(
            { message: "Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// =======================================================
// 💾 PUT: อัปเดตข้อมูล (Update)
// =======================================================
export async function PUT(request, { params }) {
    try {
        await connectDB();

        // ✅ รองรับ Next.js 15
        const { id } = await params;

        const body = await request.json();

        // ตรวจสอบว่า ID ถูกต้องตาม format ของ MongoDB ก่อน query
        // เพื่อป้องกัน Server Crash ถ้าส่ง ID มั่วๆ มา
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        const updatedSuvery = await Suvery.findByIdAndUpdate(
            id,
            { $set: body },
            {
                new: true, // คืนค่าข้อมูลใหม่หลังอัปเดต
                runValidators: true // ✅ บังคับตรวจสอบกฎ (Validation) ใน Schema อีกครั้ง
            }
        );

        if (!updatedSuvery) {
            return NextResponse.json({ message: "ไม่พบข้อมูลที่จะอัปเดต" }, { status: 404 });
        }

        return NextResponse.json({
            message: "อัปเดตข้อมูลสำเร็จ",
            suvery: updatedSuvery
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating suvery:", error);

        // จัดการ Error กรณีข้อมูลซ้ำ (เช่น แก้ไปซ้ำกับ StudentID คนอื่น)
        if (error.code === 11000) {
            return NextResponse.json(
                { message: "ข้อมูลซ้ำ: รหัสนักศึกษานี้มีอยู่แล้ว" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// =======================================================
// 🗑️ DELETE: ลบข้อมูล (Delete)
// =======================================================
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        // ✅ รองรับ Next.js 15 (ถูกต้องแล้ว)
        const { id } = await params;

        // เชื่อมต่อ Database และลบข้อมูลโดยตรง
        const deletedSuvery = await Suvery.findByIdAndDelete(id);

        if (!deletedSuvery) {
            return NextResponse.json({ message: "ไม่พบข้อมูลที่จะลบ" }, { status: 404 });
        }

        return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting suvery:", error);
        return NextResponse.json(
            { message: "Server Error", error: error.message },
            { status: 500 }
        );
    }
}