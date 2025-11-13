// my-projext/src/app/api/tasks/[id]/route.js

import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { NextResponse } from 'next/server';

// 4. การแก้ไขและลบข้อมูล จะต้อง แก้ไขจาก ข้อมูล id
// GET (สำหรับหน้าแก้ไขข้อมูล)
export async function GET(request, { params }) {
    const { id } = params;
    await connectDB();
    const task = await Task.findOne({ _id: id });
    return NextResponse.json({ task }, { status: 200 });
}

// 3. หน้า dashboerd สามารถ แก้ไขข้อมูล
export async function PUT(request, { params }) {
    const { id } = params;
    const { newTitle: title, newDescription: description } = await request.json();
    await connectDB();

    await Task.findByIdAndUpdate(id, { title, description });

    return NextResponse.json({ message: 'Task updated' }, { status: 200 });
}

// 3. หน้า dashboerd สามารถ ลบข้อมูลได้
export async function DELETE(request, { params }) {
    const { id } = params;
    await connectDB();

    await Task.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
}