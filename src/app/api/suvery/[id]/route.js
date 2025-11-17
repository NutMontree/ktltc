// src/app/api/suvery/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Suvery from '@/lib/models/suvery';

// ========================
// GET: ดึงข้อมูลแบบสำรวจด้วย ID
// ========================
export async function GET(request, { params }) {
    try {
        const { id } = await params; // unwrap Promise
        await connectDB();

        // ใช้ findOne แทน findById เพื่อรองรับ string/custom ID
        const suvery = await Suvery.findOne({ _id: id });

        if (!suvery) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลแบบสำรวจ 🙁", id },
                { status: 404 }
            );
        }

        return NextResponse.json({ suvery }, { status: 200 });
    } catch (error) {
        console.error("Error fetching suvery entry:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการดึงข้อมูลแบบสำรวจ", error: error.message },
            { status: 500 }
        );
    }
}

// ========================
// PUT: อัปเดตข้อมูลแบบสำรวจด้วย ID
// ========================
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await connectDB();

        const updatedSuvery = await Suvery.findOneAndUpdate(
            { _id: id },     // ใช้ findOneAndUpdate แทน findByIdAndUpdate
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedSuvery) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลแบบสำรวจหรือ ID ไม่ถูกต้อง 🙁", id },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "อัปเดตข้อมูลสำรวจสำเร็จ ✅",
            suvery: updatedSuvery
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating suvery entry:", error);
        return NextResponse.json(
            { message: "ไม่สามารถอัปเดตข้อมูลสำรวจได้", error: error.message },
            { status: 500 }
        );
    }
}

// ========================
// DELETE: ลบข้อมูลแบบสำรวจด้วย ID
// ========================
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await connectDB();

        const deletedSuvery = await Suvery.findOneAndDelete({ _id: id });

        if (!deletedSuvery) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลแบบสำรวจหรือ ID ไม่ถูกต้อง 🙁", id },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "ลบข้อมูลสำรวจสำเร็จ ✅" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting suvery entry:", error);
        return NextResponse.json(
            { message: "ไม่สามารถลบข้อมูลสำรวจได้", error: error.message },
            { status: 500 }
        );
    }
}
