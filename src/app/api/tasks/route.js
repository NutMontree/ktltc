// my-projext/src/app/api/tasks/route.js

// import connectDB from '@/lib/mongodb';
import connectDB from "../../../lib/mongodb"
import Task from '@/lib/models/Task';
import { NextResponse } from 'next/server';

// 2. มีหน้ากรอกข้อมูล POST ส่งข้อมูลไป Mongoose
export async function POST(request) {
    const { title, description } = await request.json();
    await connectDB();
    await Task.create({ title, description });
    return NextResponse.json({ message: 'Task created' }, { status: 201 });
}

// 1. มีหน้า dashbord เพื่อแสดงข้อมูลทั้งหมด
export async function GET() {
    await connectDB();
    const tasks = await Task.find();
    return NextResponse.json({ tasks });
}