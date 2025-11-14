// src/app/api/suvery/[id]/route.js (ฉบับแก้ไขครั้งที่ 3)

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Suvery from '@/lib/models/suvery';

// 💡 GET Handler: รับ context เพื่อหลีกเลี่ยง Promise Error
export async function GET(request, context) {
    try {
        await connectMongoDB();
        const { id } = context.params; // ✅ ใช้ context.params

        if (!id) {
            // 💡 เพิ่มการจัดการกรณีที่ ID เป็น undefined หรือ null
            return NextResponse.json({ message: "ID is missing in the route." }, { status: 400 });
        }

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

// 💡 PUT Handler:
export async function PUT(request, context) {
    try {
        const { id } = context.params; // ✅ ใช้ context.params
        const updatedData = await request.json();

        if (!id) {
            return NextResponse.json({ message: "ID is missing in the route." }, { status: 400 });
        }

        // ... (ส่วนการอัปเดตข้อมูล)

        return NextResponse.json({ message: "Suvery updated successfully", suvery: result }, { status: 200 });

    } catch (error) {
        console.error("❌ SERVER PUT (UPDATE) ERROR:", error);
        return NextResponse.json({
            message: "Failed to update suvery due to server error.",
            error: error.message
        }, { status: 500 });
    }
}