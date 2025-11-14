// src/app/api/suvery/[id]/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb"; // 💡 ตรวจสอบ Path ว่าถูกต้อง
import Suvery from '@/lib/models/suvery'; // 💡 ต้อง Import ชื่อ Model ด้วยตัวใหญ่

export async function GET(request, { params }) {
    try {
        await connectMongoDB(); // 💡 ต้องเรียกใช้ทุกครั้ง

        const { id } = params;

        // 💡 Mongoose Query: ต้องใช้ Suvery ที่ถูก Import
        const suvery = await Suvery.findOne({ _id: id });

        if (!suvery) {
            // ถ้าไม่พบจะตอบกลับ 404 (ซึ่งตอนนี้เกิดอยู่)
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